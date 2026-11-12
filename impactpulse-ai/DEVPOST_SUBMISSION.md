# Devpost Official Submission Entry: ImpactPulse AI

Project for the PayPal AI Hackathon 2026 (Devpost).

---

### Project Title
ImpactPulse AI - Autonomous Multi-Currency Micro-Task Crowdsourcing Engine

### Elevator Pitch / Tagline
Dual-sided enterprise crowdsourcing engine where Google Gemini 3.8 Flash and custom local/cloud models audit work proof in real-time, executing instant multi-currency PayPal Sandbox disbursements across 15+ global currencies with automated anti-fraud takeover protection.

### Target Prize Tracks
- Best Overall ($12,000)
- Best Use of Agentic Commerce ($5,000)
- Most Impactful ($5,000)
- Best Use of AG Grid ($5,000)
- Best Use of APIMatic ($1,000)

---

## Inspiration
Data-driven enterprises spend billions annually verifying crowdsourced training data, civic accessibility maps, and digital validation jobs. Traditional crowdsourcing systems suffer from three fundamental flaws:
1. Prolonged Payment Latency: Micro-workers wait days or weeks for manual reviews before receiving compensation.
2. Currency Friction & Exclusion: Most platforms settle strictly in US Dollars, forcing contributors worldwide to absorb heavy conversion losses or excluding unbanked gig contributors who require their local currency.
3. Click-Farm & Bot Infiltration: Organizations lose up to 30% of their data budgets to fraudulent or low-effort bot submissions.

We created ImpactPulse AI to solve this: An autonomous multi-currency AI auditor that inspects worker submissions in sub-second time, enforces anti-fraud takeover of false activities, and executes programmatic PayPal multi-currency disbursements the moment criteria are satisfied.

---

## What It Does
ImpactPulse AI establishes an autonomous operational loop between enterprise organizers and global micro-workers:

1. Enterprise Multi-Currency Batch Escrow: Authorized organizations create task campaigns with ground-truth verification rules, depositing escrow budget in their choice of 15+ global currencies (USD, EUR, GBP, JPY, CAD, AUD, INR, SGD, CHF, BRL, etc.) via the PayPal Sandbox Orders API v2 (/v2/checkout/orders).
2. Contributor Work Execution: Contributors claim tasks on web or mobile and submit proof (photos or text) with zero upfront cost.
3. Autonomous Quality & Anti-Fraud Audit: Google Gemini 3.8 Flash (or the contributor's chosen local Ollama/LM Studio model or custom cloud API) evaluates the proof against the enterprise ground truth. If deceptive activity is detected, the Anti-Fraud Takeover Engine intercepts the submission, marks it as rejected, and blocks disbursement.
4. Instant Multi-Currency Settlement: On approval, the backend calls the PayPal Payouts API v1 (/v1/payments/payouts) to disburse earnings directly to the worker's PayPal account in the task's currency (with exact ISO 4217 formatting, including 0-decimal handling for Japanese Yen) while retaining the platform's 20% commission.
5. Real External Online Tasks Aggregator: Contributors can explore real external micro-tasks and open-source data bounties across partner platforms (Humanitarian OpenStreetMap, Mozilla Common Voice, Kaggle, GitHub, Scale AI, ClimateData) with AI skill compatibility matching and live PayPal payouts.

---

## Dual Work Portals

ImpactPulse AI provides two specialized interfaces:
- Enterprise Portal (Authorized Organizers): Features the official Verified Enterprise Tick Mark, multi-currency escrow pricing calculators, ground-truth criteria builders, and PayPal Checkout escrow capture.
- Contributor Hub (Normal Users): Features instant PayPal email sign-in, multi-currency task discovery, proof uploading, and forensic AI audit telemetry.

---

## Multi-Provider AI Architecture

ImpactPulse AI gives users and enterprises complete control over their AI intelligence:
- Default Flagship AI: Google Gemini 3.8 Flash with high-speed multimodal reasoning and vision.
- Bring-Your-Own-Local-Model: Connect any local model running via Ollama, LM Studio, vLLM, or LocalAI using OpenAI-compatible endpoints with zero cloud data leakage.
- Custom Cloud AI: Bring your own OpenAI (GPT-4o), Groq, or Mistral API key for tailored enterprise audits.
- Autonomous Failover: If any provider experiences rate-limiting, the built-in resilience engine preserves operational uptime.

---

## Global Multi-Currency Settlement Engine

ImpactPulse AI supports 15 PayPal-supported ISO 4217 currencies:
- Americas: USD (US Dollar), CAD (Canadian Dollar), BRL (Brazilian Real), MXN (Mexican Peso)
- Europe: EUR (Euro), GBP (British Pound), CHF (Swiss Franc), SEK (Swedish Krona)
- Asia-Pacific: JPY (Japanese Yen), INR (Indian Rupee), AUD (Australian Dollar), SGD (Singapore Dollar), HKD (Hong Kong Dollar), NZD (New Zealand Dollar), PHP (Philippine Peso)
- Strict Currency Precision: Handles zero-decimal currencies (JPY formatted as integer) and two-decimal currencies, strictly adhering to PayPal API schema constraints.
- Normalized Telemetry: Executive dashboard normalizes global revenue into USD equivalents while tracking granular balances across every currency.

---

## How We Built It
- Payment Layer: PayPal Developer Sandbox integrating Orders API v2 (client escrow funding) and Payouts API v1 (instant multi-currency worker disbursement).
- AI Verification: Google Gemini 3.8 Flash multimodal vision engine + OpenAI-compatible local/cloud client with structured JSON parsing and anti-fraud heuristics.
- Backend: Python 3.11+ and FastAPI with asynchronous HTTP client architecture (httpx) and ISO 4217 multi-currency conversion registry.
- Frontend: React 18, Tailwind CSS, Lucide icons, and AG Grid Community Edition rendering high-performance real-time task and payout ledgers.

---

## Policy & Regulatory Alignment
ImpactPulse AI is strictly aligned with PayPal Acceptable Use Policy:
- Permitted Disbursals: PayPal explicitly authorizes the Payouts API for gig compensation, rewards, and task payments.
- No Securities or Lending: Operates purely as service compensation without investment pools or micro-lending schemes.
- Fraud Risk Reduction: Gemini AI audits prevent fraudulent claim payouts and chargeback risks.

---

## Built With
- paypal-sandbox
- paypal-orders-api-v2
- paypal-payouts-api-v1
- google-gemini-3.8-flash
- multi-currency-iso-4217
- fastapi
- python
- react
- ag-grid
- tailwindcss
- recharts
- vite
- apimatic
