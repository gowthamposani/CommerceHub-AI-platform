# API Contract

## Developer 3 APIs

Base URL:

```text
/api/v1
```

| Method | Endpoint | Module |
| --- | --- | --- |
| `GET` | `/admin/dashboard` | Admin |
| `GET` | `/admin/analytics` | Admin |
| `GET` | `/admin/users` | Admin |
| `GET` | `/admin/users/{user_id}` | Admin |
| `PATCH` | `/admin/users/{user_id}/status` | Admin |
| `PATCH` | `/admin/users/{user_id}/role` | Admin |
| `POST` | `/ai/product-description` | AI |
| `POST` | `/notifications/send` | Notifications |
| `GET` | `/notifications/templates` | Notifications |
| `GET` | `/notifications/history` | Notifications |

Detailed module documentation:

- [Admin Module Documentation](admin-module.md)
- [AI Module Documentation](ai-module.md)
- [Notification Module Documentation](notification-module.md)
