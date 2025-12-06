# Getting Started with Synapse AI

This guide will help you set up and run Synapse AI on your local machine.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [First Steps](#first-steps)
6. [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Linux
- **Node.js**: 18.0 or higher
- **Python**: 3.11 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space

### Recommended
- **RAM**: 16GB for better performance
- **GPU**: Not required but helps with local models
- **Internet**: Stable connection for API calls

## Installation

### Step 1: Install Node.js

Download and install Node.js from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version  # Should show v18.0.0 or higher
npm --version
```

### Step 2: Install Python

Download and install Python from [python.org](https://www.python.org/)

Verify installation:
```bash
python --version  # Should show 3.11 or higher
pip --version
```

### Step 3: Clone the Repository

```bash
git clone https://github.com/yourusername/universal-ai-workspace.git
cd universal-ai-workspace
```

### Step 4: Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cd ..
```

## Configuration

### Step 1: Create Environment File

```bash
copy .env.example .env
```

### Step 2: Get API Keys

#### OpenAI API Key (Required)
1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new key
5. Copy the key

#### Anthropic API Key (Optional)
1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Get your API key

#### Pinecone (Optional - for cloud vector DB)
1. Go to [pinecone.io](https://www.pinecone.io/)
2. Sign up for free
3. Get your API key and environment

### Step 3: Configure .env File

Open `.env` and add your keys:

```env
# Required
OPENAI_API_KEY=sk-...your-key-here

# Optional
ANTHROPIC_API_KEY=sk-ant-...your-key-here
PINECONE_API_KEY=your-pinecone-key
PINECONE_ENVIRONMENT=your-environment

# Vector DB (chroma is default and works locally)
VECTOR_DB=chroma

# Database (SQLite by default, works out of the box)
DATABASE_URL=sqlite+aiosqlite:///./universal_ai.db
```

## Running the Application

### Option 1: Run Both Services

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000
```

### Option 2: Using Scripts

**Windows:**
```bash
# Create run.bat file
@echo off
start cmd /k "cd backend && python app.py"
start cmd /k "npm run dev"
```

**macOS/Linux:**
```bash
# Create run.sh file
#!/bin/bash
cd backend && python app.py &
npm run dev
```

## First Steps

### 1. Access the Application

Open your browser and go to: `http://localhost:3000`

### 2. Explore the Dashboard

You'll see:
- **Chat Interface** - Start chatting with AI
- **Documents** - Upload your files
- **Tasks** - Manage your todos
- **Code Analysis** - Analyze code
- **Analytics** - View your stats

### 3. Upload Your First Document

1. Click on "Documents" in the sidebar
2. Drag & drop a PDF, DOCX, or text file
3. Wait for processing (usually 10-30 seconds)
4. Go to Chat and ask questions about your document!

### 4. Try Code Analysis

1. Click on "Code Analysis"
2. Paste some code or upload a file
3. Click "Analyze"
4. Get instant insights, bug reports, and suggestions

### 5. Create a Task

1. Go to "Tasks"
2. Click "New Task"
3. Fill in details
4. AI can help break down complex tasks!

## Troubleshooting

### Backend Won't Start

**Error: "ModuleNotFoundError"**
```bash
cd backend
pip install -r requirements.txt --upgrade
```

**Error: "Port 8000 already in use"**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

### Frontend Won't Start

**Error: "Port 3000 already in use"**
```bash
# Change port in package.json
"dev": "next dev -p 3001"
```

**Error: "Cannot find module"**
```bash
rm -rf node_modules package-lock.json
npm install
```

### OpenAI API Errors

**Error: "Invalid API key"**
- Check your .env file
- Ensure no spaces around the API key
- Verify the key is valid at platform.openai.com

**Error: "Rate limit exceeded"**
- You've hit your API quota
- Wait a few minutes
- Upgrade your OpenAI plan

### Vector Database Issues

**Chroma errors:**
```bash
# Delete and recreate
rm -rf backend/chroma_db
# Restart backend
```

**Pinecone connection errors:**
- Verify API key and environment
- Check internet connection
- Ensure index exists

### General Issues

**Application is slow:**
- Check your internet connection
- Reduce number of documents
- Use local models (coming in v1.1)

**Chat not responding:**
- Check backend is running (Terminal 1)
- Verify API key is valid
- Check browser console for errors (F12)

## Need More Help?

- **Documentation**: Full docs at `/docs` when running
- **GitHub Issues**: Report bugs on GitHub
- **Community**: Join our Discord server
- **Email**: support@example.com

## Next Steps

Now that you're set up:

1. **Explore Features**: Try all dashboard sections
2. **Upload Documents**: Build your knowledge base
3. **Customize**: Adjust settings to your preferences
4. **Integrate**: Connect with your workflow

Happy building! 🚀
