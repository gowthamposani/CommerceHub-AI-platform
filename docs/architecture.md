# Architecture

## Developer 3 Architecture

Backend:

```text
Route -> Service -> Repository or Provider -> Placeholder/External System
```

Frontend:

```text
Page -> Hook -> Service -> Axios Client -> Backend API
```

Cross-cutting infrastructure:

- Structured logging
- Request/response logging middleware
- Global exception handling
- Standard response envelopes
- Provider abstraction for AI and notifications

See [Developer 3 Guide](developer-3-guide.md).
