import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { AppContext } from './context.ts'
import { roles, type Activity, type Role } from '../modules/activities/model.ts'
import { demoUsers } from '../modules/activities/data.ts'
import { mockActivityRepository } from '../modules/activities/repository.ts'
import { Button } from '../components/ui/button.tsx'

const SESSION_KEY = 'aptimas.demo.session.v1'
function initialRole(): Role | null {
  try {
    const role = sessionStorage.getItem(SESSION_KEY)
    return roles.find(value => value === role) ?? null
  } catch { return null }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(initialRole)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasUnsavedChanges, setUnsavedChanges] = useState(false)
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null)
  const notify = useCallback((text: string) => setToast({ text, id: Date.now() }), [])
  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setActivities(await mockActivityRepository.list()) }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Data lokal tidak dapat dibaca.'); setActivities([]) }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void Promise.resolve().then(reload) }, [reload])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 6500)
    return () => window.clearTimeout(timer)
  }, [toast])
  function login(nextRole: Role) {
    try { sessionStorage.setItem(SESSION_KEY, nextRole) } catch { notify('Sesi demo hanya berlaku selama halaman ini terbuka.') }
    setRole(nextRole)
  }
  function logout() {
    try { sessionStorage.removeItem(SESSION_KEY) } catch { /* Sesi di memori tetap ditutup. */ }
    setRole(null)
  }
  return <AppContext.Provider value={{ user: role ? demoUsers[role] : null, activities, loading, error, login, logout, reload, notify, hasUnsavedChanges, setUnsavedChanges }}>
    {children}
    {toast && <div className="toast" role="status" aria-live="polite"><span>{toast.text}</span><Button size="icon" variant="ghost" onClick={() => setToast(null)} aria-label="Tutup pemberitahuan"><X size={18} /></Button></div>}
  </AppContext.Provider>
}
