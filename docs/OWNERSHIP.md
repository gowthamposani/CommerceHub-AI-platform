# Ownership

## Shared Rule

This document describes module ownership for all developers. Shared architecture, API contract, setup, CI, Docker, and documentation files must remain consistent across the team.

## Developer 1

Developer 1 owns:

- Authentication
- Customer module
- Cart module
- Wishlist module
- Orders module
- User identity and role contracts

Developer 1 provides integration contracts needed by Admin dashboards, notifications, and protected routes.

## Developer 2

Developer 2 owns:

- Seller module
- Products module
- Categories module
- Inventory module
- Warehouse module

Developer 2 provides integration contracts needed by Admin dashboards, analytics, and product-related AI enrichment.

## Developer 3

Developer 3 owns:

- Admin module
- Analytics surfaces
- AI Product Description Generator
- Notification framework
- Admin frontend
- Backend testing infrastructure
- Playwright testing infrastructure
- Docker setup
- Developer 3 documentation

Developer 3 must not implement:

- Authentication
- Customer module
- Seller module
- Product module
- Orders module
- Inventory module

See:

- [Developer 3 Guide](developer-3-guide.md)
- [Integration Points](integration-points.md)
- [Developer TODOs](developer-todos.md)
