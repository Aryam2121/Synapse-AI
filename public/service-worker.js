// Service Worker for PWA offline support and caching
const CACHE_NAME = 'synapse-ai-v1'
const OFFLINE_URL = '/offline.html'

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/dashboard',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip API requests (they should always go to network)
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline - API unavailable' }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      })
    )
    return
  }

  // Network-first strategy for navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL)
      })
    )
    return
  }

  // Cache-first strategy for other requests
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
    })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions())
  }
})

async function syncOfflineActions() {
  // Sync any offline actions with the server
  const offlineActions = await getOfflineActions()
  
  for (const action of offlineActions) {
    try {
      await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body
      })
      await removeOfflineAction(action.id)
    } catch (error) {
      console.error('Failed to sync action:', error)
    }
  }
}

async function getOfflineActions() {
  // Retrieve offline actions from IndexedDB
  return []
}

async function removeOfflineAction(id) {
  // Remove synced action from IndexedDB
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/dashboard'
    },
    actions: [
      {
        action: 'open',
        title: 'Open',
        icon: '/icon-open.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-close.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Synapse AI', options)
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    )
  }
})
