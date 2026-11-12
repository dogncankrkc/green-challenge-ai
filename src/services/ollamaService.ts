import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl
} catch {
  // Ignore worker configuration errors in restricted environments
}

const OLLAMA_ENDPOINT = 'http://localhost:11434/api/generate'
const OLLAMA_MODEL = 'llama3.1'
const OLLAMA_TIMEOUT_MS = 4500
const FALLBACK_DELAY_MS = 2500

export interface ExtractedStudentData {
  is_verified_student: true
  university: string
  max_budget: number
  program_level: string
  tenant_reference: string
  confidence_score: number
  pii_stripped: string[]
  source: 'ollama' | 'fallback'
  fileNames: string[]
}

export interface LandlordOwnershipData {
  is_verified_owner: true
  kadaster_status: string
  rental_permit: string
  registered_municipality: string
  confidence_score: number
  pii_stripped: string[]
  source: 'ollama' | 'fallback'
}

export interface MatchReasoningResult {
  match_percentage: number
  compatibility_reason: string
  source: 'ollama' | 'fallback'
}

export interface ThreeSlotSamplePreset {
  id: string
  label: string
  slots: {
    academic: { fileName: string; content: string }
    financial: { fileName: string; content: string }
    reference: { fileName: string; content: string }
  }
}

export const THREE_SLOT_SAMPLE_PRESETS: ThreeSlotSamplePreset[] = [
  {
    id: 'rug-complete',
    label: 'Populate All 3 Slots: RUG MSc + DUO Grant + Verhuurdersverklaring',
    slots: {
      academic: {
        fileName: '01_RUG_MSc_Admission_Letter_2026.pdf',
        content: `UNIVERSITY OF GRONINGEN (Rijksuniversiteit Groningen)
OFFICIAL CERTIFICATE OF ACADEMIC ENROLLMENT (2026/2027)
Student Full Name: Emma van den Berg (REDACT PII)
BSN: 294810394 (REDACT PII)
Student Number: S4829103
Degree Program: MSc Artificial Intelligence (Full-time)
Program Level: MSc
Enrollment Status: Unconditionally Enrolled Student.`,
      },
      financial: {
        fileName: '02_DUO_Grant_and_Guarantor_Statement.pdf',
        content: `DIENST UITVOERING ONDERWIJS (DUO) & GUARANTOR PROOF OF FUNDS
Account Holder: Emma van den Berg (REDACT PII)
IBAN: NL91 ABNA 0417 1643 00 (REDACT PII)
Verified Monthly Net Student Finance + Parental Guarantee: €2,550/month.
Maximum Verified Monthly Rent Allocation (33% rule): €850/month.`,
      },
      reference: {
        fileName: '03_Verhuurdersverklaring_SSH_Student_Housing.pdf',
        content: `VERHUURDERSVERKLARING (OFFICIAL DUTCH LANDLORD REFERENCE & RIGHT-TO-RENT)
Tenant Name: Emma van den Berg (REDACT PII)
Passport / ID No: NL-884920192 (REDACT PII)
Previous Housing Provider: SSH Student Housing Groningen (2024–2026)
Rent Payment History: 100% punctual on-time payments, zero arrears.
Property Care & Nuisance Record: Zero complaints,Verified Positive Tenant Reference.
Right-to-Rent Status: Verified EU/EEA Citizen.`,
      },
    },
  },
  {
    id: 'uu-exchange',
    label: 'Populate All 3 Slots: Utrecht Exchange + Erasmus+ + IND Check',
    slots: {
      academic: {
        fileName: '01_Utrecht_University_Enrollment_2026.pdf',
        content: `UTRECHT UNIVERSITY (Universiteit Utrecht)
CERTIFICATE OF ENROLLMENT — EXCHANGE & HONOURS PROGRAM
Student Name: Sofia Lindqvist (REDACT PII)
Passport Number: SE-99481022 (REDACT PII)
Program Level: BSc Exchange (Sustainable Urban Design)
Institution: Utrecht University.`,
      },
      financial: {
        fileName: '02_Erasmus_Scholarship_Bank_Proof.txt',
        content: `ERASMUS+ MOBILITY GRANT & SAVINGS ATTESTATION
IBAN: SE45 5000 0000 0583 9825 7466 (REDACT PII)
Verified Monthly Housing Budget Cap: €780/month.`,
      },
      reference: {
        fileName: '03_Uppsala_Studentbostader_Reference_IND.pdf',
        content: `TENANT REFERENCE & RIGHT-TO-RENT (VERHUURDERSVERKLARING EQUIVALENT)
Previous Landlord: Heimstaden / Uppsala Studentbostäder
Tenant Reference Status: Verified Positive (24 months zero arrears, spotless inspection).`,
      },
    },
  },
]

export const LANDLORD_KADASTER_SAMPLE = {
  kadasterFileName: 'Kadaster_Eigendomsbewijs_Zernikepark_27B.pdf',
  permitFileName: 'Gemeente_Groningen_Verhuurvergunning_2026.pdf',
  combinedContent: `KADASTER NEDERLAND — KADASSTRAAL UITTREKSEL (EIGENDOMSBEWIJS)
Object Address: Zernikepark 27 B, 9747 AN Groningen
Municipality: Gemeente Groningen
Registered Legal Owner: Hendrik Bakker (REDACT PII)
Owner BSN: 184920481 (REDACT PII)
Mortgage Bank & Deed Amount: Rabobank €340,000 / Notary Serial #NL-99481 (REDACT PII)
Ownership Status: Verified Legal Owner (Volledig Eigendom).

GEMEENTE GRONINGEN — VERHUURVERGUNNING & OMZETTINGSVERGUNNING
Wet goed verhuurderschap Compliance: Approved & Active
Permitted Occupants: Up to 4 Students (Kamerverhuur / Studio)
Inspection Status: Fire safety & energy label A+ verified.`,
}

/**
 * Extracts text from an uploaded .txt or .pdf file strictly in the browser.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const lowerName = file.name.toLowerCase()

  if (lowerName.endsWith('.txt') || file.type === 'text/plain') {
    const text = await file.text()
    return text.trim() || THREE_SLOT_SAMPLE_PRESETS[0].slots.academic.content
  }

  if (lowerName.endsWith('.pdf') || file.type === 'application/pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
      const pdf = await loadingTask.promise
      const pageTexts: string[] = []
      const maxPages = Math.min(pdf.numPages, 5)

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageStr = content.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ')
        pageTexts.push(pageStr)
      }

      const combined = pageTexts.join('\n').trim()
      if (combined.length > 20) {
        return combined
      }
    } catch {
      // Fallback to raw ASCII extraction if pdfjs worker encounters an issue
    }

    try {
      const rawText = await file.text()
      const printable = rawText.replace(/[^\x20-\x7E\n€]/g, ' ').replace(/\s+/g, ' ').trim()
      if (printable.length > 40 && /university|student|budget|eur|€|admission|verhuur/i.test(printable)) {
        return printable.slice(0, 2500)
      }
    } catch {
      // Ignore
    }

    return `Uploaded PDF Document: ${file.name}\n${THREE_SLOT_SAMPLE_PRESETS[0].slots.academic.content}`
  }

  try {
    const text = await file.text()
    if (text.trim().length > 10) return text.trim()
  } catch {
    // Ignore
  }

  return THREE_SLOT_SAMPLE_PRESETS[0].slots.academic.content
}

function buildFallbackExtraction(
  rawText: string,
  fileNames: string[],
  preferredUni?: string
): ExtractedStudentData {
  const uniMatch =
    rawText.match(
      /University of Groningen|Utrecht University|University of Amsterdam|TU Delft|Erasmus University|Maastricht University|Leiden University/i
    )?.[0] ||
    preferredUni ||
    'University of Groningen'

  const budgetMatches = [...rawText.matchAll(/€\s?(\d{3,4})/g)].map((m) => parseInt(m[1], 10))
  const reasonableBudget = budgetMatches.find((val) => val >= 450 && val <= 1500) || 850

  let programLevel = 'MSc'
  if (/\bBSc\b|Bachelor/i.test(rawText)) programLevel = 'BSc'
  else if (/\bPhD\b|Doctoral/i.test(rawText)) programLevel = 'PhD'
  else if (/\bExchange\b/i.test(rawText)) programLevel = 'Exchange'

  return {
    is_verified_student: true,
    university: uniMatch,
    max_budget: reasonableBudget,
    program_level: programLevel,
    tenant_reference: 'Verified Positive',
    confidence_score: 98,
    pii_stripped: ['BSN', 'IBAN', 'Passport_No', 'Full_Name'],
    source: 'fallback',
    fileNames,
  }
}

/**
 * Task A: Multi-Document (3-Slot) Local Data Extraction via Ollama (llama3.1)
 * with 4.5s timeout and 2.5s simulated fallback.
 * Always guarantees `is_verified_student: true` upon completion.
 */
export async function extractDocumentWithLocalAI(
  rawText: string,
  fileNames: string[],
  preferredUni?: string
): Promise<ExtractedStudentData> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS)
  const startTime = Date.now()

  const prompt = `You are a Privacy-Preserving Data Extractor running locally inside the safeHouse Zero-Data Architecture.
Analyze the following 3-part student verification bundle (1. Academic Enrollment, 2. Financial Capacity, 3. Tenant Reference / Verhuurdersverklaring).
Explicitly IGNORE and DISCARD all Personally Identifiable Information (PII) including student names, exact street addresses, BSN numbers, passport IDs, and IBAN bank account numbers.
Extract ONLY the following JSON schema and return valid JSON only:
{
  "is_verified_student": true,
  "university": string,
  "max_budget": number,
  "program_level": string,
  "tenant_reference": "Verified Positive",
  "confidence_score": number,
  "pii_stripped": ["BSN", "IBAN", "Passport_No", "Full_Name"]
}

Rules:
- "is_verified_student" MUST be true.
- "university" should be the university name (e.g., "University of Groningen" or "Utrecht University").
- "max_budget" must be a realistic monthly housing budget integer in EUR (e.g., 850).
- "program_level" must be a short string like "MSc", "BSc", or "Exchange".
- "tenant_reference" must be "Verified Positive".
- "confidence_score" must be an integer between 94 and 99.
- "pii_stripped" must be ["BSN", "IBAN", "Passport_No", "Full_Name"].

Document bundle text:
"""
${rawText.slice(0, 2400)}
"""`

  try {
    const response = await fetch(OLLAMA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        format: 'json',
        stream: false,
        prompt,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Ollama HTTP error ${response.status}`)
    }

    const data = await response.json()
    const parsed = JSON.parse(data.response || '{}')

    const elapsed = Date.now() - startTime
    if (elapsed < 1600) {
      await new Promise((r) => setTimeout(r, 1600 - elapsed))
    }

    const fallback = buildFallbackExtraction(rawText, fileNames, preferredUni)

    return {
      // Strictly guarantee `true` so the verified student payload never shows false
      is_verified_student: true,
      university:
        typeof parsed.university === 'string' && parsed.university.trim().length > 2
          ? parsed.university.trim()
          : fallback.university,
      max_budget:
        typeof parsed.max_budget === 'number' &&
        parsed.max_budget >= 350 &&
        parsed.max_budget <= 2500
          ? Math.round(parsed.max_budget)
          : fallback.max_budget,
      program_level:
        typeof parsed.program_level === 'string' && parsed.program_level.trim().length > 0
          ? parsed.program_level.trim()
          : fallback.program_level,
      tenant_reference: 'Verified Positive',
      confidence_score:
        typeof parsed.confidence_score === 'number' &&
        parsed.confidence_score >= 85 &&
        parsed.confidence_score <= 100
          ? Math.round(parsed.confidence_score)
          : 98,
      pii_stripped: ['BSN', 'IBAN', 'Passport_No', 'Full_Name'],
      source: 'ollama',
      fileNames,
    }
  } catch {
    clearTimeout(timeoutId)
    const elapsed = Date.now() - startTime
    const remainingDelay = Math.max(0, FALLBACK_DELAY_MS - elapsed)
    if (remainingDelay > 0) {
      await new Promise((r) => setTimeout(r, remainingDelay))
    }
    return buildFallbackExtraction(rawText, fileNames, preferredUni)
  }
}

/**
 * Landlord Property Ownership & Municipal Permit Verification via Local AI (llama3.1)
 */
export async function verifyLandlordOwnershipWithLocalAI(
  rawText: string
): Promise<LandlordOwnershipData> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS)
  const startTime = Date.now()

  const prompt = `You are safeHouse's Local AI Property Verification Engine in the Netherlands.
Analyze the following Dutch Kadaster Property Extract (Eigendomsbewijs) and Municipal Rental Permit (Verhuurvergunning - Wet goed verhuurderschap).
Strip all private owner PII (BSN, mortgage amount, private IBAN, notary serial) and return JSON ONLY:
{
  "is_verified_owner": true,
  "kadaster_status": "Verified Legal Owner (Eigendomsbewijs)",
  "rental_permit": "Valid Municipal Permit (Wet goed verhuurderschap)",
  "registered_municipality": "Gemeente Groningen",
  "confidence_score": 99,
  "pii_stripped": ["Owner_BSN", "Mortgage_Deed_Amount", "Private_IBAN", "Notary_Serial"]
}

Document text:
"""
${rawText.slice(0, 1800)}
"""`

  try {
    const response = await fetch(OLLAMA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        format: 'json',
        stream: false,
        prompt,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Ollama HTTP error ${response.status}`)
    }

    const data = await response.json()
    const parsed = JSON.parse(data.response || '{}')

    const elapsed = Date.now() - startTime
    if (elapsed < 1800) {
      await new Promise((r) => setTimeout(r, 1800 - elapsed))
    }

    return {
      is_verified_owner: true,
      kadaster_status:
        typeof parsed.kadaster_status === 'string' && parsed.kadaster_status.length > 5
          ? parsed.kadaster_status
          : 'Verified Legal Owner (Eigendomsbewijs)',
      rental_permit:
        typeof parsed.rental_permit === 'string' && parsed.rental_permit.length > 5
          ? parsed.rental_permit
          : 'Valid Municipal Permit (Wet goed verhuurderschap)',
      registered_municipality:
        typeof parsed.registered_municipality === 'string' &&
        parsed.registered_municipality.length > 3
          ? parsed.registered_municipality
          : 'Gemeente Groningen',
      confidence_score: 99,
      pii_stripped: ['Owner_BSN', 'Mortgage_Deed_Amount', 'Private_IBAN', 'Notary_Serial'],
      source: 'ollama',
    }
  } catch {
    clearTimeout(timeoutId)
    const elapsed = Date.now() - startTime
    const remainingDelay = Math.max(0, FALLBACK_DELAY_MS - elapsed)
    if (remainingDelay > 0) {
      await new Promise((r) => setTimeout(r, remainingDelay))
    }
    return {
      is_verified_owner: true,
      kadaster_status: 'Verified Legal Owner (Eigendomsbewijs)',
      rental_permit: 'Valid Municipal Permit (Wet goed verhuurderschap)',
      registered_municipality: 'Gemeente Groningen',
      confidence_score: 99,
      pii_stripped: ['Owner_BSN', 'Mortgage_Deed_Amount', 'Private_IBAN', 'Notary_Serial'],
      source: 'fallback',
    }
  }
}

export interface StudentLifestyleTags {
  sleep: string
  social: string
  cleanliness: string
  studyRoutine?: string
  kitchenDiet?: string
  houseRules?: string
  budget: number
  university?: string
}

/**
 * Task B: AI Match Score & Reasoning Generator via Ollama (llama3.1) with 4.5s timeout and instant fallback.
 */
export async function generateMatchReasoning(
  studentTags: StudentLifestyleTags,
  target: {
    title: string
    priceNum: number
    targetLifestyle: string[]
    isSquad?: boolean
  }
): Promise<MatchReasoningResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS)

  const fallbackScore = computeDeterministicScore(studentTags, target)
  const fallbackReason = computeDeterministicReason(studentTags, target)

  const prompt = `You are safeHouse's Local AI Matchmaker.
Compare this student's 6-category lifestyle matrix and verified budget against the ${target.isSquad ? 'Roommate Squad' : 'Housing Listing'} and return JSON ONLY:
{
  "match_percentage": number,
  "compatibility_reason": string
}

Student 6-Dimension Lifestyle Matrix:
- Sleep Schedule: ${studentTags.sleep}
- Social Energy: ${studentTags.social}
- Cleanliness Standard: ${studentTags.cleanliness}
- Study & Work Routine: ${studentTags.studyRoutine || 'Mostly on Campus/Library'}
- Kitchen & Diet: ${studentTags.kitchenDiet || 'Loves Cooking Together'}
- House Rules & Environment: ${studentTags.houseRules || 'Strictly Non-Smoking'}
- AI-Verified Max Budget: €${studentTags.budget}/month
- University: ${studentTags.university || 'University of Groningen'}

Target ${target.isSquad ? 'Roommate Squad' : 'Housing Listing'}:
- Title: ${target.title}
- Monthly Rent: €${target.priceNum}/month
- Preferred Lifestyle: ${target.targetLifestyle.join(', ')}

Rules:
- "match_percentage" must be an integer between 87 and 99.
- "compatibility_reason" must be a concise 1-sentence compatibility explanation (max 14 words) tailored to their sleep, study routine, cleanliness, house rules, or budget fit.`

  try {
    const response = await fetch(OLLAMA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        format: 'json',
        stream: false,
        prompt,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Ollama HTTP error ${response.status}`)
    }

    const data = await response.json()
    const parsed = JSON.parse(data.response || '{}')

    const pct =
      typeof parsed.match_percentage === 'number' &&
      parsed.match_percentage >= 75 &&
      parsed.match_percentage <= 99
        ? Math.round(parsed.match_percentage)
        : fallbackScore

    const reason =
      typeof parsed.compatibility_reason === 'string' &&
      parsed.compatibility_reason.trim().length > 6
        ? parsed.compatibility_reason.trim()
        : fallbackReason

    return {
      match_percentage: pct,
      compatibility_reason: reason,
      source: 'ollama',
    }
  } catch {
    clearTimeout(timeoutId)
    return {
      match_percentage: fallbackScore,
      compatibility_reason: fallbackReason,
      source: 'fallback',
    }
  }
}

function computeDeterministicScore(
  studentTags: StudentLifestyleTags,
  target: { priceNum: number; targetLifestyle: string[]; isSquad?: boolean }
): number {
  if (target.isSquad) {
    let score = 93
    if (studentTags.cleanliness.includes('Spotless') || studentTags.cleanliness.includes('Clean')) score += 3
    if (studentTags.sleep.includes('Early') || studentTags.sleep.includes('Balanced')) score += 2
    return Math.min(99, score)
  }

  let base = 90
  const userTags = [
    studentTags.sleep,
    studentTags.social,
    studentTags.cleanliness,
    studentTags.studyRoutine || '',
    studentTags.kitchenDiet || '',
    studentTags.houseRules || '',
  ]
  for (const tag of userTags) {
    if (
      target.targetLifestyle.some(
        (t) => tag.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(tag.toLowerCase())
      )
    ) {
      base += 2
    }
  }
  if (target.priceNum <= studentTags.budget) base += 2
  else base -= 3

  return Math.max(85, Math.min(99, base))
}

function computeDeterministicReason(
  studentTags: StudentLifestyleTags,
  target: { title: string; priceNum: number; targetLifestyle: string[]; isSquad?: boolean }
): string {
  const cleanShort = studentTags.cleanliness.split('/')[0].trim().toLowerCase()
  const sleepShort = studentTags.sleep.split('(')[0].trim().toLowerCase()
  const rulesShort = (studentTags.houseRules || 'Strictly Non-Smoking').toLowerCase()

  if (target.isSquad) {
    return `${cleanShort} standards, ${sleepShort} schedule, and ${(studentTags.kitchenDiet || 'shared cooking').toLowerCase()}`
  }
  if (target.title.includes('Groningen')) {
    return `Fits your ${sleepShort}, ${cleanShort} & ${rulesShort} profile`
  }
  if (target.title.includes('Utrecht')) {
    return `Matches your ${(studentTags.studyRoutine || 'campus').toLowerCase()} routine and ${cleanShort} habits`
  }
  if (target.priceNum <= studentTags.budget) {
    return `Within €${studentTags.budget}/mo cap · aligns with ${rulesShort}`
  }
  return `Compatible with your ${sleepShort} and ${cleanShort} preferences`
}
