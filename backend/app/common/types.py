"""Reusable custom type aliases."""

from typing import NewType
from uuid import UUID

EntityId = NewType("EntityId", UUID)
TraceId = NewType("TraceId", str)

