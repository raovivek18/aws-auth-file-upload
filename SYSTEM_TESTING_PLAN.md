# Secure File Sharing Platform: Full System Testing Plan

This document outlines the strategy and checklist for performing full system testing on the React-based Secure File Sharing platform powered by AWS Amplify.

## 1. Core Feature Testing Checklist

### 🔑 Authentication & Authorization (Cognito)
- [ ] **User Signup**: Create a new account with a valid email. Verify the verification code is received and correctly processed.
- [ ] **Login**: Authenticate with valid credentials. Verify redirection to the Protected Dashboard.
- [ ] **Logout**: Trigger the sign-out process. Verify that the session is cleared and the user is redirected to the login screen.
- [ ] **Session Persistence**: Refresh the browser while logged in. Verify the user remains authenticated.
- [ ] **Unauthorized Access**: Attempt to navigate to `/dashboard` directly without logging in. Verify redirection to the login page.

### 📁 File Management (S3 & DynamoDB)
- [ ] **Basic Upload**: Upload a supported file (e.g., Image/PDF) under 20MB. Verify the progress bar updates and a success toast appears.
- [ ] **File Listing**: Verify the uploaded file appears in the dashboard with correct metadata (Name, Size, Date).
- [ ] **Pagination**: Upload 11+ files (if limit is 10) and verify the "Load more items" button appears and functions correctly.
- [ ] **Search & Sort**: Filter files by name. Sort files by size or upload date.
- [ ] **Deletion**: Delete a file. Verify it disappears from the UI and that the metadata is removed from DynamoDB.

### 🔗 Sharing & Privacy logic
- [ ] **Private/Public Toggle**: Toggle a file to 'PUBLIC'. Verify the badge changes. Toggle back to 'PRIVATE'.
- [ ] **Share Link Generation**: Generate a share link with a specific expiration (e.g., 1 hour).
- [ ] **Link Accessibility**: Copy the generated link and open it in an Incognito window. Verify access is granted.
- [ ] **Link Expiration**: (Simulated) Verify that a link older than its `expiresIn` value returns an "Access Denied" or "Expired" error from S3.

---

## 2. Edge Cases & Boundary Testing

### 🏗️ Robustness & Limits
- [ ] **Large File Uploads**: Upload a file exactly at 19.9MB to test proximity to the 20MB limit.
- [ ] **Oversized Files**: Attempt to upload a 21MB+ file. Verify the application prevents the upload and displays a clear "Size Exceeded" error.
- [ ] **Unsupported File Types**: Attempt to upload a `.exe` or `.zip` file. Verify the front-end validation blocks it.
- [ ] **Duplicate Filenames**: Upload a file with the same name as an existing one. Verify the system prompts the user or appends a timestamp (currently implemented to block duplicates).

### 🌐 Network & Reliability
- [ ] **Network Interruption**: Disconnect Wi-Fi during a file upload. Verify that the retry logic (3 attempts) kicks in.
- [ ] **Interrupted Deletion**: Refresh the page while a deletion is in progress. Verify that either the operation completed or the UI reflects the current state in S3/DynamoDB.

### 🛡️ Security Boundaries
- [ ] **Owner-Only Deletion**: Attempt to delete a file metadata entry via JS console using a direct AppSync call for a file ID you don't own. (Verify IAM/AppSync `@auth` blocks this).
- [ ] **Private Data Leakage**: Attempt to access a 'PRIVATE' file key directly via its S3 URL without a signature. Verify S3 returns `403 Forbidden`.

---

## 3. Debugging Strategies for AWS Amplify

If a feature fails during testing, use these targeted strategies to identify the cause:

| Service | Debugging Tool / Strategy |
| :--- | :--- |
| **Front-End** | Check **Browser DevTools > Console** for `SecureFileStore` logger output. |
| **Storage (S3)** | Observe **DevTools > Network** for `PUT` requests to S3. Status `403` usually means IAM/Bucket policy issues. |
| **API (AppSync)** | Use the **AppSync Console > Queries** tab to run GraphQL mutations directly. Check **CloudWatch Logs** for resolver errors. |
| **Auth (Cognito)** | Check the **AWS Cognito Console > Users** to verify user status (CONFIRMED vs UNCONFIRMED). |
| **Sync Logic** | Verify `amplify-meta.json` in your local project matches the cloud state using `amplify status`. |

---

## 4. Permission & Security Verification

To ensure your platform is truly secure, verify these AWS configurations:

### 🛡️ S3 Access Policies
1. **Private Prefix**: Open the S3 Bucket in AWS Console. Ensure user files are located under `private/[USER_IDENTITY_ID]/`.
2. **Access Levels**:
   - Files in `private/` must **not** be accessible via public URL.
   - Verify the Bucket Policy does **not** have `Allow *` for "Anyone".
3. **CORS Configuration**: Ensure the S3 CORS policy only allows your specific domain (or `localhost` for dev).

### 🔑 IAM Role Verification
1. **AuthRole**: Check the IAM Role assigned to authenticated users (look in `amplify-meta.json` for `AuthRoleName`). It should have `s3:PutObject` and `s3:GetObject` only for the `private/` path.
2. **UnauthRole**: Verify that the Unauthenticated role has **zero** access to the S3 bucket prefixes.

### 🧬 Data Layer Security (AppSync)
1. **Owner-Based Auth**: Inspect your `schema.graphql`. Ensure the `FileMeta` type uses `@auth(rules: [{ allow: owner }])`.
2. **Public Read**: If you allow public viewing of some metadata, verify the `API_KEY` is restricted to only the `SharingStatus` field or specific `get` operations.

---

### ✅ Summary of Readiness
Once all items in Section 1 and Section 2 are green, and the Section 4 audits are complete, the platform is considered **Production Ready**.
