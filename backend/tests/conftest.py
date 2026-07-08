"""Shared backend test fixtures."""

from __future__ import annotations

import httpx
import pytest


@pytest.fixture(autouse=True, scope="session")
def patch_httpx_testclient_compatibility() -> None:
    """Allow Starlette TestClient to run with newer httpx versions."""
    if getattr(httpx.Client.__init__, "_commercehub_patched", False):
        return

    original_init = httpx.Client.__init__

    def patched_init(
        self: httpx.Client,
        *args: object,
        app: object = None,
        **kwargs: object,
    ) -> None:
        original_init(self, *args, **kwargs)

    patched_init._commercehub_patched = True  # type: ignore[attr-defined]
    httpx.Client.__init__ = patched_init  # type: ignore[method-assign]
