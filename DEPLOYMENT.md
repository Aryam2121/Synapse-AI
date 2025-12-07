# Deployment Guide

## 🚀 Deploy Backend to Render

### Prerequisites
- GitHub account
- Render account (free tier available)
- OpenAI API key (since Render doesn't support Ollama)

### Steps:

1. **Push your code to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Deploy Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `Synapse-AI` repository
   - Configure:
     - **Name**: `synapse-ai-backend`
     - **Region**: Choose closest to you
     - **Branch**: `main`
     - **Root Directory**: `backend`
     - **Runtime**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
     - **Plan**: Free

4. **Add Environment Variables** (in Render dashboard)
   ```
   GROQ_API_KEY=gsk_your_groq_api_key_here
   GROQ_MODEL=llama-3.1-70b-versatile
   USE_OLLAMA=false
   SECRET_KEY=your-random-secret-key-here
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=10080
   DATABASE_URL=sqlite+aiosqlite:///./universal_ai.db
   PYTHON_VERSION=3.11.0
   FRONTEND_URL=https://your-app.vercel.app
   ```
   
   **Get FREE Groq API Key**: See `GROQ_SETUP.md` for instructions

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL (e.g., `https://synapse-ai-backend.onrender.com`)

### Important Notes:
- ✅ **FREE with Groq**: No API costs, completely free for you and users
- ⚠️ **Render Free Tier**: Service spins down after 15 minutes of inactivity (first request takes ~30s)
- ⚠️ **Ollama NOT supported on Render**: Use Groq (free) or OpenAI (paid) instead
- 💾 **SQLite Limitation**: Data may be lost on redeploy. Consider PostgreSQL for production
- 🚀 **Groq is FAST**: Much faster than OpenAI, perfect for real-time chat

---

## 🌐 Deploy Frontend to Vercel

### Prerequisites
- Vercel account (free tier available)
- Backend deployed and URL ready

### Steps:

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select `Synapse-AI`

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

4. **Add Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```
   
   Replace `your-backend-url.onrender.com` with your actual Render backend URL

5. **Deploy**
   - Click "Deploy"
   - Wait for build (2-5 minutes)
   - Your app will be live at `https://your-app.vercel.app`

### Update Backend CORS

After deployment, update your backend CORS settings:

1. Go to your local `backend/app.py`
2. Update CORS origins:
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=[
           "http://localhost:3000",
           "https://your-app.vercel.app"  # Add your Vercel URL
       ],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```
3. Push changes to GitHub
4. Render will auto-deploy

---

## 🔄 Auto-Deploy

Both services support automatic deployment:
- **Push to main branch** → Automatically deploys to both Render and Vercel

---

## 💡 Cost Considerations

### Free Tier Limits:
- **Render**: 
  - 750 hours/month
  - Spins down after 15 min inactivity
  - First request after spin-down takes ~30 seconds
  
- **Vercel**: 
  - 100 GB bandwidth/month
  - Unlimited requests
  - No cold starts

### Recommended for Production:
- **Backend**: Render Starter Plan ($7/month) - Always on
- **Database**: PostgreSQL (Render free tier or Railway)
- **AI**: OpenAI API (paid) or keep Ollama for local development

---

### Backend (Render)
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
GROQ_MODEL=llama-3.1-70b-versatile
USE_OLLAMA=false
SECRET_KEY=random-secret-key-at-least-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
DATABASE_URL=sqlite+aiosqlite:///./universal_ai.db
FRONTEND_URL=https://your-app.vercel.app
```ESS_TOKEN_EXPIRE_MINUTES=10080
DATABASE_URL=sqlite+aiosqlite:///./universal_ai.db
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://synapse-ai-backend.onrender.com
```

---

## 🐛 Troubleshooting

### Backend Issues:
- **503 Error**: Service is spinning up (wait 30 sec)
- **500 Error**: Check Render logs for details
- **CORS Error**: Update allowed origins in `app.py`

### Frontend Issues:
- **API Connection Failed**: Check `NEXT_PUBLIC_API_URL`
- **Build Failed**: Check Node.js version (should be 18+)
- **502 Bad Gateway**: Backend might be down

---

## ✅ Post-Deployment Checklist

- [ ] Backend URL is accessible
- [ ] Frontend can connect to backend
- [ ] User registration works
- [ ] User login works
- [ ] Chat functionality works
- [ ] Environment variables are set correctly
- [ ] CORS is configured properly

---

## 🔐 Security Reminders

1. Never commit API keys or secrets to GitHub
2. Use environment variables for all sensitive data
3. Generate a strong SECRET_KEY for production
4. Consider using a managed database for production
5. Enable HTTPS only in production

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
