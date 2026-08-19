# 🌐 Google Cloud Deployment Guide for SafetyNet

SafetyNet is fully containerized and configured for one-command deployment across Google Cloud Platform services.

---

## ⚡ Option 1: Google Cloud Run (Recommended — Fast, Free Tier, Zero Config)

Google Cloud Run automatically builds your container and gives you a free `https://safetynet-xxxx-uc.a.run.app` SSL URL.

### Method A: Direct from Browser with Google Cloud Shell (No local setup required!)
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the **Activate Cloud Shell** icon (`>_`) in the top navigation bar.
3. Upload your `safetynet` project folder or clone your repository:
   ```bash
   cd safetynet
   ```
4. Run the 1-command deployment:
   ```bash
   gcloud run deploy safetynet --source . --region us-central1 --allow-unauthenticated
   ```
5. When prompted to create an Artifact Registry repository, press `Y` (Enter).
6. Within ~60 seconds, Google Cloud will provide your live HTTPS URL!

---

## 🚀 Option 2: Firebase Hosting on Google Cloud (Instant One-Command from Terminal)

Firebase is Google Cloud's official developer frontend platform with free worldwide CDN.

```bash
# 1. Login to your Google account
npx firebase-tools login

# 2. Initialize (choose Hosting)
npx firebase-tools init hosting

# 3. Deploy
npm run deploy:firebase
```

---

## 📦 Option 3: Google App Engine

Deploy to Google App Engine standard environment using the pre-configured `app.yaml`:

```bash
npm run build
gcloud app deploy app.yaml
```

---

## 🗄️ Option 4: Google Cloud Storage (Static Website Bucket)

```bash
npm run build
gsutil mb gs://YOUR_BUCKET_NAME
gsutil web set -m index.html -e index.html gs://YOUR_BUCKET_NAME
gsutil -m rsync -r -d dist/ gs://YOUR_BUCKET_NAME
gsutil iam ch allUsers:objectViewer gs://YOUR_BUCKET_NAME
```

---

## 🛠️ Configuration Files Included in this Repository

| File | Purpose |
| :--- | :--- |
| `Dockerfile` | Multi-stage build (Node.js 22 $\rightarrow$ Nginx Alpine) optimized for Cloud Run. |
| `nginx.conf` | Handles SPA routing (`try_files`), Gzip compression, and dynamic `$PORT` injection. |
| `cloudbuild.yaml` | Google Cloud Build automated CI/CD pipeline. |
| `app.yaml` | Google App Engine standard static configuration. |
| `firebase.json` | Google Firebase Hosting configuration. |
| `deploy-gcp.sh` | Automated shell script to deploy to Cloud Run with 1 command. |