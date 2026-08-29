<div align="center">
  <h1>🧬 TrialBridge AI</h1>
  <p><strong>Next-Generation Clinical Trial Matching Engine powered by Vector Search and NLP.</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  </p>
</div>

## 📖 Overview

**TrialBridge AI** is an advanced, full-stack healthcare platform designed to bridge the gap between clinical researchers and patients. By utilizing **Qdrant Vector Databases** and **semantic NLP embeddings**, TrialBridge automates the evaluation of complex genomic profiles against clinical trial inclusion criteria. 

This platform eliminates manual screening overhead by instantly generating high-accuracy candidate pipelines for researchers, while offering patients a seamless, intuitive dashboard to manage their medical data and receive direct trial invitations.

## ✨ Key Features

- **🔍 Reverse AI Matching**: Semantic vector search instantly pairs patients with highly relevant clinical trials based on medical history, conditions, and genomic markers (e.g., BRCA1).
- **👥 Role-Based Portals**: Distinct, secure dashboards tailored for **Patients**, **Researchers**, and **Administrators**.
- **📩 End-to-End Invitation System**: Researchers can send direct trial invitations to matched patients. Patients receive real-time UI updates to accept or decline offers via their dashboard.
- **⚡ High Performance**: Capable of processing 5,000+ clinical records with sub-50ms search latency using highly optimized Vector DB lookups.
- **🎨 Premium UI/UX**: Built with Tailwind CSS, featuring modern glassmorphism elements, fluid animations, and optimistic state management.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js (App Router), React
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **State Management**: React Hooks, Context API

### Backend & AI
- **Framework**: FastAPI
- **Language**: Python
- **Database**: SQLite (Relational), SQLAlchemy ORM
- **Vector Engine**: Qdrant (Semantic Search & Candidate Matching)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/IshaanVerma2204/TrialBridge-AI.git
   cd TrialBridge-AI
   ```

2. **Run the application:**
   The project includes an automated startup script for Windows that initializes both the FastAPI backend and the Next.js frontend concurrently.
   ```cmd
   .\start.bat
   ```

3. **Access the Application:**
   - Frontend: `http://localhost:3000`
   - Backend API Docs (Swagger): `http://localhost:8000/docs`

## 💻 User Workflows

### 👨‍⚕️ For Researchers
1. Login to the Researcher Portal.
2. View active clinical trials.
3. Select a trial to instantly view the AI-generated list of matched candidates (anonymized for privacy).
4. Review compatibility scores and send trial invitations.

### 🧑‍🦽 For Patients
1. Login to the Patient Portal.
2. Complete your medical profile (Age, Conditions, Genomic Markers).
3. Review your **AI Trial Matches**.
4. View and respond to pending **Trial Invitations** directly from researchers.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/IshaanVerma2204/TrialBridge-AI/issues).

## 📄 License
This project is licensed under the MIT License.
