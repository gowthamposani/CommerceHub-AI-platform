# AI Module Documentation

## Purpose

The AI module generates marketplace-ready product description content for Admin users. It is designed around a provider abstraction so the implementation can switch between mock, OpenAI, and Gemini providers without changing route or service code.

## Endpoint

Base URL: `/api/v1`

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/ai/product-description` | Generate product title, description, SEO metadata, highlights, and keywords. |

## Request

```json
{
  "product_name": "Smart Speaker",
  "brand": "CommerceHub",
  "category": "Electronics",
  "specifications": ["Room-filling sound", "Connectivity: Wi-Fi"]
}
```

## Response

```json
{
  "success": true,
  "message": "Description generated successfully",
  "data": {
    "title": "CommerceHub Smart Speaker",
    "description": "Generated product description.",
    "seo_title": "CommerceHub Smart Speaker",
    "seo_description": "Generated SEO description.",
    "highlights": [],
    "keywords": []
  }
}
```

## Provider Architecture

```text
backend/app/api/ai/routes.py
  -> backend/app/services/ai_service.py
  -> backend/app/utils/ai_provider.py
  -> MockAIProvider | OpenAIProvider | GeminiProvider
```

## Provider Selection

Environment variable:

```text
AI_PROVIDER=MOCK
```

Supported values:

- `MOCK`
- `OPENAI`
- `GEMINI`

If the selected provider requires an API key and the key is missing, the module falls back to `MockAIProvider`.

## Environment Variables

- `AI_PROVIDER`
- `GEMINI_API_KEY`
- `OPENAI_API_KEY`
- `GEMINI_MODEL`
- `GEMINI_TIMEOUT_SECONDS`
- `GEMINI_MAX_RETRIES`
- `GEMINI_RETRY_BACKOFF_SECONDS`

## Frontend

Page:

- `frontend/src/pages/admin/AIProductGenerator.tsx`

Service and hook:

- `frontend/src/services/ai.service.ts`
- `frontend/src/hooks/useAIGenerator.ts`
- `frontend/src/types/ai.ts`

## Known Limitations

- OpenAI and Gemini providers are stubs.
- Real prompt engineering and external provider integration are pending.
- API keys must never be committed.

## Integration TODOs

- Add Gemini SDK or HTTP client integration.
- Add OpenAI-compatible provider integration if required.
- Add provider-specific timeout and retry policy tests.
- Add audit logging once shared audit infrastructure exists.
