# ImpactPulse AI — Video Demonstration Script (< 3 Minutes)

Guideline: Video must be strictly under 3 minutes long, showing live UI, code, and system flow.

---

## Timeline & Scene Directions

| Timestamp | Scene | On-Screen View | Narration Script |
|---|---|---|---|
| **0:00 – 0:30** | **Executive Problem & Solution** | Dashboard (`/dashboard`) | "Welcome to ImpactPulse AI. Every day, data teams spend billions manually verifying crowdsourced tasks, while gig workers wait days for payments. ImpactPulse AI solves this bottleneck with an autonomous pipeline pairing Google Gemini 1.5 Flash multimodal quality assurance with PayPal Sandbox escrow and disbursal rails." |
| **0:30 – 1:00** | **Enterprise Organizer Portal** | Enterprise Portal (`/organization`) | "Here is the Enterprise Portal for authorized organizers. Notice the Verified Enterprise tick mark. To prevent fake jobs, organizations must prove task legitimacy by providing ground-truth criteria. When an organizer creates a task batch, an escrow order is generated via the PayPal Sandbox Orders API. Once captured, tasks immediately unlock for contributors." |
| **1:00 – 1:35** | **Contributor Hub & Anti-Fraud Engine** | Contributor Hub (`/contributor`) | "Next is the Contributor Hub for standard workers. Workers register their PayPal email address with zero upfront capital. When submitting proof, Google Gemini 1.5 Flash inspects the image or text against the ground-truth criteria in sub-second latency. Notice our Anti-Fraud Takeover Engine: if spam or deceptive content is detected, the submission is immediately intercepted, marked as Fraud Flagged, and payment is blocked." |
| **1:35 – 2:05** | **Instant PayPal Payout & Settlement** | Contributor Hub & Payouts (`/payouts`) | "For approved submissions, our backend immediately calls the PayPal Payouts API `/v1/payments/payouts`, sending earnings directly to the worker's PayPal account while retaining the platform's 20% commission. On the Disbursement Ledger, every transaction is tracked with its unique PayPal Payout Batch ID." |
| **2:05 – 2:35** | **Other Online Tasks & AG Grid Board** | Other Online Tasks (`/online-tasks`) & Task Board (`/tasks`) | "ImpactPulse also includes 'Other Online Tasks' — an aggregator searching external verified work across OpenStreetMap, Hugging Face, and remote labeling platforms with AI skill matching. And on our AG Grid Task Board, you see real-time streaming telemetry, custom confidence rating bars, and multi-column CSV export." |
| **2:35 – 3:00** | **Code Architecture & Compliance** | VS Code (`paypal_client.py` & root `LICENSE`) | "Under the hood, our FastAPI backend pairs PayPal's OAuth 2.0 endpoints with the Google GenAI SDK. At our repository root is our verified MIT License, and the project is 100% compliant with PayPal's Acceptable Use Policy for gig rewards. Thank you!" |
