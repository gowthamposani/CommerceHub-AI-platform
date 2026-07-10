# Database Design

## Developer 3 Database Notes

Developer 3 does not currently define SQLAlchemy models or database tables.

Current behavior:

- Admin repository returns placeholder data.
- AI module does not persist generated content.
- Notification module does not persist notification history.

Future integration:

- User, Seller, Product, Category, Inventory, and Order tables are owned by other developers.
- Notification persistence should be added only after storage ownership and schema design are agreed.
- AI generation audit/history storage should be added only after product and audit requirements are finalized.
