"""
ImpactPulse AI — Multi-Currency Global Settlement Engine
Supports ISO 4217 international currencies compatible with PayPal Sandbox & Live Rails:
Orders API v2 and Payouts API v1.

NOTE ON EXCHANGE RATES:
Exchange rates defined here are fixed indicative benchmark rates used for demo,
sandbox telemetry normalization, and unit economic calculations. Production
deployments integrate live FX feeds or PayPal's dynamic currency conversion APIs.
"""

from typing import Dict, Any, List

EXCHANGE_RATE_DISCLAIMER = (
    "Indicative Benchmark Rates for Demo/Sandbox Telemetry. "
    "Production deployments consume real-time FX feeds or PayPal Native Conversion."
)

# Standard PayPal-supported global currencies with format specification

SUPPORTED_CURRENCIES: Dict[str, Dict[str, Any]] = {
    "USD": {
        "code": "USD",
        "symbol": "$",
        "name": "United States Dollar",
        "decimals": 2,
        "rate_to_usd": 1.00,
        "region": "Global / North America",
    },
    "EUR": {
        "code": "EUR",
        "symbol": "€",
        "name": "Euro",
        "decimals": 2,
        "rate_to_usd": 1.08,
        "region": "European Union",
    },
    "GBP": {
        "code": "GBP",
        "symbol": "£",
        "name": "British Pound Sterling",
        "decimals": 2,
        "rate_to_usd": 1.28,
        "region": "United Kingdom",
    },
    "CAD": {
        "code": "CAD",
        "symbol": "C$",
        "name": "Canadian Dollar",
        "decimals": 2,
        "rate_to_usd": 0.72,
        "region": "Canada",
    },
    "AUD": {
        "code": "AUD",
        "symbol": "A$",
        "name": "Australian Dollar",
        "decimals": 2,
        "rate_to_usd": 0.65,
        "region": "Australia",
    },
    "JPY": {
        "code": "JPY",
        "symbol": "¥",
        "name": "Japanese Yen",
        "decimals": 0,
        "rate_to_usd": 0.0065,
        "region": "Japan",
    },
    "INR": {
        "code": "INR",
        "symbol": "₹",
        "name": "Indian Rupee",
        "decimals": 2,
        "rate_to_usd": 0.012,
        "region": "India",
    },
    "SGD": {
        "code": "SGD",
        "symbol": "S$",
        "name": "Singapore Dollar",
        "decimals": 2,
        "rate_to_usd": 0.75,
        "region": "Singapore",
    },
    "CHF": {
        "code": "CHF",
        "symbol": "CHF",
        "name": "Swiss Franc",
        "decimals": 2,
        "rate_to_usd": 1.13,
        "region": "Switzerland",
    },
    "BRL": {
        "code": "BRL",
        "symbol": "R$",
        "name": "Brazilian Real",
        "decimals": 2,
        "rate_to_usd": 0.17,
        "region": "Brazil",
    },
    "MXN": {
        "code": "MXN",
        "symbol": "Mex$",
        "name": "Mexican Peso",
        "decimals": 2,
        "rate_to_usd": 0.049,
        "region": "Mexico",
    },
    "HKD": {
        "code": "HKD",
        "symbol": "HK$",
        "name": "Hong Kong Dollar",
        "decimals": 2,
        "rate_to_usd": 0.128,
        "region": "Hong Kong",
    },
    "NZD": {
        "code": "NZD",
        "symbol": "NZ$",
        "name": "New Zealand Dollar",
        "decimals": 2,
        "rate_to_usd": 0.59,
        "region": "New Zealand",
    },
    "SEK": {
        "code": "SEK",
        "symbol": "kr",
        "name": "Swedish Krona",
        "decimals": 2,
        "rate_to_usd": 0.093,
        "region": "Sweden",
    },
    "PHP": {
        "code": "PHP",
        "symbol": "₱",
        "name": "Philippine Peso",
        "decimals": 2,
        "rate_to_usd": 0.017,
        "region": "Philippines",
    },
}


def is_valid_currency(currency_code: str) -> bool:
    """Check if the currency code is supported by PayPal and ImpactPulse."""
    return (currency_code or "").upper() in SUPPORTED_CURRENCIES


def get_currency_info(currency_code: str) -> Dict[str, Any]:
    """Retrieve full currency metadata."""
    code = (currency_code or "USD").upper()
    return SUPPORTED_CURRENCIES.get(code, SUPPORTED_CURRENCIES["USD"])


def format_amount(amount: float, currency_code: str = "USD") -> str:
    """Format numeric amount according to currency precision (0 decimals for JPY, 2 for others)."""
    info = get_currency_info(currency_code)
    if info["decimals"] == 0:
        return f"{int(round(amount))}"
    return f"{amount:.2f}"


def format_currency_display(amount: float, currency_code: str = "USD") -> str:
    """Format full display string with currency symbol and code, e.g. '$1.60 USD' or '¥250 JPY'."""
    info = get_currency_info(currency_code)
    formatted = format_amount(amount, currency_code)
    return f"{info['symbol']}{formatted} {info['code']}"


def convert_amount(amount: float, from_curr: str, to_curr: str) -> float:
    """Convert amount between any two supported currencies via USD base."""
    f_info = get_currency_info(from_curr)
    t_info = get_currency_info(to_curr)

    # Convert to USD base
    amount_in_usd = amount * f_info["rate_to_usd"]

    # Convert from USD base to target
    converted = amount_in_usd / t_info["rate_to_usd"]

    if t_info["decimals"] == 0:
        return float(int(round(converted)))
    return round(converted, 2)


def get_supported_currencies_list() -> List[Dict[str, Any]]:
    """Return all supported currencies for frontend selectors."""
    return list(SUPPORTED_CURRENCIES.values())
