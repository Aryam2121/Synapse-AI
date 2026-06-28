// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/api/auth/login`,
  REGISTER: `${API_URL}/api/auth/register`,
  LOGOUT: `${API_URL}/api/auth/logout`,
  ME: `${API_URL}/api/auth/me`,
  FORGOT_PASSWORD: `${API_URL}/api/auth/forgot-password`,
  FIREBASE_AUTH: `${API_URL}/api/auth/firebase`,
  
  // Chat
  CHAT: `${API_URL}/api/chat`,
  CHAT_STREAM: `${API_URL}/api/chat/stream`,
  CHAT_MODELS: `${API_URL}/api/chat/models`,
  CONVERSATIONS: `${API_URL}/api/conversations`,
  CONVERSATION_MESSAGES: (id: string) => `${API_URL}/api/conversations/${id}/messages`,
  CONVERSATION_DELETE: (id: string) => `${API_URL}/api/conversations/${id}`,
  CONVERSATION_TRUNCATE: (convId: string, msgId: string) =>
    `${API_URL}/api/conversations/${convId}/messages/from/${msgId}`,
  
  // Documents
  DOCUMENTS_UPLOAD: `${API_URL}/api/documents/upload`,
  DOCUMENTS_LIST: `${API_URL}/api/documents`,
  DOCUMENTS_DELETE: (id: string) => `${API_URL}/api/documents/${id}`,
  
  // Tasks
  TASKS: `${API_URL}/api/tasks`,
  TASK_BY_ID: (id: string) => `${API_URL}/api/tasks/${id}`,
  
  // Analytics
  ANALYTICS: `${API_URL}/api/analytics`,
  
  // Settings
  SETTINGS: `${API_URL}/api/settings`,
  
  // Health
  HEALTH: `${API_URL}/health`,
}

export default API_URL
