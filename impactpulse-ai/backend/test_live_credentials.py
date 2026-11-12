import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")

print(f"PayPal Client ID loaded: {PAYPAL_CLIENT_ID[:8]}... (length={len(PAYPAL_CLIENT_ID) if PAYPAL_CLIENT_ID else 0})")
print(f"PayPal Secret loaded: {PAYPAL_CLIENT_SECRET[:8]}... (length={len(PAYPAL_CLIENT_SECRET) if PAYPAL_CLIENT_SECRET else 0})")
print(f"Gemini Key loaded: {GEMINI_API_KEY[:8]}... (length={len(GEMINI_API_KEY) if GEMINI_API_KEY else 0})")
print(f"Gemini Model: {GEMINI_MODEL}")

async def test_paypal():
    url = "https://api-m.sandbox.paypal.com/v1/oauth2/token"
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(
                url,
                data={"grant_type": "client_credentials"},
                auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET),
                headers={"Content-Type": "application/x-www-form-urlencoded"},
                timeout=15.0
            )
            print(f"PayPal OAuth Response Status: {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                print("PAYPAL OAUTH SUCCESS! Token scope:", data.get("scope"))
                print("Token type:", data.get("token_type"))
                print("App ID:", data.get("app_id"))
                return data.get("access_token")
            else:
                print("PayPal Error:", resp.text)
                return None
        except Exception as e:
            print("PayPal connection exception:", e)
            return None

def test_gemini():
    from google import genai
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents="Respond with only: LIVE_VERIFIED_SUCCESS"
        )
        print(f"Gemini Response: {response.text.strip()}")
        return True
    except Exception as e:
        print("Gemini API exception:", e)
        return False

async def main():
    print("--- Testing PayPal Sandbox Connection ---")
    token = await test_paypal()
    print("\n--- Testing Google Gemini API Connection ---")
    gemini_ok = test_gemini()
    print(f"\nSummary: PayPal={bool(token)}, Gemini={gemini_ok}")

if __name__ == "__main__":
    asyncio.run(main())
