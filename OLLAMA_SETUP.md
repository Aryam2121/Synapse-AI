# 🆓 FREE AI Setup with Ollama

**No API keys, No credit card, 100% FREE!**

## What is Ollama?

Ollama lets you run powerful AI models **completely free** on your own computer. No cloud, no API keys, no limits!

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Ollama

**Windows:**
```bash
# Download and install from:
https://ollama.ai/download/windows
```

**Mac:**
```bash
# Download from: https://ollama.ai/download/mac
# Or use Homebrew:
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### Step 2: Download AI Models

```bash
# Best free model - highly recommended (4.7GB)
ollama pull llama3.1

# Alternative models:
ollama pull mistral        # 4.1GB - Fast and good
ollama pull codellama      # 3.8GB - Best for code
ollama pull phi3           # 2.3GB - Smaller, faster
ollama pull gemma2         # 5.4GB - Google's model
```

### Step 3: Verify Installation

```bash
# Check if Ollama is running
ollama list

# Test the model
ollama run llama3.1
>>> Hello! How are you?
```

Type `/bye` to exit the test chat.

### Step 4: Your .env is Already Configured!

```env
# Already set for FREE Ollama!
USE_OLLAMA=true
OLLAMA_MODEL=llama3.1
OLLAMA_BASE_URL=http://localhost:11434
```

## 🎯 That's It!

Your Synapse AI now runs **100% FREE** with Ollama!

Just start your backend and it will automatically use Ollama:

```bash
cd backend
python app.py
```

## 📊 Available FREE Models

| Model | Size | Best For | Speed |
|-------|------|----------|-------|
| **llama3.1** ✨ | 4.7GB | General AI tasks | Fast |
| **mistral** | 4.1GB | Balanced performance | Very Fast |
| **codellama** | 3.8GB | Code & programming | Fast |
| **phi3** | 2.3GB | Quick responses | Ultra Fast |
| **gemma2** | 5.4GB | Advanced reasoning | Medium |
| **qwen2** | 4.4GB | Multilingual | Fast |
| **deepseek-coder** | 3.8GB | Code generation | Fast |

## 🔄 Switch Models Anytime

```env
# In .env, change:
OLLAMA_MODEL=mistral    # Use Mistral
OLLAMA_MODEL=codellama  # Use CodeLlama
OLLAMA_MODEL=phi3       # Use Phi-3
```

Restart backend to apply changes.

## ⚙️ Advanced Configuration

### Run Ollama on Different Port
```bash
OLLAMA_HOST=0.0.0.0:11435 ollama serve
```

Update .env:
```env
OLLAMA_BASE_URL=http://localhost:11435
```

### Use GPU Acceleration (Faster!)
Ollama automatically uses your GPU if available (NVIDIA/AMD).

### CPU-Only Mode
Works perfectly fine without GPU, just a bit slower.

## 💡 Pro Tips

1. **First Response is Slow**: Model loads into memory first time
2. **Keep Ollama Running**: Responses are faster when model is loaded
3. **RAM Requirements**: 8GB minimum, 16GB recommended
4. **Disk Space**: Each model is 2-5GB

## 🆚 Ollama vs Paid APIs

| Feature | Ollama (FREE) | OpenAI | Claude |
|---------|--------------|--------|--------|
| **Cost** | $0 forever | ~$0.01/request | ~$0.01/request |
| **Speed** | Medium-Fast | Very Fast | Very Fast |
| **Privacy** | 100% Local | Cloud | Cloud |
| **Internet** | Not needed | Required | Required |
| **Quality** | Excellent | Excellent+ | Excellent+ |
| **Limits** | Unlimited | API quotas | API quotas |

## 🚨 Troubleshooting

### Ollama not found?
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags
```

### Model not responding?
```bash
# Restart Ollama service
# Windows: Restart Ollama from system tray
# Mac/Linux: 
killall ollama
ollama serve
```

### Out of memory?
Use smaller model:
```env
OLLAMA_MODEL=phi3  # Only 2.3GB
```

## 🎉 Benefits of Using Ollama

✅ **Completely FREE** - No credit card, no API keys
✅ **Unlimited Usage** - No rate limits or quotas  
✅ **100% Private** - Data never leaves your computer
✅ **Works Offline** - No internet required after setup
✅ **Fast Responses** - No network latency
✅ **Multiple Models** - Switch anytime
✅ **Open Source** - Community driven

## 📚 Learn More

- Ollama Website: https://ollama.ai
- Model Library: https://ollama.ai/library
- GitHub: https://github.com/ollama/ollama
- Discord Community: https://discord.gg/ollama

---

**You now have a FREE, powerful AI running locally!** 🎊
