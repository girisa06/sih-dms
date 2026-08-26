# Judge Q&A

## Privacy and DPDP

The design uses case-scoped RBAC, least-privilege access, expiry-based sharing, and an audit log of document actions. A production deployment must add retention/deletion policies, data-principal request handling where applicable, breach response, risk assessment, and government-approved hosting/key-management. The demo dataset is synthetic.

## ICJS integration

Secure DMS is an integration layer, not an ICJS replacement. A production connector would exchange approved metadata/documents through authenticated, versioned APIs, map case identifiers, and preserve evidence hashes and audit events. Agencies retain data-sharing governance.

## Deployment path

Pilot in one district with synthetic test data; complete security review and load testing; connect approved identity, storage, and key-management services; then expand with monitoring, backups, incident response, and operator training. Demo credentials and Compose settings are not production configuration.
