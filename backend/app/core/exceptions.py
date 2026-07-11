"""Backward-compatible exception exports."""

from app.exceptions.base import ApplicationError, DatabaseApplicationError
from app.exceptions.handlers import register_exception_handlers

__all__ = ["ApplicationError", "DatabaseApplicationError", "register_exception_handlers"]
