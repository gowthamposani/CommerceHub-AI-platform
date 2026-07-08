"""Google Gemini provider integration for AI product descriptions."""

from __future__ import annotations

import json
import logging
import os
import time
from dataclasses import dataclass
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from .schemas import ProductDescriptionResponse


logger = logging.getLogger(__name__)


class GeminiProviderError(RuntimeError):
    """Raised when Gemini content generation fails."""


@dataclass(frozen=True, slots=True)
class GeminiProviderSettings:
    api_key: str
    model: str = "gemini-1.5-flash"
    endpoint_url: str = ""
    timeout_seconds: float = 30.0
    max_retries: int = 3
    retry_backoff_seconds: float = 1.0

    @classmethod
    def from_environment(cls) -> "GeminiProviderSettings":
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        model = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()
        endpoint_url = os.getenv("GEMINI_ENDPOINT_URL", "").strip()
        timeout_seconds = float(os.getenv("GEMINI_TIMEOUT_SECONDS", "30"))
        max_retries = int(os.getenv("GEMINI_MAX_RETRIES", "3"))
        retry_backoff_seconds = float(os.getenv("GEMINI_RETRY_BACKOFF_SECONDS", "1"))

        if not api_key:
            raise GeminiProviderError("GEMINI_API_KEY is not configured.")

        if not endpoint_url:
            endpoint_url = (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model}:generateContent"
            )

        return cls(
            api_key=api_key,
            model=model,
            endpoint_url=endpoint_url,
            timeout_seconds=timeout_seconds,
            max_retries=max_retries,
            retry_backoff_seconds=retry_backoff_seconds,
        )


class GeminiProvider:
    """Provider adapter responsible only for Google Gemini communication."""

    def __init__(self, settings: GeminiProviderSettings | None = None) -> None:
        self.settings = settings or GeminiProviderSettings.from_environment()

    def generate_product_description(self, prompt: str) -> ProductDescriptionResponse:
        """Generate product description content through Gemini."""
        for attempt in range(1, self.settings.max_retries + 1):
            try:
                logger.info(
                    "Calling Gemini product description provider.",
                    extra={"model": self.settings.model, "attempt": attempt},
                )
                payload = self._send_request(prompt=prompt)
                return self._parse_response(payload=payload)
            except (HTTPError, URLError, TimeoutError, GeminiProviderError) as exc:
                logger.warning(
                    "Gemini provider request failed.",
                    extra={"model": self.settings.model, "attempt": attempt},
                    exc_info=exc,
                )
                if attempt >= self.settings.max_retries:
                    raise GeminiProviderError("Gemini provider request failed.") from exc
                time.sleep(self.settings.retry_backoff_seconds * attempt)

        raise GeminiProviderError("Gemini provider request failed.")

    def _send_request(self, prompt: str) -> dict[str, Any]:
        request = Request(
            self.settings.endpoint_url,
            data=json.dumps(self._build_payload(prompt=prompt)).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": self.settings.api_key,
            },
            method="POST",
        )

        with urlopen(request, timeout=self.settings.timeout_seconds) as response:
            return json.loads(response.read().decode("utf-8"))

    @staticmethod
    def _build_payload(prompt: str) -> dict[str, Any]:
        return {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.35,
                "topP": 0.9,
                "responseMimeType": "application/json",
            },
        }

    def _parse_response(self, payload: dict[str, Any]) -> ProductDescriptionResponse:
        text_content = self._extract_text(payload=payload)
        parsed_content = self._parse_json_content(content=text_content)
        return ProductDescriptionResponse.model_validate(parsed_content)

    @staticmethod
    def _extract_text(payload: dict[str, Any]) -> str:
        candidates = payload.get("candidates", [])
        if not candidates:
            raise GeminiProviderError("Gemini returned no candidates.")

        parts = candidates[0].get("content", {}).get("parts", [])
        if not parts:
            raise GeminiProviderError("Gemini returned no content parts.")

        text_content = str(parts[0].get("text", "")).strip()
        if not text_content:
            raise GeminiProviderError("Gemini returned empty content.")

        return text_content

    @staticmethod
    def _parse_json_content(content: str) -> dict[str, Any]:
        cleaned_content = content.removeprefix("```json").removeprefix("```").removesuffix("```").strip()

        try:
            parsed = json.loads(cleaned_content)
        except json.JSONDecodeError as exc:
            raise GeminiProviderError("Gemini response is not valid JSON.") from exc

        return {
            "generated_description": parsed.get("generated_description", ""),
            "generated_keywords": parsed.get("generated_keywords", []),
            "seo_title": parsed.get("seo_title", ""),
            "meta_description": parsed.get("meta_description", ""),
            "highlights": parsed.get("highlights", []),
        }


AIProvider = GeminiProvider
AIProviderError = GeminiProviderError
