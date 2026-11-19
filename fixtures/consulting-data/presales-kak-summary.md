# Government Tender KAK Summary (Presales Fixture — Perpres 46/2025)

- **Procurement Framework**: Perpres No. 46 Tahun 2025 (perubahan Perpres 16/2018), ketentuan PDN/TKDN & alokasi UMKK >= 40%.
- **Deliverable Requested**: Provider RAB / BoQ estimate (NOT official PPK HPS!), 3-scenario server capacity sizing (Conservative / Expected / Stress), 3-year TCO/NPV, Assumption Register, and Bid/No-Bid Scorecard.
- **Workload Inputs**:
  - Active civil servants: 12,000 users
  - Expected peak concurrency: 1,500 concurrent users (Stress: 3,500 concurrent users)
  - Average API service demand: 45ms CPU per request, 8 req/min per active concurrent user
  - Data retention: 5 years, ~180 GB/year structured PostgreSQL + 1.2 TB/year PDF attachments
  - SLA target: 99.9% availability, RPO <= 15 minutes, RTO <= 2 hours
