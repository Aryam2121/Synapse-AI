# 🚀 Setup Groq API (FREE)

## Why Groq?
- **100% FREE** - No credit card required
- **Super FAST** - Fastest inference speed
- **Great Models** - Llama 3.1, Mixtral, Gemma, and more
- **Easy Setup** - Just one API key

## 📋 Steps to Get Groq API Key

### 1. Create Groq Account
Go to: **https://console.groq.com/**

Click "Sign Up" (free, no credit card needed)

### 2. Get API Key
1. After login, go to **API Keys** section
2. Click "Create API Key"
3. Copy your API key (starts with `gsk_...`)

### 3. Add to Your Project

**For Local Development:**
```env
# In backend/.env
GROQ_API_KEY=gsk_your_api_key_here
GROQ_MODEL=llama-3.1-70b-versatile
USE_OLLAMA=false
```

**For Render Deployment:**
1. Go to your Render dashboard
2. Select your web service
3. Go to "Environment" tab
4. Add:
   - Key: `GROQ_API_KEY`
   - Value: `gsk_your_api_key_here`

### 4. Available Models

Groq supports these FREE models:

| Model | Description | Best For |
|-------|-------------|----------|
| `llama-3.1-70b-versatile` | Meta's Llama 3.1 70B | General tasks (recommended) |
| `llama-3.1-8b-instant` | Llama 3.1 8B | Ultra-fast responses |
| `mixtral-8x7b-32768` | Mistral's Mixtral | Long context (32k tokens) |
| `gemma2-9b-it` | Google's Gemma 2 | Instruction following |

### 5. Test It

Restart your backend:
```bash
cd backend
python app.py
```

You should see:
```
✓ Using FREE Groq Cloud model: llama-3.1-70b-versatile
```

## 🎯 Benefits for Your Users

✅ **No Installation** - Users just visit your website  
✅ **No API Key** - Users don't need their own keys  
✅ **No Waiting** - Groq is extremely fast  
✅ **Always Available** - Works 24/7 on Render  
✅ **Completely FREE** - For you and your users  

## 📊 Groq Limits (Free Tier)

- **Requests**: 30 requests/minute
- **Tokens**: 14,400 tokens/minute
- **Daily**: No daily limit!

This is MORE than enough for most applications!

## 🔄 Fallback Options

Your app is configured with this priority:
1. **Groq** (if `GROQ_API_KEY` is set) - Best for production
2. **OpenAI** (if `OPENAI_API_KEY` is set) - Paid alternative
3. **Ollama** (if `USE_OLLAMA=true`) - Local development only

## 🚀 Ready to Deploy!

Once you have your Groq API key:
1. Add it to Render environment variables
2. Deploy your backend
3. Users can use your app instantly - NO setup required!

## 📚 Resources

- Groq Console: https://console.groq.com/
- Groq Docs: https://console.groq.com/docs
- Models: https://console.groq.com/docs/models

---

**Need help?** Check the error logs in Render dashboard or test locally first!
