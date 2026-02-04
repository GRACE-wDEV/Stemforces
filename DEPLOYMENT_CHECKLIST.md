# 🚀 DEPLOYMENT CHECKLIST — Complete Step-by-Step Guide

Follow these steps in order to deploy your app using **100% FREE tiers (NO PAYMENT METHOD REQUIRED)**.

---

## ✅ STEP 1: Setup MongoDB Atlas (Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up / log in
3. Click **"Build a Database"** → Choose **FREE (M0)** tier
4. Select a cloud provider and region (AWS, us-east-1 recommended)
5. Create a cluster name (e.g., `Cluster0`)
6. Create a **Database User**:
   - Username: `stemforces`
   - Password: (generate a strong one, save it)
7. **Network Access** → Add IP Address → **Allow access from anywhere** (0.0.0.0/0) for now
8. Go to **Database** → Click **Connect** → Choose **"Connect your application"**
9. Copy the connection string (looks like):
   ```
   mongodb+srv://stemforces:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
10. Replace `<password>` with your actual password and add `/stemforces` before the `?`:
    ```
    mongodb+srv://stemforces:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/stemforces?retryWrites=true&w=majority
    ```

**Save this connection string — you'll need it for Step 3.**

---

## ✅ STEP 2: Deploy Backend to Render (NO PAYMENT METHOD REQUIRED)

### 2.1 Sign Up for Render

1. Go to https://render.com
2. Sign up with GitHub (recommended) or email
3. **NO CREDIT CARD REQUIRED** for free tier ✅

### 2.2 Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository (if not already connected)
3. Select the `stemforces` repository
4. Configure:
   - **Name:** `stemforces-backend` (or any name)
   - **Region:** Oregon (US West) or closest to you
   - **Branch:** `main` (or your default branch)
   - **Runtime:** Docker
   - **Dockerfile Path:** `Dockerfile.backend`
   - **Plan:** **FREE** ✅

### 2.3 Add Environment Variables

Before clicking "Create Web Service", scroll down to **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `MONGO_URI` | `mongodb+srv://stemforces:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/stemforces?retryWrites=true&w=majority` |
| `JWT_SECRET` | `random-super-secret-key-min-32-chars-change-this` |
| `GEMINI_API_KEY` | `your-gemini-key-if-you-have-one` (optional) |
| `PORT` | `5000` |
| `NODE_ENV` | `production` |

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Render will build your Docker image and deploy (takes 5-10 mins first time)
3. Wait for status to show **"Live"** with green checkmark

**Your backend URL will be:**
```
https://stemforces-backend.onrender.com
```

**⚠️ IMPORTANT:** Free tier spins down after 15 mins of inactivity. First request after idle takes ~30-60 seconds to wake up.

### 2.5 Verify Backend

Visit:
```
https://stemforces-backend.onrender.com/api
```
You should see a response (not an error page).

---

## ✅ STEP 3: Deploy Frontend to Vercel

### 3.1 Connect to Vercel

1. Go to https://vercel.com
2. Sign up / log in (use GitHub recommended)
3. Click **"Add New Project"**
4. Import your Git repository (connect GitHub if not already)
5. Select the `stemforces` repository

### 3.2 Configure Build Settings

When configuring the project:
- **Framework Preset:** Vite
- **Root Directory:** `frontend` ← **IMPORTANT: click "Edit" and set this**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3.3 Add Environment Variable

In the Vercel project settings (or during setup):
- Click **"Environment Variables"**
- Add:
  - **Key:** `VITE_API_BASE`
  - **Value:** `https://stemforces-backend.onrender.com/api` (replace with your Render backend URL from Step 2)
  - **Select:** Production, Preview, Development

### 3.4 Deploy

Click **"Deploy"** — Vercel will build and deploy your frontend.

After deployment, Vercel will give you a URL:
```
https://stemforces-yourname.vercel.app
```

---

## ✅ STEP 4: Test Your Deployed App

1. Visit your Vercel URL: `https://stemforces-yourname.vercel.app`
2. Try signing up / logging in
3. Check the browser console for any API errors
4. If something doesn't work:
   - Verify `VITE_API_BASE` is set correctly in Vercel
   - Check backend logs: Go to Render Dashboard → Your Service → Logs tab
   - Verify MongoDB connection string is correct
   - Wait 60 seconds if backend was idle (free tier spins down)

---

## 🔧 OPTIONAL: Custom Domain

### For Frontend (Vercel):
1. Go to Vercel project → Settings → Domains
2. Add your custom domain and follow DNS instructions

### For Backend (Render):
1. Go to Render Dashboard → Your Service → Settings
2. Add custom domain (requires paid plan for custom domains, but app still works on .onrender.com free)

---

## 📝 Common Issues & Fixes

### Backend won't start on Render:
- Go to Render Dashboard → Your Service → Logs tab
- Common issues:
  - Missing `JWT_SECRET`: Add in Environment Variables tab
  - Wrong `MONGO_URI`: Verify connection string format
  - Build failure: Check Dockerfile.backend path is correct

### Backend is slow to respond:
- **This is normal on free tier** — spins down after 15 mins idle
- First request after idle takes 30-60 seconds to wake up
- Subsequent requests are fast
- Upgrade to paid plan ($7/mo) for always-on

### Frontend can't reach backend:
- Check `VITE_API_BASE` in Vercel settings
- Verify backend is running: visit `https://stemforces-backend.onrender.com/api`
- Check browser console for CORS errors
- Wait 60 seconds if you see timeout (backend waking up)

### Build fails on Vercel:
- Ensure Root Directory is set to `frontend`
- Check that `npm run build` works locally (already tested ✓)

---

## 🎉 You're Done!

Your app is now live:
- **Frontend:** https://stemforces-yourname.vercel.app
- **Backend:** https://stemforces-backend.onrender.com
- **Database:** MongoDB Atlas

**⚠️ Remember:** Backend on free tier spins down after 15 mins idle. First request takes ~60 seconds to wake up.

**Next steps:**
- Monitor Render usage (750 hours/month free)
- Upgrade Render to $7/mo for always-on backend (optional)
- Set up GitHub Actions for auto-deployment (optional)
- Add custom domains (optional)

---

## 💰 Cost Breakdown

- **Frontend (Vercel):** 100% FREE forever (unlimited bandwidth for hobby)
- **Backend (Render):** 100% FREE forever
  - 750 hours/month free (enough for one service running 24/7)
  - Spins down after 15 mins idle
  - Limited to 512MB RAM
- **Database (MongoDB Atlas):** 100% FREE forever (512MB storage)

**Total monthly cost: $0** ✅ **NO PAYMENT METHOD REQUIRED** ✅

---

## 🚀 Alternative: Keep Backend Always On ($7/mo)

If you want zero cold starts:
1. Upgrade Render service to "Starter" plan ($7/mo)
2. Backend stays awake 24/7
3. Still way cheaper than most hosting

---

Need help? Share error messages from:
- Render Dashboard → Logs tab (backend issues)
- Vercel deployment logs (frontend build issues)
- Browser console (runtime errors)
