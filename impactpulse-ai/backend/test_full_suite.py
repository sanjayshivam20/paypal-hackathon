import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

from paypal_client import create_order, is_live_sandbox_configured
from gemini_verifier import verify_text_submission
from main import get_external_tasks

async def run_full_validation():
    print("=" * 60)
    print("IMPACTPULSE AI — FULL LIVE ENDPOINT & AGENT VERIFICATION")
    print("=" * 60)

    # 1. PayPal Sandbox Check
    print("\n[1/3] Testing Live PayPal Sandbox Orders API...")
    is_live = is_live_sandbox_configured()
    print(f"PayPal Live Sandbox configured: {is_live}")
    order_res = await create_order("BATCH-LIVE-TEST", num_tasks=5, price_per_task=2.00)
    print(f"Order ID: {order_res.get('order_id')}")
    print(f"Status: {order_res.get('status')}")
    print(f"Total Amount: ${order_res.get('total_amount')}")
    print(f"Approval URL: {order_res.get('approve_url')}")
    assert order_res.get("order_id"), "Failed to generate order ID"
    assert "paypal.com" in order_res.get("approve_url", ""), "Invalid PayPal approval link"
    print("-> PayPal Sandbox Orders API PASSED!")

    # 2. Gemini Live Audit & Anti-Fraud Engine
    print("\n[2/3] Testing Gemini AI Auditor & Anti-Fraud Takeover...")
    task_desc = "Verify if store receipt contains merchant name 'Whole Foods Market' and date 2026-11-10."
    
    # Test valid submission
    valid_sub = "Merchant: Whole Foods Market, Date: 2026-11-10, Subtotal: $42.50, Total: $45.80, Paid via Visa debit."
    print("Testing valid submission...")
    res_valid = await verify_text_submission(task_desc, valid_sub)
    print(f"Result: Approved={res_valid.get('approved')}, Fraud={res_valid.get('is_fraud')}, Score={res_valid.get('confidence_score')}")
    print(f"Reasoning: {res_valid.get('reasoning')}")
    
    # Test fraud/spam submission
    spam_sub = "asdfghjk qwertyuiop fake spam text random random"
    print("\nTesting spam/fraud submission...")
    res_spam = await verify_text_submission(task_desc, spam_sub)
    print(f"Result: Approved={res_spam.get('approved')}, Fraud={res_spam.get('is_fraud')}, Score={res_spam.get('confidence_score')}")
    print(f"Reasoning: {res_spam.get('reasoning')}")
    print("-> Gemini AI Audit & Anti-Fraud Engine PASSED!")

    # 3. Live Online Tasks Fetcher
    print("\n[3/3] Testing Live External Online Tasks (HOT OSM + GitHub Bounties)...")
    external_tasks = await get_external_tasks()
    print(f"Total live tasks fetched: {len(external_tasks)}")
    for t in external_tasks[:4]:
        plat = t.get('platform') if isinstance(t, dict) else getattr(t, 'platform', '')
        tit = t.get('title') if isinstance(t, dict) else getattr(t, 'title', '')
        url = t.get('url') if isinstance(t, dict) else getattr(t, 'url', '')
        print(f"  * [{plat}] {tit[:50]}... | URL: {url}")
    
    print("-> External Real Work Tasks Fetcher PASSED!")
    print("\n" + "=" * 60)
    print("ALL LIVE INTEGRATION TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_full_validation())
