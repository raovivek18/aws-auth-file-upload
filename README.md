# 🦅 Secure Vault - Advanced File Sharing for SaaS

Secure Vault is a premium, high-security file management and sharing platform built on a serverless AWS stack. It provides industrial-grade encryption, time-limited sharing, and a sleek, investor-ready dashboard.

![Dashboard Preview](https://github.com/raovivek18/aws-auth-file-upload/raw/main/public/preview.png)

## ✨ Features

-   **🔒 End-to-End Privacy**: All files are stored in private S3 prefixes, isolated by Cognito Identity IDs.
-   **🔗 Time-Limited Sharing**: Generate AWS Signature V4 pre-signed URLs with custom expiration.
-   **📁 Metadata Tracking**: Detailed tracking of file types, sizes, and upload history via DynamoDB.
-   **🔍 Advanced Search & Sort**: Professional-grade library management with real-time filtering and sorting.
-   **👁️ Instant Preview**: Seamless PDF and Image previews directly within the browser.
-   **📊 Activity Logs**: Cryptographic-grade logging of all file operations and sharing events.

## 🛠️ Tech Stack

-   **Frontend**: React 19, Lucide Icons, Date-fns, Hot Toast
-   **Backend**: AWS Amplify, AppSync (GraphQL)
-   **Database**: Amazon DynamoDB
-   **Storage**: Amazon S3
-   **Auth**: Amazon Cognito (MFA Enabled, Strict Password Policies)

## 🚀 Getting Started

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/raovivek18/aws-auth-file-upload.git
    cd amplify-auth-app
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Amplify:
    ```bash
    amplify init
    amplify push
    ```

4.  Run the application:
    ```bash
    npm start
    ```

## 🛡️ Security Model

This application adheres to the **Principle of Least Privilege**:
-   **Cognito Identity Pools** generate temporary AWS credentials for users.
-   **IAM Policies** restrict users to their own `/private/{identity_id}/` S3 prefix.
-   **AppSync Resolver Security** ensures users can only read/write their own metadata.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
