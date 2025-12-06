// PWA registration and management utilities

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      })

      console.log('Service Worker registered:', registration)

      // Check for updates periodically
      setInterval(() => {
        registration.update()
      }, 60000) // Check every minute

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            showUpdateNotification()
          }
        })
      })

      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }
}

export const unregisterServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready
    await registration.unregister()
  }
}

export const showUpdateNotification = () => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Update Available', {
      body: 'A new version of Synapse AI is available. Refresh to update.',
      icon: '/icon-192.png',
      badge: '/badge-72.png'
    })
  }
}

export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }
  return Notification.permission === 'granted'
}

export const subscribeToPushNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.ready
    
    // Public VAPID key - in production, generate your own
    const publicVapidKey = 'YOUR_PUBLIC_VAPID_KEY'
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    })

    // Send subscription to backend
    const token = localStorage.getItem('token')
    await fetch('http://localhost:8000/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    })

    return subscription
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error)
    return null
  }
}

export const unsubscribeFromPushNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    
    if (subscription) {
      await subscription.unsubscribe()
      
      // Notify backend
      const token = localStorage.getItem('token')
      await fetch('http://localhost:8000/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      })
    }
  } catch (error) {
    console.error('Failed to unsubscribe from push notifications:', error)
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Check if app is installed as PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true
}

// Install prompt handling
let deferredPrompt: any = null

export const setupInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
  })
}

export const showInstallPrompt = async () => {
  if (!deferredPrompt) {
    return false
  }

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null

  return outcome === 'accepted'
}

// Offline detection
export const setupOfflineDetection = (
  onOnline: () => void,
  onOffline: () => void
) => {
  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}

// Check if feature is available
export const checkPWAFeatures = () => {
  return {
    serviceWorker: 'serviceWorker' in navigator,
    notifications: 'Notification' in window,
    pushManager: 'PushManager' in window,
    backgroundSync: 'sync' in ServiceWorkerRegistration.prototype,
    periodicBackgroundSync: 'periodicSync' in ServiceWorkerRegistration.prototype,
    shareTarget: 'share' in navigator,
    badging: 'setAppBadge' in navigator,
    fileHandling: 'launchQueue' in window
  }
}

// Update app badge (notification count)
export const updateAppBadge = async (count: number) => {
  if ('setAppBadge' in navigator) {
    try {
      if (count > 0) {
        await (navigator as any).setAppBadge(count)
      } else {
        await (navigator as any).clearAppBadge()
      }
    } catch (error) {
      console.error('Failed to update app badge:', error)
    }
  }
}

// Share API
export const shareContent = async (data: {
  title?: string
  text?: string
  url?: string
  files?: File[]
}) => {
  if ('share' in navigator) {
    try {
      await navigator.share(data)
      return true
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to share:', error)
      }
      return false
    }
  }
  return false
}
