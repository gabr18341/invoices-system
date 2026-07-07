'use client'

import { useEffect, useState } from 'react'

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function PwaClient() {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(
    null
  )
  const [canInstall, setCanInstall] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream)
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

    const handler = (e: Event) => {
      e.preventDefault?.()
      setDeferredPrompt(e as InstallPromptEvent)
      setCanInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (isStandalone) return null

  return (
    <div className="print:hidden">
      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <div className="text-sm font-semibold text-gray-900">تثبيت التطبيق</div>
            <div className="text-sm text-gray-600 mt-1">
              يمكنك تثبيت نظام الفواتير كتطبيق على الجوال أو الكمبيوتر للوصول السريع.
            </div>
            {isIOS && (
              <div className="text-xs text-gray-500 mt-2">
                على iPhone/iPad: افتح قائمة المشاركة ثم اختر “إضافة إلى الشاشة الرئيسية”.
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!canInstall}
              onClick={async () => {
                if (!deferredPrompt) return
                await deferredPrompt.prompt()
                await deferredPrompt.userChoice
                setDeferredPrompt(null)
                setCanInstall(false)
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              تثبيت
            </button>
            <a
              href="/"
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800 font-semibold hover:bg-gray-200 transition-colors"
            >
              لاحقاً
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

