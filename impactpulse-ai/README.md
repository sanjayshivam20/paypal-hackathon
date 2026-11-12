# ImpactPulse AI

**Autonomous Multi-Currency Micro-Task Crowdsourcing Engine**

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![React 18](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![PayPal Sandbox](https://img.shields.io/badge/PayPal-Sandbox%20API%20v2-003087.svg)](https://developer.paypal.com)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini%203.8%20Flash-4285F4.svg)](https://ai.google.dev)
[![AG Grid](https://img.shields.io/badge/AG%20Grid-Community-orange.svg)](https://www.ag-grid.com)

---

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Multi-Currency Settlement Rails](#multi-currency-settlement-rails)
- [Dual Work Portals](#dual-work-portals)
- [Multi-Provider AI Architecture](#multi-provider-ai-architecture)
- [Autonomous Anti-Fraud Takeover Engine](#autonomous-anti-fraud-takeover-engine)
- [Real External Online Tasks Aggregator](#real-external-online-tasks-aggregator)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Verification & Automated Tests](#verification--automated-tests)
- [Policy & Regulatory Compliance](#policy--regulatory-compliance)
- [License](#license)

---

## Overview

ImpactPulse AI is an enterprise crowdsourcing and data validation platform designed to eliminate payment latency, global currency barriers, and fraudulent submissions.

Traditional crowdsourcing systems suffer from high manual audit costs, conversion losses, and multi-week payout delays. ImpactPulse AI resolves this with two integrated technologies:
1. **Google Gemini 3.8 Flash & Multi-Engine AI** operates as an autonomous multimodal auditor, evaluating visual and textual proof against ground-truth acceptance criteria in sub-second latency. Users can also bring their own local models (Ollama, LM Studio) or custom cloud keys.
2. **PayPal Developer Sandbox APIs (Orders v2 & Payouts v1)** execute programmatic multi-currency escrow capture from enterprise organizers and instant disbursals to global contributors across 15+ global currencies.

---

## System Architecture

The end-to-end operational loop executes across five automated stages:

```
[ Enterprise Client ] ---> (1. Deposit Multi-Currency Escrow) ---> [ PayPal Orders API v2 ]
                                                                             |
                                                                             v
[ Contributor User ]  ---> (2. Upload Work Proof)            ---> [ Gemini 3.8 Flash / Local AI ]
                                                                             |
                                                                (3. Autonomous Audit & Anti-Fraud)
                                                                             |
                                                                             v
[ PayPal Payouts API v1 ] <--- (4. Instant Multi-Currency Disbursal) <-------+
          |
          +--> 20% Commission Retained in Platform Escrow Treasury (80% to Contributor)
```

### Transaction Economics
- **Enterprise Deposit**: Full batch budget locked in PayPal Sandbox Escrow.
- **Contributor Payout**: 80% net disbursement transferred immediately via PayPal Payouts API.
- **Platform Fee**: 20% retained in platform treasury.
- **Unit Economics**: Preserved across all 15 supported currencies (e.g. 5.00 EUR -> 1.00 EUR fee + 4.00 EUR payout; 1500 JPY -> 300 JPY fee + 1200 JPY payout).

---

## Multi-Currency Settlement Rails

ImpactPulse AI supports 15 PayPal-supported ISO 4217 currencies with precision formatting:
- **Zero-Decimal Currencies**: Japanese Yen (`JPY`) formatted strictly as integers to satisfy PayPal API constraints.
- **Standard Two-Decimal Currencies**: USD, EUR, GBP, CAD, AUD, INR, SGD, CHF, BRL, MXN, HKD, NZD, SEK, PHP.
- **Normalized Dashboard Telemetry**: Total revenue and payouts are unified into USD equivalents for executive analytics while tracking granular balances across every currency.

---

## Dual Work Portals

ImpactPulse AI provides two purpose-built portals with distinct access tiers:

### 1. Enterprise Organizer Portal
- **Verified Enterprise Partner Status**: Authenticated organizations receive an official verification tick mark upon enrollment.
- **Ground-Truth Criteria Builder**: Organizations specify verifiable acceptance criteria, expected visual features, and quality thresholds.
- **PayPal Escrow Funding**: B2B organizers fund task campaigns using the PayPal Sandbox Orders API (`/v2/checkout/orders`), holding deposits in programmatic escrow until work is completed and verified.
- **Settlement Currency Selector**: Choose any of the 15 supported currencies for the batch budget.

### 2. Contributor Hub (Normal User Portal)
- **Zero Capital Barrier**: Contributors sign in using their PayPal payout email address. No upfront fees or subscription costs are required.
- **Task Search & Filtering**: Contributors filter open work queues by category, compensation rate, and modal type (Image or Text).
- **Instant Multi-Currency Settlement**: Upon passing the AI quality audit, the system automatically executes a direct PayPal payout with a unique batch tracking ID.

---

## Multi-Provider AI Architecture

ImpactPulse AI provides flexible AI routing:
- **Default Flagship**: Google Gemini 3.8 Flash (`gemini-3.8-flash`) with advanced multimodal reasoning and vision.
- **Bring-Your-Own-Local-Model**: Connect any local model running via Ollama, LM Studio, vLLM, or LocalAI using OpenAI-compatible endpoints with zero cloud data leakage.
- **Custom Cloud AI**: Support for OpenAI (GPT-4o), Groq, or Mistral via custom API keys.
- **Interactive Configuration**: Switch models, update keys, and test live connectivity on the fly via the in-app API Settings modal.

---

## Autonomous Anti-Fraud Takeover Engine

To protect enterprise clients from bot abuse, click-farm scripts, and low-effort placeholders, ImpactPulse AI deploys an automated Anti-Fraud Takeover Engine:

1. **Entropy & File Header Inspection**: Validates image byte structures and filters empty, corrupted, or synthetic files before calling downstream APIs.
2. **Multimodal Discrepancy Auditing**: Gemini 3.8 Flash evaluates visual proof against the enterprise ground truth. If irrelevant imagery or mismatched context is detected:
   - The submission is marked as rejected.
   - Monetary disbursement is revoked.
   - Forensic indicators (e.g. `['irrelevant_content', 'synthetic_spam']`) are recorded.
   - Contributor reliability rating is decremented to prevent systemic abuse.

---

## Real External Online Tasks Aggregator

ImpactPulse AI features a dedicated **Other Online Tasks** aggregator for contributors seeking remote digital work:

- **Aggregated Sources**: Catalogs real micro-tasks, open-source data bounties, and civic labeling projects across partner networks with direct URLs:
  - Humanitarian OpenStreetMap Team (`https://tasks.hotosm.org/`)
  - Mozilla Common Voice Initiative (`https://commonvoice.mozilla.org/`)
  - Kaggle Community Bounties (`https://www.kaggle.com/datasets`)
  - GitHub Open Source Bounties (`https://github.com`)
  - Scale AI Partner Network (`https://scale.com`)
  - ClimateData Open Platform (`https://earthdata.nasa.gov/`)
- **Search & Filter**: Filter by category (Civic Mapping, AI Data Annotation, Audio Labeling, Content Moderation).
- **Direct Proof & Payout**: Contributors can submit proof of completed external work and receive immediate PayPal payouts in their chosen currency.

---

## Technology Stack

- **Payment Engine**: PayPal Developer Sandbox (Orders API v2, Payouts API v1).
- **AI Engine**: Google Gemini 3.8 Flash (`google-genai` SDK), OpenAI-compatible local/cloud client.
- **Backend**: Python 3.11+, FastAPI, Uvicorn, HTTPX, Pydantic v2.
- **Frontend**: React 18, Vite, Tailwind CSS, AG Grid Community Edition, Framer Motion, Lucide Icons, Axios.
- **Data Tables**: AG Grid for enterprise data management.

---

## Quick Start

### 1. One-Click Launch (Windows)

Double-click `run.bat` in the project root:
```bat
run.bat
```
This automatically starts:
- FastAPI backend on `http://localhost:8000`
- React frontend on `http://localhost:5173`
- Launches your default web browser

### 2. Manual Launch

**Backend**:
```bash
cd impactpulse-ai/backend
venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend**:
```bash
cd impactpulse-ai/frontend
npm run dev
```

---

## Verification & Automated Tests

ImpactPulse AI includes comprehensive offline and live test suites:

### 1. Static Validation (No Network Required)
```bash
cd impactpulse-ai/backend
venv\Scripts\python.exe validate_static.py
```
Validates:
- Config module and PayPal client ID
- Multi-currency registry (15 ISO currencies, zero-decimal JPY handling, 2-decimal formatting)
- Pydantic models (TaskBatch, Task, PayoutRecord, ExternalTask)
- PayPal client structure
- 80/20 platform economics across all currencies
- External task genuine URLs
- Anti-fraud JSON parsing heuristics

### 2. Emoji Audit
```bash
cd impactpulse-ai/backend
venv\Scripts\python.exe check_emojis.py
```
Enforces zero emojis across all code, markdown, templates, and UI assets.

### 3. Comprehensive Multi-Currency & Live Integration Suite
```bash
cd impactpulse-ai/backend
venv\Scripts\python.exe test_all_features.py
```

---

## Policy & Regulatory Compliance

ImpactPulse AI is strictly aligned with PayPal Acceptable Use Policy:
- **Permitted Disbursals**: PayPal explicitly authorizes the Payouts API for gig compensation, rewards, and task payments.
- **No Securities or Lending**: Operates purely as service compensation without investment pools or micro-lending schemes.
- **Fraud Risk Reduction**: Gemini AI audits prevent fraudulent claim payouts and chargeback risks.

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
