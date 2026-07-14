# 🛡️ AURA (AIRA User Rights Auditor)

AURA is a centralized Identity & Access Management (IAM) auditing platform developed for **AIRA Securities**. It enables administrators to search employee accounts, verify user permissions, and audit access across multiple enterprise systems through a single unified interface.

Instead of manually accessing each system individually, AURA performs parallel searches across all connected systems and presents the results in a unified dashboard with complete audit logging.

---

## ✨ Features

- 🔐 JWT Authentication & Role-based Authorization
- 🔍 Unified Employee Search across 10 Enterprise Systems
- ⚡ Parallel Query Processing with Promise.all()
- 📊 Security Audit Logs
- 🧩 Legacy Informix Integration via Bridge Service
- 📈 Dashboard & Search Analytics
- 🛡️ Fault Isolation & Error Handling
- 📄 Swagger API Documentation

---

## 🏗️ System Architecture

```mermaid
graph TD
    User([Admin])

    User --> FE[React + Tailwind]

    FE -->|REST API| BE[NestJS]

    BE --> SQL[(9 SQL Server Databases)]

    BE --> Bridge[Express Bridge]

    Bridge --> EXE[SbaQuery32.exe]

    EXE --> IFX[(Informix)]
```

---

# 🔧 Tech Stack

## Backend

| Technology | Description |
|------------|-------------|
| NestJS | Backend Framework |
| TypeScript | Programming Language |
| Prisma ORM | Database ORM |
| SQL Server | Enterprise Databases |
| JWT | Authentication |
| Passport | Authorization |
| Swagger | API Documentation |

---

## Frontend

| Technology | Description |
|------------|-------------|
| React | Frontend Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Axios | HTTP Client |
| SweetAlert2 | Dialog |

---

## Bridge Service

| Technology | Purpose |
|------------|---------|
| Express.js | API Gateway |
| C# CLI | Informix Connector |
| ODBC | Database Driver |

---

# 📋 Core Features

## 🔍 Unified Search

Search employee accounts across

- AIRA
- ATSRequest
- Forecast
- GlobalTrade
- IPO Plus
- MTC
- PreConfirm
- TfexMIS
- ICONIX
- SBA

### Features

- Exact Employee Search
- Parallel Database Queries
- Keyword Normalization
- Unified Response
- Active User Detection

---

## ⚡ Parallel Query Engine

The backend executes all database queries concurrently using **Promise.all()**, reducing response time while maintaining system reliability.

### Workflow

```text
Input

 ↓

Normalize Keyword

 ↓

Parallel Query

 ↓

Data Transformation

 ↓

Unified Response

 ↓

Audit Log
```

---

## 📊 Audit Logs

Every search request records

- Administrator
- Search Keyword
- IP Address
- Browser
- Timestamp

---

## 🌉 Legacy Bridge

```text
NestJS

↓

Axios

↓

Express

↓

SbaQuery32.exe

↓

Informix
```

---

# 📁 Project Structure

```text
aura/

├── aura-backend/
├── aura-frontend/
└── sba-bridge-service/
```

---

# 📡 API

## Authentication

```http
POST /auth/login
GET  /auth/profile
```

## Search

```http
POST /search
```

## Audit Logs

```http
GET /audit-logs
```

---

# 🚀 Getting Started

## Backend

```bash
cd aura-backend
npm install
npm run start:dev
```

---

## Frontend

```bash
cd aura-frontend
npm install
npm run dev
```

---

## Bridge

```bash
cd sba-bridge-service
npm install
node index.js
```

---

# 🚀 Future Enhancements

- Redis Cache
- Docker
- Kubernetes
- Elasticsearch
- Health Check
- Monitoring

---

# 👨‍💻 Developer

Developed with ❤️ by **Sitthidet Thongsawang**

## 🖥️ Screenshots
<img width="1911" height="985" alt="image" src="https://github.com/user-attachments/assets/d991dff5-ee05-4613-bd11-ae7860e12a24" />
<img width="1912" height="985" alt="image" src="https://github.com/user-attachments/assets/42bde8f0-d1ec-417f-bec3-e89126f5840b" />
<img width="1903" height="984" alt="image" src="https://github.com/user-attachments/assets/ec0c4efe-a3c4-43d6-85dd-02667c4d743b" />
<img width="1894" height="978" alt="image" src="https://github.com/user-attachments/assets/7d32d3ca-9375-4e7a-a5b9-7212125156ae" />
<img width="1914" height="991" alt="image" src="https://github.com/user-attachments/assets/5f28c3d7-3e4f-450f-9474-2b42015eccf8" />
<img width="1913" height="986" alt="image" src="https://github.com/user-attachments/assets/063695f8-fd88-43ee-8240-cc3e2ca19639" />
<img width="1900" height="1005" alt="image" src="https://github.com/user-attachments/assets/a5b7599d-6651-498e-9a88-30a79705e389" />

