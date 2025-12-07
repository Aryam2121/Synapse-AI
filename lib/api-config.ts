// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_URL}/api/auth/login`,
  REGISTER: `${API_URL}/api/auth/register`,
  LOGOUT: `${API_URL}/api/auth/logout`,
  ME: `${API_URL}/api/auth/me`,
  
  // Chat
  CHAT: `${API_URL}/api/chat`,
  CHAT_STREAM: `${API_URL}/api/chat/stream`,
  
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
