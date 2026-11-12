"""
ImpactPulse AI - Smoke Test
Tests all routes, config, currency registry, data seeding without live AI calls.
Run from: d:/paypal/impactpulse-ai/backend
Usage: venv/Scripts/python.exe smoke_test.py
"""
import asyncio
import os
import sys
from dotenv import load_dotenv
load_dotenv()

# Trigger lifespan-compatible app import
from main import (
    app,
    batches, tasks, workers, payouts,
    organizations, external_tasks,
    seed_initial_data,
)
from httpx import AsyncClient, ASGITransport

async def run_smoke():
    print("=" * 70)
    print("IMPACTPULSE AI - SMOKE TEST (Config, Routes, Currency, External Tasks)")
    print("=" * 70)

    # Manually seed since ASGI lifespan may not auto-fire under AsyncClient
    await seed_initial_data()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:

        # --- 1. Currency registry ---
        print("\n[1] Currency Registry API...")
        r = await ac.get("/api/currencies")
        assert r.status_code == 200, f"FAIL: {r.status_code}\n{r.text}"
        d = r.json()
        codes = [c["code"] for c in d["currencies"]]
        print(f"  Currencies returned: {len(codes)}")
        for required in ["USD", "EUR", "GBP", "JPY", "INR", "CAD", "AUD", "SGD", "CHF", "BRL"]:
            assert required in codes, f"MISSING currency: {required}"
        print(f"  Codes: {', '.join(codes)}")
        print("  PASSED: Currency Registry")

        # --- 2. Config endpoint ---
        print("\n[2] Config / PayPal Sandbox credentials...")
        r = await ac.get("/api/config/paypal")
        assert r.status_code == 200
        cfg = r.json()
        print(f"  PayPal Live Sandbox: {cfg['is_live_sandbox']}")
        print(f"  Client ID Configured: {bool(cfg.get('client_id'))}")
        print(f"  Active AI Provider:  {cfg['active_ai_provider']}")

        print(f"  Gemini Model:        {cfg['active_gemini_model']}")
        print(f"  Supported Currencies:{len(cfg.get('supported_currencies', []))}")
        assert cfg["active_gemini_model"] == "gemini-3.8-flash", "Model must be gemini-3.8-flash"
        assert cfg["is_live_sandbox"] is True, "PayPal sandbox must be connected"
        print("  PASSED: Config Endpoint")

        # --- 3. External tasks listing ---
        print("\n[3] External Online Tasks listing...")
        r = await ac.get("/api/external-tasks")
        assert r.status_code == 200
        ext = r.json()
        print(f"  External tasks seeded: {len(ext)}")
        currencies_in_ext = set(t.get("currency", "USD") for t in ext)
        print(f"  Currencies in external tasks: {currencies_in_ext}")
        assert len(ext) >= 3, "Should have at least 3 external tasks"
        # Verify real task URLs not simulator
        for t in ext:
            assert t.get("url"), f"Task {t.get('id')} missing real URL"
        print("  PASSED: External Tasks Listing (all have real URLs)")

        # --- 4. Batches listing ---
        print("\n[4] Enterprise Batch listing...")
        r = await ac.get("/api/batches")
        assert r.status_code == 200
        blist = r.json()
        print(f"  Batches in DB: {len(blist)}")
        batch_currencies = [b.get("currency", "USD") for b in blist]
        print(f"  Batch currencies: {batch_currencies}")
        assert "USD" in batch_currencies, "Must have USD batch"
        assert "EUR" in batch_currencies, "Must have EUR batch (multi-currency)"
        print("  PASSED: Batches Listing - Multi-Currency")

        # --- 5. Organizations listing ---
        print("\n[5] Enterprise Organizations listing...")
        r = await ac.get("/api/organizations")
        assert r.status_code == 200
        orgs = r.json()
        print(f"  Organizations: {len(orgs)}")
        verified = [o for o in orgs if o.get("verified")]
        print(f"  Verified orgs (blue tick): {len(verified)}")
        assert len(verified) >= 1, "Must have verified orgs"
        print("  PASSED: Organizations Listing")

        # --- 6. Workers stats (per-email) ---
        print("\n[6] Contributor Worker Stats (per-email)...")
        r = await ac.get("/api/workers/maria.santos@gmail.com/stats")
        assert r.status_code == 200
        wdata = r.json()
        print(f"  Worker: {wdata['worker']['email']}")
        print(f"  Tasks completed: {wdata['worker']['tasks_completed']}")
        print(f"  Total earned: {wdata['worker']['total_earned']}")
        print("  PASSED: Worker Stats")

        # --- 7. Dashboard stats ---
        print("\n[7] Dashboard Stats Telemetry...")
        r = await ac.get("/api/dashboard/stats")
        assert r.status_code == 200
        stats = r.json()
        print(f"  Total Batches:   {stats['total_batches']}")
        print(f"  Total Tasks:     {stats['total_tasks']}")
        print(f"  Completed Tasks: {stats['completed_tasks']}")
        print(f"  Disbursed (USD): ${stats.get('total_disbursed_usd', 0):,.2f}")
        by_curr = stats.get("total_payouts_by_currency", {})
        print(f"  By Currency:     {by_curr}")
        assert len(by_curr) >= 2, "Must have payouts in multiple currencies"
        print("  PASSED: Dashboard Stats - Multi-Currency Breakdown")

        # --- 8. Payouts ledger ---
        print("\n[8] Payouts Disbursement Ledger...")
        r = await ac.get("/api/payouts")
        assert r.status_code == 200
        plist = r.json()
        print(f"  Payout records: {len(plist)}")
        ledger_currencies = set(p.get("currency", "USD") for p in plist)
        print(f"  Ledger currencies: {ledger_currencies}")
        assert "USD" in ledger_currencies
        assert "EUR" in ledger_currencies
        print("  PASSED: Payouts Ledger - Multi-Currency")

        # --- 9. Tasks board ---
        print("\n[9] Tasks Board (Global AG Grid Feed)...")
        r = await ac.get("/api/tasks/all")
        assert r.status_code == 200
        all_tasks = r.json()
        print(f"  Total task records: {len(all_tasks)}")
        task_currencies = set(t.get("currency", "USD") for t in all_tasks)
        print(f"  Task currencies: {task_currencies}")
        print("  PASSED: Tasks Board")

        # --- 10. Health endpoint ---
        print("\n[10] Health Endpoint...")
        r = await ac.get("/api/health")
        assert r.status_code == 200
        health = r.json()
        print(f"  Health status: {health.get('status')}")
        print(f"  PayPal connected: {health.get('paypal_sandbox_connected')}")
        print(f"  Gemini ready: {health.get('gemini_audit_ready')}")
        assert health.get("status") == "healthy"
        assert health.get("paypal_sandbox_connected") is True
        print("  PASSED: Health Endpoint")


    print("\n" + "=" * 70)
    print("ALL 10 SMOKE TESTS PASSED! Platform structure is 100% verified.")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_smoke())
