# Git Push Guide for Ultimate Auth LMS

Follow these steps to push your project to GitHub.

---

## Prerequisites

1. **Install Git** (if not already installed)
2. **Create a GitHub account** at https://github.com
3. **Create a new repository** on GitHub (don't initialize with README, .gitignore, or License)

---

## Step-by-Step Commands

### Step 1: Navigate to Your Project Directory

Open your terminal/command prompt and navigate to the project folder:

```bash
cd "C:\Users\User\Desktop\projects\LMS prep\Ultimate auth"
```

### Step 2: Initialize Git Repository

```bash
git init
```

### Step 3: Add All Files to Staging

```bash
git add .
```

### Step 4: Commit the Changes

```bash
git commit -m "Initial commit: Ultimate Auth LMS project"
```

### Step 5: Add Remote Repository

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repository name:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Step 6: Push to GitHub

```bash
git push -u origin main
```

> **Note:** If your default branch is named `master` instead of `main`, use:
> ```bash
> git push -u origin master
> ```

---

## Complete Command List (Copy & Paste)

```bash
cd "C:\Users\User\Desktop\projects\LMS prep\Ultimate auth"
git init
git add .
git commit -m "Initial commit: Ultimate Auth LMS project"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

---

## Setting Up Environment Variables on GitHub (IMPORTANT!)

Since `.env` is excluded from Git (for security), you need to manually configure environment variables:

### Option 1: GitHub Secrets (For CI/CD)
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add each environment variable from your local `.env` file as a repository secret

### Option 2: Deployment Platform
If deploying to platforms like Render, Railway, Heroku, or Vercel:
1. Go to your deployment platform dashboard
2. Find **Environment Variables** or **Secrets** section
3. Add all variables from your `.env` file there

### Required Environment Variables

Make sure to set these on your deployment platform:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
MAILTRAP_TOKEN=your_mailtrap_token
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=your_frontend_url
```

---

## What Gets Pushed (And What Doesn't)

### Included in Git (Safe to Push):
- All source code (backend/, frontend/src/)
- Configuration files (vite.config.js, eslint.config.js)
- package.json files
- README.md and documentation
- Public assets

### Excluded from Git (Sensitive/Large Files):
- `node_modules/` folders (dependencies - install with `npm install`)
- `.env` file (contains secrets - set manually on server)
- `dist/` and `build/` folders (generated on build)
- Log files

---

## Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### Error: "failed to push some refs"
```bash
git pull origin main --rebase
git push origin main
```

### Error: "could not resolve host"
Check your internet connection and that the GitHub URL is correct.

---

## After First Push

For future updates, use these simple commands:

```bash
git add .
git commit -m "Your commit message here"
git push
```

---

## Need Help?

- Check GitHub Docs: https://docs.github.com
- Git Cheat Sheet: https://education.github.com/git-cheat-sheet-education.pdf
