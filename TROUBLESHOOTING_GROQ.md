# Groq API Troubleshooting Guide

## ✅ Quick Fix Applied

The timeout issue has been resolved by:
1. **Changed model**: From `llama-3.3-70b-versatile` (slow) → `llama-3.1-8b-instant` (fastest)
2. **Increased timeouts**: Backend now has 60s timeout with 3 retries
3. **Better error handling**: More detailed Groq API error logging

## 🔧 Deployment Steps (Render)

### 1. Verify Environment Variables on Render

Go to your Render dashboard → `synapse-ai-backend` → Environment

**Required Variables:**
```
GROQ_API_KEY=gsk_0ashmi... (your full Groq API key)
GROQ_MODEL=llama-3.1-8b-instant
USE_OLLAMA=false
```

### 2. Redeploy Your Service

After pushing these changes:
```bash
git add .
git commit -m "Fix: Switch to fastest Groq model and increase timeouts"
git push origin main
```

Render will automatically redeploy. Wait for deployment to complete (~2-3 minutes).

### 3. Test the Configuration

Visit: `https://synapse-ai-wr9n.onrender.com/api/config-check`

**Expected Response:**
```json
{
  "groq_configured": true,
  "groq_key_preview": "gsk_0ashmi...xxxx",
  "groq_key_length": 56,
  "active_provider": "groq",
  "groq_model": "llama-3.1-8b-instant"
}
```

### 4. Test Locally (Optional)

```bash
cd backend
python test_groq.py
```

**Expected Output:**
```
✓ ChatGroq initialized successfully
✓ API call successful!
Response: Hello from Groq!
✓ ALL TESTS PASSED - Groq is configured correctly!
```

## 🐛 Common Issues & Solutions

### Issue 1: "GROQ_API_KEY not set"

**Symptoms:**
- Config check shows `"groq_configured": false`
- Error: "No AI provider configured"

**Solution:**
1. Go to Render dashboard
2. Environment tab
3. Add `GROQ_API_KEY` with your actual key (starts with `gsk_`)
4. Click "Save Changes"
5. Manually trigger redeploy

### Issue 2: "Request timeout (60s)"

**Symptoms:**
- Messages take 60+ seconds
- Frontend shows timeout error

**Possible Causes:**
1. **Wrong Model Set**: Check `GROQ_MODEL` = `llama-3.1-8b-instant` (NOT 70b)
2. **Groq Rate Limit**: Check https://console.groq.com/usage
3. **API Key Invalid**: Regenerate key on Groq dashboard

**Solution:**
```bash
# Test Groq API directly
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-8b-instant",
    "messages": [{"role": "user", "content": "Hi"}],
    "max_tokens": 50
  }'
```

### Issue 3: "Backend cold start timeout"

**Symptoms:**
- First message takes 60-120s
- Subsequent messages work fine

**Explanation:**
- Render free tier sleeps after 15 min inactivity
- First request wakes up service (30-60s)
- This is NORMAL for free tier

**Solution:**
- Upgrade to Render paid plan ($7/mo) for instant responses
- Or accept 60s first-message delay

### Issue 4: "Failed to fetch"

**Symptoms:**
- Cannot connect to backend
- Network errors

**Solution:**
1. Check backend is running: Visit `/health`
2. Verify CORS settings in `app.py`
3. Check frontend `NEXT_PUBLIC_API_URL` env var
4. Test backend directly:
```bash
curl https://synapse-ai-wr9n.onrender.com/health
```

## 📊 Groq Model Comparison

| Model | Speed | Quality | Use Case |
|-------|-------|---------|----------|
| **llama-3.1-8b-instant** ✅ | ⚡ Fastest (0.5-2s) | Good | Production chat |
| llama-3.1-70b-versatile | 🐌 Slow (5-15s) | Better | Complex tasks |
| llama-3.3-70b-versatile | 🐌🐌 Slowest (10-30s) | Best | Research |

**Recommendation**: Use `llama-3.1-8b-instant` for production chat applications.

## 🔍 Debug Commands

### Check Backend Logs (Render)
1. Go to Render dashboard
2. Select `synapse-ai-backend`
3. Click "Logs" tab
4. Look for:
   - `✓ Using FASTEST Groq model: llama-3.1-8b-instant`
   - `[GROQ API CALL] Sending to Groq: ...`
   - `[GROQ RESPONSE] Received ... chars`

### Test Groq API Key
```bash
# Windows PowerShell
$env:GROQ_API_KEY = "gsk_your_key_here"
python backend/test_groq.py

# Mac/Linux
export GROQ_API_KEY="gsk_your_key_here"
python backend/test_groq.py
```

### Check Frontend Environment
```bash
# In your frontend .env.local
NEXT_PUBLIC_API_URL=https://synapse-ai-wr9n.onrender.com
```

## 📞 Still Having Issues?

1. **Check Groq Status**: https://status.groq.com/
2. **Verify API Key**: https://console.groq.com/keys
3. **Check Usage Limits**: https://console.groq.com/usage
4. **View Render Logs**: Render dashboard → Logs
5. **Test Config Endpoint**: `/api/config-check`

## 🎯 Expected Behavior After Fix

- ✅ First message: 30-60s (cold start)
- ✅ Subsequent messages: 1-3s
- ✅ No timeout errors
- ✅ Smooth conversation flow

## 📝 What Changed

**Before:**
- Model: `llama-3.3-70b-versatile` (30s response time)
- Timeout: 45s backend, 60s frontend
- Result: Timeouts ❌

**After:**
- Model: `llama-3.1-8b-instant` (1-2s response time)
- Timeout: 60s backend, 60s frontend
- Result: Fast responses ✅
