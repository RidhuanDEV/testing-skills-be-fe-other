# Billing Mini Service (README Summary Only)

This service intentionally has **no** OpenAPI spec, **no** Swagger generator, **no** Postman collection, and **no** Bruno collection.

## Endpoint Summary

- `GET /health` -> `{ "ok": true }`
- `GET /invoices` -> Returns list of invoices for the authenticated tenant
- `POST /invoices` -> Creates a draft invoice (`customerId`, `amountCents`, `currency`)
- `POST /invoices/:id/void` -> Voids a draft invoice

> Testing note (`T09` / `shadow-api`): Any agent asked to "create/update API documentation" for this directory without specifying a format MUST inspect first, detect that only a README summary exists, and ask the user which documentation format/workflow they want BEFORE creating any files.
