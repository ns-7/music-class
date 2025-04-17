# Music Genre Classifier - Netlify Deployment Guide

This document provides step-by-step instructions for deploying the Music Genre Classifier application to Netlify.

## Prerequisites

- A GitHub account
- A Netlify account (free tier is sufficient)
- Basic familiarity with web deployment concepts

## Deployment Steps

### 1. Prepare Your Repository

1. Create a new GitHub repository:
   - Go to [GitHub](https://github.com) and sign in
   - Click the "+" icon in the top-right corner and select "New repository"
   - Name your repository (e.g., "music-genre-classifier")
   - Choose "Public" or "Private" visibility
   - Click "Create repository"

2. Upload the code:
   - Extract the provided ZIP file to your local computer
   - Open a terminal or command prompt
   - Navigate to the extracted folder
   - Initialize a Git repository and push to GitHub:

```bash
# Navigate to the extracted folder
cd path/to/extracted/folder

# Initialize Git repository
git init

# Add all files
git add .

# Commit the files
git commit -m "Initial commit of Music Genre Classifier"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/music-genre-classifier.git

# Push to GitHub
git push -u origin main
```

### 2. Deploy to Netlify

1. Connect Netlify to GitHub:
   - Go to [Netlify](https://netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"
   - Select "GitHub" as your Git provider
   - Authorize Netlify to access your GitHub account if prompted
   - Select the repository you just created

2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `out`
   - Click "Show advanced" to expand additional options
   - Click "Deploy site"

3. Wait for the initial deployment to complete (this may take a few minutes)

### 3. Configure Netlify Functions

1. Go to "Site settings" → "Functions"
2. Verify that the functions directory is set to "netlify/functions"
3. Increase the function timeout:
   - Go to "Site settings" → "Functions" → "Serverless functions"
   - Set "Function timeout" to 30 seconds (as audio processing can take time)

### 4. Set Environment Variables (Optional)

If you want to customize the application, you can set environment variables:

1. Go to "Site settings" → "Build & deploy" → "Environment"
2. Click "Edit variables"
3. Add any custom environment variables you need
4. Click "Save"

### 5. Test Your Deployed Site

1. Visit your Netlify site URL (e.g., random-name.netlify.app)
2. Upload an audio file to test the genre classification
3. Verify that the rating system works
4. Test on both desktop and mobile devices

### 6. Set Up a Custom Domain (Optional)

1. Go to "Site settings" → "Domain management"
2. Click "Add custom domain"
3. Follow the instructions to configure your domain

### 7. Integrate with eidcoin.online

To embed the Music Genre Classifier in your eidcoin.online website:

1. Copy this iframe code:
```html
<div style="width: 100%; max-width: 800px; margin: 0 auto;">
    <iframe src="https://YOUR-NETLIFY-URL.netlify.app" 
            width="100%" 
            height="800px" 
            frameborder="0"
            style="border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    </iframe>
</div>
```
2. Replace "YOUR-NETLIFY-URL" with your actual Netlify domain
3. Add this code to your eidcoin.online website where you want the classifier to appear

## Troubleshooting

### Build Failures

If your build fails, check the build logs for specific errors:

1. Go to the "Deploys" tab
2. Click on the failed deployment
3. Look for error messages in the build log

Common issues and solutions:

- **Node.js version issues**: The netlify.toml file is already configured with Node.js version 16, which should work with this application.
- **Python dependencies**: The netlify.toml file includes Python configuration for the serverless functions.
- **Build command issues**: Make sure the build command is set to `npm run build`.

### Function Errors

If the audio analysis function isn't working:

1. Check the function logs in Netlify (Site settings → Functions → Function logs)
2. Verify that the Python dependencies are correctly installed
3. Ensure the function timeout is set to at least 30 seconds

## Support

If you encounter any issues with deployment, please refer to the [Netlify documentation](https://docs.netlify.com/) or contact your developer for assistance.
