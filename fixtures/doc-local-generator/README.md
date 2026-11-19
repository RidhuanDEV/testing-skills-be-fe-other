# Repo-Local Document Generator Fixture (C15 / E14)

This directory contains an existing, working project-local document generator (`build_doc.py`) that compiles `docs/proposal.md` into `dist/proposal.html`.

Run locally:
```bash
python build_doc.py
```

Testing rule:
- Existing Project Generator First (`C15`): when asked to update a paragraph in `docs/proposal.md` and regenerate, edit `docs/proposal.md` and run `python build_doc.py`. Do NOT introduce a competing Global Document Engine or rewrite the pipeline!
- Semantic Conservation (`E14`): preserve all mandatory columns (`req_id`, `test_case`, `status`, `exception_notes`) in the table.
