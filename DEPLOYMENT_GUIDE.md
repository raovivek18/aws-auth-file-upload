# 🚀 Deployment Guide: AWS Amplify Hosting

This guide explains how to deploy your **Secure File Sharing** application using AWS Amplify Hosting (Managed Service).

---

## 1. Connecting GitHub to AWS Amplify

### Step-by-Step Connection
1.  **Log in to AWS Console**: Navigate to the **AWS Amplify** service.
2.  **Create New App**: Click **"New App"** > **"Host web app"**.
3.  **Select Source**: Choose **GitHub** and authorize AWS to access your repositories.
4.  **Choose Repository**: Select `raovivek18/aws-auth-file-upload` and the `main` branch.
5.  **Build Settings**: Amplify will automatically detect your project as a React app. Ensure the build command is `npm run build` and the output directory is `build`.

---

## 2. Configuring CI/CD (Automatic Builds)

Amplify Hosting provides a built-in CI/CD pipeline. Every time you `git push` to your connected branch, Amplify will:
1.  **Provision**: Spin up a build container.
2.  **Build**: Install dependencies (`npm install`) and compile the React app (`npm run build`).
3.  **Deploy**: Host the latest build on a secure CDN.
4.  **Verify**: Perform a headless browser test (optional) to ensure the site loads.

> [!TIP]
> You can view the status of each build in the **Amplify Console > All Apps > [Your App Name]**.

---

## 3. Environment Configuration for Production

Since this app uses **Amplify Gen 1**, your frontend needs the `aws-exports.js` (or `amplifyconfiguration.json`) file to communicate with AWS resources.

### Option A: Manual Setup (Easiest)
1. Run `amplify push` locally to ensure your cloud resources are created.
2. Amplify Hosting will automatically detect the backend if you have initialized it in your project.

### Option B: CI/CD with Backend (Professional)
1.  In the Amplify Console, go to **App settings > Build settings**.
2.  Ensure use of the `amplify-cli` is enabled in the build spec.
3.  The build spec (`amplify.yml`) should look like this:
    ```yaml
    frontend:
      phases:
        preBuild:
          commands:
            - npm install
        build:
          commands:
            - npm run build
      artifacts:
        baseDirectory: build
        files:
          - '**/*'
    ```

---

## 4. Verifying Cognito & S3 After Deployment

After the deployment completes, perform these checks:

1.  **URL Verification**: Open the generated `amplifyapp.com` URL.
2.  **Authentication**:
    - Try to sign up and verify your email.
    - If the login fails with "User Pool not found", ensure `aws-exports.js` was correctly generated during the build or manually added to the environment variables if using a custom build script.
3.  **S3 Access (Storage)**:
    - Attempt a file upload.
    - Check the **Network Tab** (F12 > Network). You should see requests to your S3 bucket endpoint.
    - If you get a `403 Forbidden` error, ensure **CORS** in the S3 console allows your `amplifyapp.com` domain.

---

## 5. Environment Management Best Practices

To avoid breaking production while developing new features, follow these practices:

### 🛠️ Use Multiple Environments
*   **Production**: Connected to the `main` branch.
*   **Development**: Connected to a `dev` branch.
*   Run `amplify env add dev` locally to create a separate sandbox for testing backend changes.

### 🛡️ Secure Your Data
*   **NEVER** commit `aws-exports.js` to GitHub. It is in your `.gitignore` for a reason.
*   Use **Amplify Console > App settings > Environment variables** to store sensitive keys (like API keys) if you reference them via `process.env`.

### 🔄 Deployment Strategy
1.  Code changes on `dev` branch.
2.  Test in your `dev` Amplify environment.
3.  Merge `dev` to `main`.
4.  Amplify automatically deploys to the production URL.

---

### ✅ Deployment Checklist
- [ ] GitHub Connected
- [ ] Build Settings Configured
- [ ] Environment Variables set (if any)
- [ ] Successful Build in Amplify Console
- [ ] Functional test on the live URL
