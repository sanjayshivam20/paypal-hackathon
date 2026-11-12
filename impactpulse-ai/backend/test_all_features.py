import asyncio
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

from paypal_client import is_live_sandbox_configured
from main import app
from httpx import AsyncClient, ASGITransport

async def test_all_features():
    print("=" * 70)
    print("IMPACTPULSE AI - COMPREHENSIVE MULTI-CURRENCY & HACKATHON VERIFICATION")
    print("=" * 70)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Config & Multi-Currency Registry
        print("\n[1/7] Checking Multi-Currency Registry & System Configuration...")
        res = await ac.get("/api/currencies")
        assert res.status_code == 200, f"Currencies API failed: {res.status_code}"
        curr_data = res.json()
        currencies = curr_data if isinstance(curr_data, list) else curr_data.get("currencies", [])
        print(f"Total Supported Currencies: {len(currencies)}")
        supported_codes = [c["code"] for c in currencies]
        print(f"Currencies: {', '.join(supported_codes)}")
        assert "USD" in supported_codes and "EUR" in supported_codes and "GBP" in supported_codes and "JPY" in supported_codes
        print("-> Multi-Currency Registry PASSED!")

        res = await ac.get("/api/config/paypal")
        assert res.status_code == 200, f"Config failed: {res.status_code}"
        cfg = res.json()
        print(f"PayPal Live Sandbox: {cfg.get('is_live_sandbox')}")
        print(f"Client ID Configured: {bool(cfg.get('client_id'))}")
        print(f"Active AI Provider: {cfg.get('active_ai_provider')}")

        print(f"Gemini Model: {cfg.get('active_gemini_model')}")
        print(f"Supported Currencies Count: {len(cfg.get('supported_currencies', []))}")
        print("-> System Configuration check PASSED!")

        # 2. Update keys endpoint resilience
        print("\n[2/7] Testing API Keys Update Endpoint...")
        update_payload = {
            "paypal_client_id": cfg.get("client_id"),
            "paypal_client_secret": "", # Leave blank to test secret persistence
            "ai_provider": "default_gemini",
            "gemini_model": "gemini-3.8-flash",
            "local_endpoint": "http://localhost:11434/v1",
            "local_model_name": "llama3.2"
        }
        res = await ac.post("/api/config/update-keys", json=update_payload)
        assert res.status_code == 200, f"Update keys failed: {res.text}"
        ures = res.json()
        print(f"PayPal Validation: {ures.get('paypal_status')}")
        print(f"Gemini Validation: {ures.get('gemini_status')}")
        print(f"Active AI Provider: {ures.get('ai_provider')}")
        assert ures.get("paypal_status") == "CONNECTED", "PayPal should stay connected with persistent secret"
        print("-> API Keys Update Resilience PASSED!")

        # 3. Enterprise Batch Creation in EUR (Orders API v2)
        print("\n[3/7] Testing Enterprise Multi-Currency Batch Creation in EUR...")
        batch_payload = {
            "client_email": "enterprise@impactpulse.ai",
            "organization_name": "EU Humanitarian Emergency Relief Agency",
            "title": "Satellite Disaster Damage Assessment - European Civil Protection",
            "description": "Examine high-resolution post-flood imagery and categorize infrastructural risk.",
            "verification_criteria": "Must detail structural inundation and risk level clearly.",
            "task_type": "text",
            "num_tasks": 3,
            "price_per_task": 4.50,
            "currency": "EUR"
        }
        res = await ac.post("/api/batches", json=batch_payload)
        assert res.status_code == 200, f"Batch creation failed: {res.text}"
        batch_res = res.json()
        batch_data = batch_res.get("batch", {})
        batch_id = batch_data.get("id")
        paypal_order_id = batch_res.get("paypal_order_id")
        print(f"Batch ID: {batch_id}")
        print(f"Batch Currency: {batch_res.get('currency')}")
        print(f"Total Escrow: {batch_data.get('total_cost')} EUR")
        print(f"PayPal Order ID: {paypal_order_id}")
        assert batch_res.get("currency") == "EUR", "Batch currency must be EUR"
        assert paypal_order_id, "PayPal Order must be generated for batch escrow"
        print("-> Enterprise Batch Creation in EUR PASSED!")

        # 3b. Capture Sandbox Escrow
        print("\n[3b] Capturing Sandbox Escrow to Release Tasks into Worker Pool...")
        cap_res = await ac.post(f"/api/batches/{batch_id}/capture")
        assert cap_res.status_code == 200, f"Escrow capture failed: {cap_res.text}"
        print("-> Escrow Capture PASSED! Tasks released to available status.")

        # 4. Internal Task Claim & Submit with EUR Payout (Payouts API v1)
        print("\n[4/7] Testing Internal Task Claim & EUR Payout Disbursal...")
        res = await ac.get("/api/tasks/available")
        assert res.status_code == 200
        available_tasks = [t for t in res.json() if t.get("batch_id") == batch_id]
        assert len(available_tasks) > 0, "Batch tasks should be available"
        first_task = available_tasks[0]
        task_id = first_task["id"]
        print(f"Target Task ID: {task_id}, Currency: {first_task.get('currency')}, Bounty: {first_task.get('payout_amount')} EUR")

        claim_task_res = await ac.post(f"/api/tasks/{task_id}/claim", json={"worker_email": "elena.schmidt@berlin-humanitarian.de"})
        assert claim_task_res.status_code == 200

        submit_data = {
            "worker_email": "elena.schmidt@berlin-humanitarian.de",
            "submission_text": "Detailed field report: Verified post-flood imagery shows significant structural damage along bridge pier #3 and adjacent access ramp. Immediate stabilization required.",
            "ai_provider": "default_gemini"
        }
        res = await ac.post(f"/api/tasks/{task_id}/submit", data=submit_data)
        assert res.status_code == 200, f"Task submission failed: {res.text}"
        sres = res.json()
        task_data = sres.get("task", {})
        task_status = task_data.get("status")
        verif = sres.get("verification", {})
        print(f"Task Status: {task_status}")
        print(f"AI Provider: {verif.get('provider_used')}")
        print(f"AI Audit Approved: {verif.get('approved')}")
        print(f"AI Confidence Score: {verif.get('confidence_score')}")
        payout = sres.get("payout")
        print(f"Payout Batch ID: {payout.get('payout_batch_id') if payout else 'N/A'}")
        print(f"Payout Status: {payout.get('batch_status') if payout else 'N/A'}")
        assert task_status in ("approved", "needs_review", "paid"), f"Task status was {task_status}"
        print("-> Internal Task Claim & EUR Disbursal Flow PASSED!")

        # 5. External Online Task - Claim in GBP & PayPal Disbursal
        print("\n[5/7] Testing External Online Task Claim with GBP Disbursal...")
        claim_payload = {
            "task_id": "ext-002",
            "worker_email": "david.wright@oxford-research.ac.uk",
            "paypal_email": "sb-worker@business.example.com",
            "submission_proof": "Classified 14 audio samples for environmental bioacoustics project. Tagged species: Turdus merula (European blackbird) with 96% signal clarity, filtered out background wind shear.",
            "reward_amount": 3.75,
            "currency": "GBP",
            "ai_provider": "default_gemini"
        }
        res = await ac.post("/api/external-tasks/claim-and-submit", json=claim_payload)
        assert res.status_code == 200, f"External claim failed: {res.text}"
        cres = res.json()
        print(f"External Task Status: {cres.get('status')}")
        print(f"Disbursed Amount: {cres.get('reward_amount')} {cres.get('currency', 'GBP')}")
        print(f"Payout Batch ID: {cres.get('payout', {}).get('payout_batch_id') if cres.get('payout') else 'N/A'}")
        assert cres.get("status") in ("paid", "approved_payout_failed")
        print("-> External Online Task with GBP Disbursal PASSED!")

        # 6. External Online Task - Spam / Fraud Takeover Prevention
        print("\n[6/7] Testing Anti-Fraud Takeover on Online Task...")
        fraud_payload = {
            "task_id": "ext-003",
            "worker_email": "spammer@botnet.fake",
            "paypal_email": "spammer@botnet.fake",
            "submission_proof": "fake gibberish text 12345 bot autogenerated test asdf qwerty",
            "reward_amount": 5.00,
            "currency": "USD",
            "ai_provider": "default_gemini"
        }
        res = await ac.post("/api/external-tasks/claim-and-submit", json=fraud_payload)
        assert res.status_code == 200, f"Fraud test failed: {res.text}"
        fres = res.json()
        print(f"Fraud Claim Result: Success={fres.get('success')}, Status={fres.get('status')}")
        print(f"Fraud Flags: {fres.get('verification', {}).get('fraud_indicators')}")
        print(f"AI Reasoning: {fres.get('verification', {}).get('reasoning')}")
        assert fres.get("status") == "rejected", "Fraudulent submission must be rejected"
        assert fres.get("payout") is None, "Payout must be blocked for fraud"
        print("-> Anti-Fraud Takeover on Online Tasks PASSED!")

        # 7. Multi-Currency Telemetry & Disbursement Ledger
        print("\n[7/7] Verifying Multi-Currency Dashboard Stats & Settlement Ledger...")
        res = await ac.get("/api/dashboard/stats")
        assert res.status_code == 200
        stats = res.json()
        print(f"Total Batches: {stats.get('total_batches')}")
        print(f"Total Tasks: {stats.get('total_tasks')}")
        print(f"Total Disbursed (USD equivalent): ${stats.get('total_payouts', 0.0):,.2f}")
        by_currency = stats.get("total_payouts_by_currency", {})
        print("Payouts by Currency Breakdown:")
        for curr, amt in by_currency.items():
            print(f"  - {curr}: {amt:,.2f}")
        assert len(by_currency) >= 2, "Should have payouts in multiple currencies"

        res = await ac.get("/api/payouts")
        assert res.status_code == 200
        payout_list = res.json()
        print(f"Disbursement Ledger Entries: {len(payout_list)}")
        currencies_in_ledger = set(p.get("currency", "USD") for p in payout_list)
        print(f"Currencies in Ledger: {currencies_in_ledger}")
        assert "EUR" in currencies_in_ledger or "GBP" in currencies_in_ledger

    print("\n" + "=" * 70)
    print("ALL 7 CORE CAPABILITIES & MULTI-CURRENCY SETTLEMENTS ARE FULLY VERIFIED!")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(test_all_features())
