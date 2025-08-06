'use client'

import { useEffect } from 'react'
import { registerServiceWorker, requestNotificationPermission } from '@/lib/pwa'

export default function PWAInitializer() {
  useEffect(() => {
    const initializePWA = async () => {
      // Register service worker
      const registration = await registerServiceWorker()
      
      if (registration) {
        console.log('PWA service worker registered successfully')
        
        // Request notification permission if not already granted
        const permission = await requestNotificationPermission()
        console.log('Notification permission:', permission)
        
        // Listen for app updates
        if (registration.waiting) {
          // New version is ready
          console.log('New app version is ready')
        }
      }
    }

    // Initialize PWA features after the app loads
    initializePWA()
  }, [])

  return null // This component doesn't render anything
}
