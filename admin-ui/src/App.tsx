import { useCallback, useEffect, useState } from 'react'
import { storage } from '@/lib/storage'
import { LoginPage } from '@/components/login-page'
import { Dashboard } from '@/components/dashboard'
import { SetupPage } from '@/components/setup-page'
import { Toaster } from '@/components/ui/sonner'
import { getSetupStatus } from '@/api/credentials'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [needsSetup, setNeedsSetup] = useState(true)
  const [isChecking, setIsChecking] = useState(true)

  const refreshStatus = useCallback(async () => {
    setIsChecking(true)
    try {
      const status = await getSetupStatus()
      setNeedsSetup(!status.initialized)
      const savedKey = storage.getApiKey()
      setIsLoggedIn(status.initialized && !!savedKey)
    } catch (error) {
      const savedKey = storage.getApiKey()
      setNeedsSetup(false)
      setIsLoggedIn(!!savedKey)
    } finally {
      setIsChecking(false)
    }
  }, [])

  useEffect(() => {
    refreshStatus()
  }, [refreshStatus])

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  const handleSetupComplete = () => {
    setNeedsSetup(false)
    refreshStatus()
  }

  return (
    <>
      {isChecking ? (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : needsSetup ? (
        <SetupPage onInitialized={handleSetupComplete} />
      ) : isLoggedIn ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
      <Toaster position="top-right" />
    </>
  )
}

export default App
