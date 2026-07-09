# User Flows

## Admin Dashboard Flow

```text
Admin opens /admin/dashboard
  -> Frontend hook requests /api/v1/admin/dashboard
  -> Backend returns dashboard envelope
  -> UI renders cards, charts, activity, notifications, and status
```

## AI Product Description Flow

```text
Admin opens /admin/ai-tools
  -> Admin fills product form
  -> Frontend posts /api/v1/ai/product-description
  -> Backend service calls AI provider abstraction
  -> UI renders title, description, SEO fields, keywords, and highlights
```

## Notification Flow

```text
Admin opens /admin/notifications
  -> Frontend loads templates and history
  -> Admin sends notification
  -> Backend service calls notification provider abstraction
  -> UI refreshes notification data
```
