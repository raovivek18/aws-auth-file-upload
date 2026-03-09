# 🛡️ SecureVault: Advanced Cloud-Native File Sharing Platform

**SecureVault** is a production-ready, serverless file management and sharing platform built on AWS. It provides enterprise-grade security, real-time metadata synchronization, and a premium user experience for sensitive document management.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AWS Amplify](https://img.shields.io/badge/AWS-Amplify-FF9900?logo=aws-amplify&logoColor=white)](https://aws.amazon.com/amplify/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)

---

## 📖 Project Overview

SecureVault solves the problem of insecure file sharing by utilizing AWS’s robust identity and storage services. It allows users to securely upload, categorize, and share files via time-limited, cryptographically signed URLs. The application features a sleek, responsive dashboard designed with a "security-first" aesthetic.

### 🌟 Key Features
- **🔐 Multi-Factor Authentication (MFA)**: Secure user onboarding and login via Amazon Cognito.
- **📁 Encrypted Storage**: Private S3 storage buckets with path-based isolation for every user.
- **🔗 Smart Sharing**: Generate time-limited AWS Signature V4 pre-signed URLs (custom expiration).
- **🛰️ Real-time Metadata**: Instant synchronization of file attributes (name, size, type) via AppSync GraphQL and DynamoDB.
- **🔍 Intelligent Library**: Full-text search, multi-column sorting, and status filtering (Public vs. Private).
- **📊 Activity Analytics**: Auditable logs for tracking uploads, deletions, and link generation events.
- **🛡️ Public/Private Toggle**: Instantly change file accessibility with backend-enforced permissions.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Lucide Icons, Date-fns, Hot Toast |
| **Authentication** | Amazon Cognito (User Pools & Identity Pools) |
| **API** | AWS AppSync (GraphQL) with @auth directives |
| **Storage** | Amazon S3 (Server-side encryption enabled) |
| **Database** | Amazon DynamoDB (NoSQL metadata store) |
| **CI/CD / Hosting** | AWS Amplify Hosting (Continuous Deployment via GitHub) |

---

## 🏗️ System Architecture

SecureVault follows a fully **Serverless Architecture**, ensuring high availability and cost-efficiency:

1.  **Identity Layer**: Cognito handles JWT-based authentication and IAM role mapping.
2.  **Logic Layer**: AppSync acts as the GraphQL gateway, connecting frontend requests to DynamoDB.
3.  **Storage Layer**: React interacts directly with S3 using temporary AWS credentials granted by Cognito Identity Pools (via `uploadData` and `getUrl` APIs).
4.  **Security Layer**: S3 Bucket Policies and IAM Roles enforce the **Principle of Least Privilege**, isolating each user’s data to their specific `identity_id`.

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v18+)
- AWS Account and [Amplify CLI](https://docs.amplify.aws/cli/start/install/) configured

### 1. Clone & Install
```bash
git clone https://github.com/raovivek18/aws-auth-file-upload.git
cd amplify-auth-app
npm install
```

### 2. Environment Setup (Amplify Backend)
Initialize the Amplify project in your environment:
```bash
amplify init
```
Push the cloud resources (Auth, API, Storage) to your AWS account:
```bash
amplify push
```

---

## ⚙️ Environment Configuration

The application relies on the dynamically generated `src/aws-exports.js` file created by the Amplify CLI. 

> [!IMPORTANT]
> **Security Reminder**: `aws-exports.js` contains resource IDs and should **never** be committed to public version control. It is already included in the `.gitignore`.

For **Production Deployment**, enable "Full-stack CI/CD" in the Amplify Console to automatically provision backends during the build phase.

---

## 📖 Usage Guide

1.  **Dashboard**: Upon login, view your encrypted file library.
2.  **Upload**: Click "Upload New" to securely transfer files (Max 20MB, supported types: PDF, Images, Word, TXT).
3.  **Sharing**: Click the **Copy** icon on any file to generate a secure share link.
4.  **Privacy**: Use the **Shield/Globe** icon to toggle if a file should allow public metadata visibility.
5.  **Analytics**: Navigate to the "Activity" tab to audit recent operations on your vault.

---

## 🛡️ Security Features

- **Path-Based Isolation**: Each user is restricted to the `/private/${cognito-identity-id}/` prefix in S3.
- **IAM Role Security**: Temporary credentials last only as long as the session.
- **XSS/CSRF Protection**: React handles automatic sanitization; Cognito manages secure JWT storage.
- **Signed URLs**: Even if a share link is leaked, it expires automatically based on the chosen TTL (Time To Live).

---

## 🔮 Future Improvements

- [ ] **Folder Structure**: Nested directories for better organization.
- [ ] **Team Workspaces**: Shared folders with role-based access control (RBAC).
- [ ] **Virus Scanning**: Integrated AWS Lambda function to scan files via ClamAV on `PUT`.
- [ ] **Advanced Preview**: Integrated viewers for Microsoft Office documents and 3D files.
- [ ] **Global CDN**: CloudFront integration for ultra-fast global file delivery.