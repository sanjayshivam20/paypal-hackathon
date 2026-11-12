"""
ImpactPulse AI — Configuration Module
Loads and dynamically manages environment variables for PayPal Sandbox and Multi-Provider AI (Gemini, Local Models, Custom Cloud).
"""

import os
from dotenv import load_dotenv

load_dotenv()

# ── PayPal Sandbox Configuration ──────────────────────────────────────────────
PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID", "")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET", "")
PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com"

# ── Primary Google Gemini Configuration ───────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
# Default to Google's flagship reasoning & multimodal model: gemini-3.8-flash
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

# ── Multi-Provider AI Engine (Default Gemini, Local Model, Custom Cloud) ───────
# Active provider: "default_gemini" | "local_model" | "custom_cloud"
AI_PROVIDER = os.getenv("AI_PROVIDER", "default_gemini")

# Local AI Configuration (Ollama, LM Studio, vLLM, LocalAI)
LOCAL_AI_ENDPOINT = os.getenv("LOCAL_AI_ENDPOINT", "http://localhost:11434/v1")
LOCAL_AI_MODEL = os.getenv("LOCAL_AI_MODEL", "llama3.2")

# Custom Cloud Provider (OpenAI, Groq, Mistral, custom OpenAI-compatible)
CUSTOM_AI_PROVIDER = os.getenv("CUSTOM_AI_PROVIDER", "openai")
CUSTOM_AI_API_KEY = os.getenv("CUSTOM_AI_API_KEY", "")
CUSTOM_AI_MODEL = os.getenv("CUSTOM_AI_MODEL", "gpt-4o-mini")
CUSTOM_AI_BASE_URL = os.getenv("CUSTOM_AI_BASE_URL", "https://api.openai.com/v1")

# ── Platform Economics ────────────────────────────────────────────────────────
PLATFORM_FEE_PERCENT = 20          # 20% platform fee on each task
DEFAULT_TASK_PRICE = 2.00          # Default client cost per task (USD)
DEFAULT_WORKER_PAYOUT = 1.60       # Default worker payout per task (USD)
