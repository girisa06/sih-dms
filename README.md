SIH-DMS: Secure Digital Evidence Management SystemAn end-to-end, tamper-evident Digital Evidence Management System (DMS) built for law enforcement, forensic investigators, prosecutors, and the judiciary. The system enforces strict chain-of-custody tracking, cryptographic integrity verification, and legal compliance under Section 63 of the Bharatiya Sakshya Adhiniyam (BSA).Key FeaturesSection 63 BSA Compliance & Tamper Detection: Automatic cryptographic SHA-256 hash generation on ingestion with real-time integrity verification and chain-of-custody logging.Role-Based Access Control (RBAC): Dedicated views and permissions for 5 core roles:Investigating Officer: Evidence ingestion, case assignment, metadata tagging.Forensic Specialist: Hash audit, extraction logs, artifact analysis reports.Prosecutor: Case file review, admissible evidence bundling.Judge / Court: Read-only verified trial view and integrity certificates.Admin: System audits, user provisioning, access revocations.Immutable Chain of Custody: Timeline visualizer detailing every transfer, review, and verification event.Containerized Architecture: Docker Compose orchestration for unified local development and deployment.Tech StackLayerTechnologyFrontendReact 18, Vite, Tailwind CSS, Lucide React, React RouterBackendPython (FastAPI / Uvicorn), JWT AuthenticationDatabase & StoragePostgreSQL, MinIO / Local Object StorageDevOpsDocker, Docker ComposeRepository StructurePlaintextsih-dms/
├── backend/                  # FastAPI service, database models, schemas, and API routes
├── docs/                     # JWT contracts, API specifications, and design docs
├── frontend/                 # React + Vite application
│   ├── public/               # Static assets & icons
│   ├── src/
│   │   ├── assets/           # UI media & brand assets
│   │   ├── components/       # Reusable components (UploadModal, Timeline, Shells)
│   │   ├── context/          # AuthContext & global state providers
│   │   ├── pages/            # Role-scoped dashboards & login views
│   │   ├── App.jsx           # App routing & protected layout wrappers
│   │   └── main.jsx          # DOM entrypoint
│   ├── package.json          # Node dependencies & run scripts
│   ├── tailwind.config.js    # Styling design tokens
│   └── vite.config.js        # Vite bundler configuration
├── docker-compose.yml        # Multi-container orchestration
├── SIH_DMS_Team_Workflow.md  # Internal team contract & branching strategy
└── README.md
Getting StartedPrerequisitesNode.js (v18+) & npmPython (v3.10+)Docker & Docker Compose (optional for containerized run)1. Frontend SetupBashcd frontend
npm install
npm run dev
The client will be running at http://localhost:5173.2. Backend SetupBashcd backend
python -m venv venv

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
API Documentation (Swagger UI) will be accessible at http://localhost:8000/docs.3. Full-Stack with Docker ComposeTo launch the complete application stack (frontend, backend, database):Bashdocker-compose up --build
Development WorkflowBranching: Create feature branches off main (feat/feature-name or fix/issue-name).Commit Hygiene: Use conventional commits (feat:, fix:, refactor:, chore:).Pull Requests: Open PRs against girisa06/sih-dms:main and ensure all conflicts are resolved prior to merging.
