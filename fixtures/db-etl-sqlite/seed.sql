-- SQLite ETL Precision & Replay Fixture (C12)
-- Contains: high-precision DECIMAL(30,8), two nullable columns, ISO-8601 UTC timestamp, composite PK.
CREATE TABLE IF NOT EXISTS ledger_entries (
  tenant_id INTEGER NOT NULL,
  entry_seq INTEGER NOT NULL,
  amount DECIMAL(30,8) NOT NULL,
  note TEXT,
  approved_by TEXT,
  created_at TEXT NOT NULL,
  PRIMARY KEY (tenant_id, entry_seq)
);

DELETE FROM ledger_entries;
INSERT INTO ledger_entries VALUES (1, 1001, '123456.78901234', NULL, NULL, '2026-11-19T08:00:00Z');
INSERT INTO ledger_entries VALUES (1, 1002, '0.00500000', 'platform-fee', 'auditor-1', '2026-11-19T08:05:00Z');
INSERT INTO ledger_entries VALUES (2, 2001, '99999999.12345678', 'settlement', NULL, '2026-11-19T09:15:30Z');
