'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'
import { 
  isPWA, 
  canInstallPWA, 
  hasUserDismissedInstall, 
  dismissInstallPrompt,
  type PWAInstallPrompt as PWAPromptEvent
} from '@/lib/pwa'

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<PWAPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    // Don't show if already installed, can't install, or user dismissed
    if (isPWA() || !canInstallPWA() || hasUserDismissedInstall()) {
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as PWAPromptEvent
      setInstallPrompt(promptEvent)
      setShowInstallPrompt(true)
    }

    const handleAppInstalled = () => {
      setShowInstallPrompt(false)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return

    try {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      
      if (choice.outcome === 'accepted') {
        console.log('PWA installation accepted')
      } else {
        console.log('PWA installation dismissed')
        dismissInstallPrompt(false) // Session only
      }
    } catch (error) {
      console.error('PWA installation failed:', error)
    }
    
    setShowInstallPrompt(false)
    setInstallPrompt(null)
  }

  const handleDismiss = (permanent = false) => {
    setShowInstallPrompt(false)
    dismissInstallPrompt(permanent)
  }

  if (!showInstallPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <div className="bg-black-1 border border-gray-600 rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[--accent-color]" />
            <h3 className="text-14 font-bold text-white-1">ติดตั้งแอป</h3>
          </div>
          <button
            onClick={() => handleDismiss(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-12 text-gray-1 mb-3">
          ติดตั้งแอป TAT Podcast บนหน้าจอหลักเพื่อเข้าใช้งานได้อย่างรวดเร็ว
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            className="flex-1 bg-[--accent-color] hover:bg-[--accent-color]/80 text-white"
            size="sm"
          >
            ติดตั้ง
          </Button>
          <Button
            onClick={() => handleDismiss(false)}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
            size="sm"
          >
            ไว้ครั้งหน้า
          </Button>
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-700">
          <button
            onClick={() => handleDismiss(true)}
            className="text-10 text-gray-400 hover:text-gray-300 underline"
          >
            ไม่ต้องแสดงอีก
          </button>
        </div>
      </div>
    </div>
  )
}
