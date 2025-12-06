# 🧠 Synapse AI

**Your Intelligent Workspace, Unified** - A revolutionary AI-powered neural platform combining RAG, LangChain, and multi-agent systems into a single, cognitive workspace.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.1-black.svg)
![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)

---

## ✨ What Makes This Special

This isn't just another AI chatbot. **Synapse AI** is a complete, production-ready AI neural network that:

- 🧠 **Personal Knowledge Brain** - RAG-powered system that learns from YOUR documents, code, and notes
- 🤖 **Multi-Agent System** - Specialized AI agents (Code, Document, Task, Research) working together
- 💻 **Code Intelligence** - Analyzes entire codebases, finds bugs, suggests improvements
- 📄 **Document Processing** - Summarizes PDFs, extracts insights, answers questions
- ✅ **Productivity Suite** - AI-powered task management and planning
- 🔍 **Universal Search** - Semantic search across all your content
- 🎨 **Modern UI** - Built with Next.js 14, shadcn/ui, and Tailwind CSS
- 🔒 **Private & Secure** - Local processing options, encrypted data

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.11+
- **100% FREE Option**: Ollama (Recommended!) - [Setup Guide](OLLAMA_SETUP.md)
- **OR** Paid: OpenAI/Anthropic API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/synapse-ai.git
cd synapse-ai

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# Create .env file
copy .env.example .env
# Add your API keys to .env file
```

### Configuration

Edit `.env` file:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend - AI Models (100% FREE with Ollama!)
USE_OLLAMA=true                    # FREE option
OLLAMA_MODEL=llama3.1              # FREE model
OLLAMA_BASE_URL=http://localhost:11434

# Optional: Paid APIs (leave empty for free Ollama)
OPENAI_API_KEY=                    # Optional
ANTHROPIC_API_KEY=                 # Optional

# Vector Database (choose one)
VECTOR_DB=chroma  # or "pinecone"
PINECONE_API_KEY=your_pinecone_key  # If using Pinecone
PINECONE_ENVIRONMENT=your_environment

# Database
DATABASE_URL=sqlite+aiosqlite:///./universal_ai.db

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379
```

### Run the Application

```bash
# Terminal 1: Start Backend
cd backend
python app.py

# Terminal 2: Start Frontend
npm run dev
```

Visit `http://localhost:3000` 🎉

---

## 📚 Features

### 🧠 RAG Knowledge Base

Upload your documents, and the AI learns from them:

- **Supported formats**: PDF, DOCX, TXT, MD, and more
- **Vector embeddings** with OpenAI or local models
- **Semantic search** across all content
- **Citation tracking** - know where answers come from

### 🤖 Multi-Agent System

Five specialized AI agents work together:

#### 1. **Code Agent** 💻
- Analyzes entire codebases
- Finds bugs and security issues
- Suggests refactoring improvements
- Generates documentation
- Explains complex code

#### 2. **Document Agent** 📄
- Summarizes long documents
- Extracts key information
- Answers questions from content
- Generates reports
- Compares multiple documents

#### 3. **Task Agent** ✅
- Breaks down complex goals
- Creates action plans
- Prioritizes tasks
- Schedules work
- Tracks progress

#### 4. **Research Agent** 🔍
- Gathers information
- Synthesizes from multiple sources
- Provides citations
- Explains complex topics
- Fact-checks information

#### 5. **General Agent** 💬
- Natural conversation
- General knowledge Q&A
- Workspace navigation help
- Routes to specialized agents

### 🎨 Modern Dashboard

Built with the latest technologies:

- **Next.js 14** with App Router
- **shadcn/ui** components
- **Tailwind CSS** styling
- **Framer Motion** animations
- **Real-time updates** via WebSocket
- **Dark/Light mode**
- **Responsive design**

### 📊 Analytics & Insights

Track your productivity:

- Conversation analytics
- Document processing stats
- Agent usage metrics
- Time saved estimates
- Productivity trends

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              Next.js Frontend                   │
│  (Dashboard, Chat, Documents, Tasks, Code)      │
└─────────────────┬───────────────────────────────┘
                  │ REST API / WebSocket
┌─────────────────▼───────────────────────────────┐
│              FastAPI Backend                    │
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │        Agent Router                     │  │
│  │  (Routes queries to specialized agents) │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────┐│
│  │  Code  │  │Document│  │  Task  │  │Research││
│  │ Agent  │  │ Agent  │  │ Agent  │  │ Agent ││
│  └────────┘  └────────┘  └────────┘  └──────┘│
│                                                 │
│  ┌─────────────────────────────────────────┐  │
│  │         RAG Pipeline                    │  │
│  │  (Embeddings, Vector DB, Retrieval)    │  │
│  └─────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
┌────────┐  ┌──────────┐  ┌─────────┐
│Vector  │  │PostgreSQL│  │  Redis  │
│  DB    │  │ Database │  │  Cache  │
└────────┘  └──────────┘  └─────────┘
```

---

## 💡 Use Cases

### For Developers 👨‍💻
- Analyze entire codebases
- Find and fix bugs automatically
- Generate documentation
- Code review assistance
- Architecture recommendations

### For Students 🎓
- Summarize textbooks and papers
- Create study notes
- Solve assignments with explanations
- Generate practice quizzes
- Personalized learning paths

### For Professionals 👔
- Summarize long documents
- Generate reports and presentations
- Extract action items from meetings
- Research assistance
- Email drafting

### For Teams 👥
- Shared knowledge base
- Automated customer support
- Document compliance checking
- Team productivity insights
- Collaborative AI workspace

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **shadcn/ui** - Beautiful, accessible components
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management
- **React Markdown** - Markdown rendering
- **Recharts** - Analytics charts

### Backend
- **FastAPI** - Modern Python web framework
- **LangChain** - LLM orchestration
- **OpenAI GPT-4** - Language model
- **Anthropic Claude** - Alternative LLM
- **Pinecone/Chroma** - Vector databases
- **SQLAlchemy** - ORM for database
- **Redis** - Caching layer
- **WebSocket** - Real-time communication

### AI/ML
- **OpenAI Embeddings** - Text embeddings
- **RAG (Retrieval-Augmented Generation)** - Knowledge retrieval
- **Multi-Agent System** - Specialized AI agents
- **Vector Search** - Semantic similarity search

---

## 📖 API Documentation

### Chat Endpoint
```python
POST /api/chat
{
  "message": "Analyze this code for bugs",
  "conversation_id": "optional-uuid",
  "agent_type": "code"  # optional, will auto-route
}
```

### Upload Document
```python
POST /api/documents/upload
Form Data:
  - file: File
```

### WebSocket Chat
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/chat');
ws.send("Hello, AI!");
```

Full API documentation: `http://localhost:8000/docs` (when running)

---

## 🎯 Roadmap

### Version 1.1
- [ ] Voice input/output
- [ ] Mobile app (React Native)
- [ ] Multi-user collaboration
- [ ] Custom agent creation
- [ ] Plugin system

### Version 1.2
- [ ] Local LLM support (LLaMA, Mistral)
- [ ] Advanced code generation
- [ ] Integration with GitHub/GitLab
- [ ] Slack/Teams integration
- [ ] Enterprise features

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [LangChain](https://langchain.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Powered by [OpenAI](https://openai.com/) and [Anthropic](https://www.anthropic.com/)

---

## 📞 Support

- **Documentation**: [Read the Docs](https://docs.example.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/universal-ai-workspace/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/universal-ai-workspace/discussions)
- **Email**: support@example.com

---

## ⭐ Star History

If you find this project useful, please consider giving it a star! ⭐

---

**Made with ❤️ by developers, for everyone**

*Connect your ideas. Amplify your intelligence. Work at the speed of thought.*
