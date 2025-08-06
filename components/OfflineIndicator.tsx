'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)
      
      if (!online) {
        setShowIndicator(true)
      } else if (showIndicator) {
        // Show "back online" briefly
        setTimeout(() => setShowIndicator(false), 3000)
      }
    }

    // Initial check
    updateOnlineStatus()

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [showIndicator])

  if (!showIndicator) return null

  return (
    <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 ${
      isOnline ? 'bg-green-600' : 'bg-red-600'
    } text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg transition-all duration-300`}>
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span className="text-12">กลับมาออนไลน์แล้ว</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-12">ไม่มีสัญญาณอินเทอร์เน็ต</span>
        </>
      )}
    </div>
  )
}
