// PWA utility functions for TAT Podcast

export interface PWAInstallPrompt extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

// Check if app is running as PWA
export function isPWA(): boolean {
  if (typeof window === 'undefined') return false
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as any)?.standalone === true ||
    document.referrer.includes('android-app://') ||
    window.location.search.includes('pwa=true')
  )
}

// Check if device supports PWA installation
export function canInstallPWA(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check for beforeinstallprompt support
  return 'onbeforeinstallprompt' in window
}

// Get PWA installation prompt
export function getPWAInstallPrompt(): PWAInstallPrompt | null {
  if (typeof window === 'undefined') return null
  return (window as any).deferredPrompt || null
}

// Set PWA installation prompt
export function setPWAInstallPrompt(prompt: PWAInstallPrompt | null): void {
  if (typeof window === 'undefined') return
  ;(window as any).deferredPrompt = prompt
}

// Check if user has dismissed install prompt
export function hasUserDismissedInstall(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('pwa-install-dismissed') === 'true' ||
         sessionStorage.getItem('pwa-install-dismissed') === 'true'
}

// Mark install prompt as dismissed
export function dismissInstallPrompt(permanent = false): void {
  if (typeof window === 'undefined') return
  
  if (permanent) {
    localStorage.setItem('pwa-install-dismissed', 'true')
  } else {
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }
}

// Check if app is running offline
export function isOffline(): boolean {
  if (typeof navigator === 'undefined') return false
  return !navigator.onLine
}

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service workers not supported')
    return null
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })

    console.log('Service worker registered:', registration)

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            console.log('New service worker version available')
            // You can show a notification to reload
            showUpdateNotification()
          }
        })
      }
    })

    return registration
  } catch (error) {
    console.error('Service worker registration failed:', error)
    return null
  }
}

// Show update notification
function showUpdateNotification(): void {
  // You can implement a toast notification here
  console.log('App update available. Please refresh to get the latest version.')
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }

  if (Notification.permission === 'default') {
    return await Notification.requestPermission()
  }

  return Notification.permission
}

// Show notification
export function showNotification(title: string, options?: NotificationOptions): void {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/pwa/icon-192x192.png',
      badge: '/icons/pwa/icon-192x192.png',
      ...options
    })
  }
}

// Cache podcast for offline listening
export async function cachePodcastForOffline(audioUrl: string, podcastId: string): Promise<boolean> {
  try {
    if ('caches' in window) {
      const cache = await caches.open('tat-podcast-audio-v1')
      const response = await fetch(audioUrl)
      
      if (response.ok) {
        await cache.put(audioUrl, response)
        console.log(`Podcast ${podcastId} cached for offline listening`)
        return true
      }
    }
    return false
  } catch (error) {
    console.error('Failed to cache podcast for offline:', error)
    return false
  }
}

// Check if podcast is cached for offline
export async function isPodcastCachedForOffline(audioUrl: string): Promise<boolean> {
  try {
    if ('caches' in window) {
      const cache = await caches.open('tat-podcast-audio-v1')
      const response = await cache.match(audioUrl)
      return !!response
    }
    return false
  } catch (error) {
    console.error('Failed to check podcast cache:', error)
    return false
  }
}

// Get cached podcasts
export async function getCachedPodcasts(): Promise<string[]> {
  try {
    if ('caches' in window) {
      const cache = await caches.open('tat-podcast-audio-v1')
      const requests = await cache.keys()
      return requests.map(request => request.url)
    }
    return []
  } catch (error) {
    console.error('Failed to get cached podcasts:', error)
    return []
  }
}

// Clear podcast cache
export async function clearPodcastCache(): Promise<boolean> {
  try {
    if ('caches' in window) {
      return await caches.delete('tat-podcast-audio-v1')
    }
    return false
  } catch (error) {
    console.error('Failed to clear podcast cache:', error)
    return false
  }
}

// Get app version from cache
export async function getAppVersion(): Promise<string> {
  try {
    const cacheNames = await caches.keys()
    const versionCache = cacheNames.find(name => name.includes('tat-podcast-v'))
    return versionCache?.split('-v')[1] || '1.0.0'
  } catch (error) {
    console.error('Failed to get app version:', error)
    return '1.0.0'
  }
}

// Force app update
export async function forceAppUpdate(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      
      for (const registration of registrations) {
        await registration.unregister()
      }
      
      // Clear all caches
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      
      // Reload the page
      window.location.reload()
    }
  } catch (error) {
    console.error('Failed to force app update:', error)
  }
}
