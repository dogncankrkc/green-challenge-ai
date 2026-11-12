# 🏠 safeHouse — Real Rooms. Real People.

> **Student housing in the Netherlands, made safe, simple, and social via Privacy-Preserving Local AI & Zero-Data Architecture.**  
> *Built for the Green Challenge AI Hackathon (Netherlands)*

---

## 🌍 The Problem: The Dutch Student Housing Crisis

Every semester across **Groningen, Utrecht, Amsterdam, Delft, and Maastricht**, tens of thousands of Dutch and international students face an acute housing emergency:

1. **Rampant Rental Scams & Fake Landlords:** Students desperate for accommodation are targeted on social media and classifieds by fraudsters demanding upfront deposits for properties they do not own or lack municipal permits to rent.
2. **Severe Privacy Violations (GDPR / UAVG):** Landlords routinely demand raw copies of passports, *Burgerservicenummer* (BSN — which is **illegal** for private landlords to process under Dutch UAVG law), full bank statements, and parental tax returns *before* even granting a viewing.
3. **Landlord Inbox Overload:** A single room listing in Groningen or Utrecht receives **300+ unfiltered messages** within 24 hours, leading to arbitrary selection, bias, and burnout.
4. **Fragmented Solo Searching:** Multi-bedroom apartments sit out of reach for individual students who lack a pre-formed, financially verified co-living group.

---

## 💡 Our Solution: safeHouse Zero-Data Matchmaking

**safeHouse** flips the traditional rental model by combining **On-Device Local AI Verification** with **Double Opt-In Anonymity**:

### 1. 🛡️ Zero-Data Local AI Student Verification (3-Document Bundle)
Students verify their status across three Dutch housing pillars without uploading sensitive files to any cloud server:
- **Slot 1 — Academic Enrollment:** University Acceptance Letter / Proof of Enrollment (*RUG, Utrecht University, UvA, TU Delft*)
- **Slot 2 — Financial Capacity:** DUO Student Finance Grant, Erasmus+ Scholarship, or Guarantor Statement
- **Slot 3 — Tenant Reference & Right-to-Rent:** *Verhuurdersverklaring* (Previous Landlord Reference) or IND Residency Check

Our Local AI (`llama3.1` via Ollama) parses the documents **client-side**, strips **100% of PII** (`BSN`, `IBAN`, `Passport_No`, `Full_Name`, street addresses), and emits only a cryptographically minimal JSON attestation:

```json
{
  "is_verified_student": true,
  "university": "University of Groningen",
  "max_budget": 850,
  "program_level": "MSc",
  "tenant_reference": "Verified Positive",
  "confidence_score": 98,
  "pii_stripped": ["BSN", "IBAN", "Passport_No", "Full_Name"]
}
```

### 2. 🏛️ Mandatory Landlord Kadaster & Municipal Permit Verification
To eliminate rental scams under the Dutch **Wet goed verhuurderschap** (Good Landlordship Act), landlords **cannot** publish a room or sublet listing until they pass Local AI verification on two official proofs:
1. **Kadaster Property Extract (*Kadastraal Uittreksel / Eigendomsbewijs*):** Proves legal ownership of the address.
2. **Municipal Rental Permit (*Verhuurvergunning*):** Proves legal authorization for student occupancy.

Private mortgage deed figures, notary serials, and owner BSNs are stripped locally, and verified properties earn the **Kadaster Verified Owner** badge.

### 3. 🤝 AI Co-Living Squad Formation (6-Dimension Lifestyle Matrix)
Instead of competing solo, students complete a **6-Dimension Co-Living Matrix**:
- **Sleep Schedule** (*Early Riser, Balanced, Night Owl, Flexible*)
- **Social Energy** (*Quiet & Private, Occasional Hangouts, Shared House Dinners, Very Social*)
- **Cleanliness Standard** (*Spotless / Daily Tidy, Clean Shared Spaces, Weekly Chore Roster, Relaxed*)
- **Study & Work Routine** (*Mostly on Campus/Library, Hybrid, Remote*)
- **Kitchen & Diet** (*Loves Cooking Together, Quick Meal Prepper, Vegetarian/Vegan Friendly, Omnivore*)
- **House Rules & Environment** (*Strictly Non-Smoking, Pet Friendly, No Overnight Guests, Music Friendly*)

Local AI clusters compatible students into a **4-person Roommate Squad** (e.g., *96% compatibility · €2,400/month combined verified budget*) so they can apply for entire apartments together.

### 4. 🔒 Double Opt-In Anonymity
Landlords receive a curated **Top 5 AI Matches** feed showing only anonymous profiles (`Verified Student Group #104`, `Verified Exchange Student #88`), AI Match Scores, lifestyle tags, and verified budget badges. Real names and direct messaging unlock **only** when the landlord approves the match.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | **React 19 + TypeScript** | Modular feature-based SPA (`student`, `landlord`, `privacy`, `auth`) |
| **Build & Styling** | **Vite 8 + Tailwind CSS v4** | Instant HMR, custom `@theme` tokens (`forest`, `lime`, `orange`, `cream`) |
| **State Management** | **Zustand** | Reactive cross-role state synchronization (Student ↔ Landlord live demo flows) |
| **Client Document Parsing** | **PDF.js (`pdfjs-dist`) + FileReader** | In-memory client-side PDF & TXT text extraction with zero server uploads |
| **Local AI Inference** | **Ollama (`llama3.1`)** | On-device JSON metric extraction, PII redaction, and 1-sentence match reasoning |

---

## 🚀 Production Scalability & Zero-Data Architecture Roadmap

In this **Hackathon Demo Environment**, safeHouse connects to a local `Ollama (llama3.1)` instance at `http://localhost:11434` (with a 10-second `AbortController` window and automatic deterministic fallback for live presentation reliability).

Before public launch across the Netherlands, safeHouse will evaluate and transition to two enterprise Zero-Data production architectures so end-users require zero local setup:

1. **In-Browser Client Execution (WebGPU & WebLLM):**
   Running quantized small language models (e.g., Llama-3.2-1B/3B-Instruct-q4f16) directly inside the user's browser via **WebGPU** acceleration—guaranteeing 100% on-device document parsing with zero network roundtrips.
2. **Confidential Computing & TEEs (Trusted Execution Environments):**
   For mobile devices without WebGPU capacity, routing ephemeral document streams into hardware-isolated secure enclaves (**AWS Nitro Enclaves / Confidential Cloud**) with cryptographic remote attestation, where enclave RAM is wiped immediately after JSON metric extraction.

---

## ⚡ Quick Start & Local LLM Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Ollama (`llama3.1`) with CORS Enabled
Make sure [Ollama](https://ollama.com/) is installed, then pull `llama3.1` and allow browser requests from the Vite dev server:

```bash
# Pull the llama3.1 model (if not already downloaded)
ollama pull llama3.1

# Start Ollama allowing browser origin requests
OLLAMA_ORIGINS="*" ollama serve

# Or warm up the model directly in a terminal
ollama run llama3.1
```

> **Demo Safety Note:** If Ollama is not running or takes longer than `10 seconds`, `src/services/ollamaService.ts` automatically falls back to the built-in deterministic Zero-Data extraction engine so the live demo never hangs or crashes.

### 3. Run the Development Server
```bash
npm run dev
```
Open **http://localhost:5173/** in your browser. Use the floating bottom **ScreenSwitcher** bar to jump rapidly between Student, Landlord, and Privacy Architecture views during your pitch.

