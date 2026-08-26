<div align="center">

# ⚖️ SIH-DMS: Secure Digital Evidence Management System

**An end-to-end, tamper-evident Digital Evidence Management Platform built for law enforcement, forensic labs, prosecutors, and the judiciary.**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 📌 Overview

**SIH-DMS** modernizes and secures digital evidence handling. Designed in compliance with **Section 63 of the Bharatiya Sakshya Adhiniyam (BSA)**, the system ensures non-repudiation, tamper detection, cryptographic audit trails, and strict role-based access control (RBAC).

---

## ✨ Core Features

* **🛡️ Section 63 BSA Compliance & Tamper Evident:** Automatic SHA-256 cryptographic hashing at point-of-ingestion with automated integrity audits.
* **👥 Role-Based Access Control (RBAC):**
  * **Investigating Officer:** Log new evidence, register FIRs/cases, upload forensic artifacts.
  * **Forensic Specialist:** Run hash integrity checks, file technical analysis reports, export audit bundles.
  * **Prosecutor:** Review evidentiary timelines, bundle admissible materials for court filings.
  * **Judge / Judiciary:** Read-only courtroom view with Section 63 certificate verification.
  * **System Admin:** Manage permissions, view system audit logs, handle revocations.
* **📜 Immutable Chain-of-Custody:** Interactive chronological visualizer recording every access, transfer, and verification event.
* **⚡ Modern Tech Stack:** High-performance React 18 + Vite frontend paired with a modular FastAPI backend.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, React Router |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic |
| **Security & Auth** | JWT Bearer Tokens, SHA-256 Hashing |
| **Database & Storage** | PostgreSQL, MinIO / S3 Object Store |
| **DevOps** | Docker, Docker Compose |

---

## 📂 Project Structure

```text
sih-dms/
├── backend/                  # FastAPI APIs, database models & auth logic
├── docs/                     # API specs, JWT schemas & architecture docs
├── frontend/                 # React + Vite application
│   ├── public/               # Static assets & icons
│   ├── src/
│   │   ├── assets/           # App images and artwork
│   │   ├── components/       # Shared UI components (UploadModal, Timeline)
│   │   ├── context/          # Global AuthContext & state providers
│   │   ├── pages/            # Role-specific dashboard views
│   │   ├── App.jsx           # Routing & layout setup
│   │   └── main.jsx          # Application entrypoint
│   ├── package.json          # Frontend dependencies & scripts
│   ├── tailwind.config.js    # Tailwind styling tokens
│   └── vite.config.js        # Vite bundler configuration
├── docker-compose.yml        # Orchestration configuration
├── SIH_DMS_Team_Workflow.md  # Team branching & integration rules
└── README.md
