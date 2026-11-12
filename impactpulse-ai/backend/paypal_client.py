"""
ImpactPulse AI — PayPal Sandbox API Client
Handles Orders API (client funding) and Payouts API (worker disbursement).

Uses PayPal Sandbox environment for all operations:
  - Orders API:  POST /v2/checkout/orders  (create + capture)
  - Payouts API: POST /v1/payments/payouts  (instant disbursal)
"""

import httpx
import uuid
import logging
import config
from config import PAYPAL_BASE_URL

logger = logging.getLogger("impactpulse.paypal")


def is_live_sandbox_configured() -> bool:
    """Check if valid PayPal Sandbox credentials are provided."""
    return bool(
        config.PAYPAL_CLIENT_ID
        and config.PAYPAL_CLIENT_SECRET
        and not config.PAYPAL_CLIENT_ID.startswith("your_")
        and not config.PAYPAL_CLIENT_SECRET.startswith("your_")
    )


async def get_access_token() -> str:
    """
    Obtain an OAuth 2.0 access token from PayPal Sandbox.
    Uses Basic Auth with client_id:client_secret.
    """
    if not is_live_sandbox_configured():
        return f"sandbox_access_token_{uuid.uuid4().hex[:16]}"

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYPAL_BASE_URL}/v1/oauth2/token",
            data={"grant_type": "client_credentials"},
            auth=(config.PAYPAL_CLIENT_ID, config.PAYPAL_CLIENT_SECRET),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=15.0,
        )
        response.raise_for_status()
        data = response.json()
        logger.info("PayPal Sandbox access token obtained successfully")
        return data["access_token"]


async def create_order(
    task_batch_id: str,
    num_tasks: int,
    price_per_task: float,
    currency: str = "USD",
) -> dict:
    """
    Create a PayPal Checkout order for a task batch with multi-currency support.

    Args:
        task_batch_id: Unique identifier for the task batch
        num_tasks: Number of tasks in the batch
        price_per_task: Price per task in specified currency
        currency: ISO 4217 currency code (USD, EUR, GBP, CAD, AUD, JPY, etc.)

    Returns:
        dict with order_id, status, approve_url, and currency
    """
    curr = (currency or "USD").upper()
    total_amount = round(num_tasks * price_per_task, 2)
    # Format precision: JPY has 0 decimal places
    amount_str = f"{int(round(total_amount))}" if curr == "JPY" else f"{total_amount:.2f}"

    if not is_live_sandbox_configured():
        order_id = f"SANDBOX-ORD-{uuid.uuid4().hex[:10].upper()}"
        approve_url = f"https://www.sandbox.paypal.com/checkoutnow?token={order_id}"
        logger.info(f"[PAYPAL SANDBOX] Order created: {order_id} for {amount_str} {curr}")
        return {
            "order_id": order_id,
            "status": "CREATED",
            "approve_url": approve_url,
            "total_amount": amount_str,
            "currency": curr,
        }

    access_token = await get_access_token()
    order_payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "reference_id": task_batch_id,
                "description": f"ImpactPulse AI — {num_tasks} Micro-Task Batch Escrow ({curr})",
                "custom_id": task_batch_id,
                "amount": {
                    "currency_code": curr,
                    "value": amount_str,
                },
            }
        ],
        "application_context": {
            "brand_name": "ImpactPulse AI",
            "landing_page": "NO_PREFERENCE",
            "user_action": "PAY_NOW",
            "return_url": "http://localhost:5173/organization?capture=true",
            "cancel_url": "http://localhost:5173/organization?cancelled=true",
        },
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYPAL_BASE_URL}/v2/checkout/orders",
            json=order_payload,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            timeout=15.0,
        )
        response.raise_for_status()
        data = response.json()

    approve_url = ""
    for link in data.get("links", []):
        if link["rel"] == "approve":
            approve_url = link["href"]
            break

    result = {
        "order_id": data["id"],
        "status": data["status"],
        "approve_url": approve_url,
        "total_amount": amount_str,
        "currency": curr,
    }
    logger.info(f"PayPal Sandbox order created: {result['order_id']} ({amount_str} {curr})")
    return result


async def capture_order(order_id: str) -> dict:
    """
    Capture a previously approved PayPal order.

    Args:
        order_id: The PayPal order ID to capture

    Returns:
        dict with order_id, status, payer_email, captured amount, and currency
    """
    if not is_live_sandbox_configured() or order_id.startswith("SANDBOX-ORD-") or order_id.startswith("DEMO-"):
        logger.info(f"[PAYPAL SANDBOX] Order {order_id} captured successfully")
        return {
            "order_id": order_id,
            "status": "COMPLETED",
            "payer_email": "sandbox.payer@business.example.com",
            "amount": "10.00",
            "currency": "USD",
        }

    access_token = await get_access_token()
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            timeout=15.0,
        )
        response.raise_for_status()
        data = response.json()

    payer_email = data.get("payer", {}).get("email_address", "sandbox@paypal.com")
    captures = data.get("purchase_units", [{}])[0].get("payments", {}).get("captures", [{}])
    amount = captures[0].get("amount", {}).get("value", "0.00") if captures else "0.00"
    currency = captures[0].get("amount", {}).get("currency_code", "USD") if captures else "USD"

    result = {
        "order_id": data["id"],
        "status": data["status"],
        "payer_email": payer_email,
        "amount": amount,
        "currency": currency,
    }
    logger.info(f"PayPal Sandbox order captured: {result['order_id']} — {amount} {currency}")
    return result


async def create_payout(
    worker_email: str,
    amount: float,
    task_id: str,
    currency: str = "USD",
) -> dict:
    """
    Send an instant payout to a worker via PayPal Payouts API in the specified currency.

    Args:
        worker_email: Worker's PayPal email address
        amount: Payout amount
        task_id: The task ID for audit tracking
        currency: ISO 4217 currency code (USD, EUR, GBP, CAD, AUD, JPY, etc.)

    Returns:
        dict with payout_batch_id, batch_status, receiver, amount, and currency
    """
    curr = (currency or "USD").upper()
    sender_batch_id = f"IPulse-{uuid.uuid4().hex[:10].upper()}"
    # Zero decimals for JPY, 2 decimals for others
    amount_str = f"{int(round(amount))}" if curr == "JPY" else f"{amount:.2f}"
    numeric_amount = float(int(round(amount))) if curr == "JPY" else round(amount, 2)

    if not is_live_sandbox_configured():
        logger.info(f"[PAYPAL SANDBOX] Payout executed: {sender_batch_id} to {worker_email} for {amount_str} {curr}")
        return {
            "payout_batch_id": sender_batch_id,
            "batch_status": "SUCCESS",
            "receiver": worker_email,
            "amount": numeric_amount,
            "currency": curr,
        }

    access_token = await get_access_token()
    payout_payload = {
        "sender_batch_header": {
            "sender_batch_id": sender_batch_id,
            "email_subject": f"ImpactPulse AI — Your Task Earnings in {curr} Have Arrived",
            "email_message": f"Your micro-task submission was audited and approved by AI. Disbursal of {amount_str} {curr} completed.",
        },
        "items": [
            {
                "recipient_type": "EMAIL",
                "amount": {
                    "value": amount_str,
                    "currency": curr,
                },
                "receiver": worker_email,
                "note": f"Payment for audited task {task_id} ({curr})",
                "sender_item_id": task_id,
            }
        ],
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{PAYPAL_BASE_URL}/v1/payments/payouts",
                json=payout_payload,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json",
                },
                timeout=15.0,
            )
            response.raise_for_status()
            data = response.json()

        batch_header = data.get("batch_header", {})
        result = {
            "payout_batch_id": batch_header.get("payout_batch_id", sender_batch_id),
            "batch_status": batch_header.get("batch_status", "PENDING"),
            "receiver": worker_email,
            "amount": numeric_amount,
            "currency": curr,
            "error": None,
        }
        logger.info(f"PayPal Sandbox payout created: {result['payout_batch_id']} → {worker_email} ({amount_str} {curr})")
        return result
    except httpx.HTTPStatusError as e:
        err_msg = "PayPal Payouts API rejected request."
        try:
            err_json = e.response.json()
            err_msg = err_json.get("message") or err_json.get("name") or str(e)
        except Exception:
            err_msg = f"HTTP {e.response.status_code}: {str(e)}"
        logger.error(f"PayPal Sandbox Payouts error: {err_msg}")
        return {
            "payout_batch_id": sender_batch_id,
            "batch_status": "FAILED",
            "receiver": worker_email,
            "amount": numeric_amount,
            "currency": curr,
            "error": err_msg,
        }
    except Exception as e:
        logger.error(f"PayPal Payouts connection error: {e}")
        return {
            "payout_batch_id": sender_batch_id,
            "batch_status": "FAILED",
            "receiver": worker_email,
            "amount": numeric_amount,
            "currency": curr,
            "error": str(e),
        }



async def get_payout_status(payout_batch_id: str) -> dict:
    """
    Check the status of a payout batch.
    """
    if not is_live_sandbox_configured() or payout_batch_id.startswith("IPulse-"):
        return {
            "payout_batch_id": payout_batch_id,
            "batch_status": "SUCCESS",
            "time_completed": "2026-11-11T07:00:00Z",
            "items": [],
        }

    access_token = await get_access_token()
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{PAYPAL_BASE_URL}/v1/payments/payouts/{payout_batch_id}",
            headers={
                "Authorization": f"Bearer {access_token}",
            },
            timeout=15.0,
        )
        response.raise_for_status()
        data = response.json()

    batch_header = data.get("batch_header", {})
    return {
        "payout_batch_id": batch_header.get("payout_batch_id"),
        "batch_status": batch_header.get("batch_status"),
        "time_completed": batch_header.get("time_completed"),
        "items": data.get("items", []),
    }
