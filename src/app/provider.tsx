import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { AppContext } from './context.ts'
import { roles, type Activity, type Role } from '../modules/activities/model.ts'
import { demoUsers } from '../modules/activities/data.ts'
import { mockActivityRepository } from '../modules/activities/repository.ts'
import { mockClaimRepository } from '../modules/incentives/repository.ts'
import type { Claim } from '../modules/incentives/model.ts'
import { Button } from '../components/ui/button.tsx'
import { readConfig, initialConfig, CONFIG_KEY } from '../modules/configuration/store.ts'

const SESSION_KEY = 'aptimas.demo.session.v1'
function initialRole(): Role | null {
  try {
    const role = sessionStorage.getItem(SESSION_KEY)
    return roles.find(value => value === role) ?? null
  } catch { return null }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role | null>(initialRole)
  const [accountId, setAccountId] = useState(() => { try { return sessionStorage.getItem(`${SESSION_KEY}.account`) ?? '' } catch { return '' } })
  const [config, setConfig] = useState(initialConfig), [configError, setConfigError] = useState('')
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasUnsavedChanges, setUnsavedChanges] = useState(false)
  const [claims, setClaims] = useState<Claim[]>([])
  const [claimsLoading, setClaimsLoading] = useState(true)
  const [claimsError, setClaimsError] = useState('')
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null)
  const notify = useCallback((text: string) => setToast({ text, id: Date.now() }), [])
  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try { setActivities(await mockActivityRepository.list()) }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Data lokal tidak dapat dibaca.'); setActivities([]) }
    finally { setLoading(false) }
  }, [])
  const reloadClaims = useCallback(async () => {
    setClaimsLoading(true); setClaimsError('')
    try { setClaims(await mockClaimRepository.list()) }
    catch (failure) { setClaimsError(failure instanceof Error ? failure.message : 'Klaim lokal tidak dapat dibaca.'); setClaims([]) }
    finally { setClaimsLoading(false) }
  }, [])
  const reloadConfig = useCallback(async () => { try { setConfig(readConfig()); setConfigError('') } catch (failure) { setConfigError(failure instanceof Error ? failure.message : 'Konfigurasi tidak tersedia.') } }, [])
  useEffect(() => { void Promise.resolve().then(reload) }, [reload])
  useEffect(() => { void Promise.resolve().then(reloadClaims) }, [reloadClaims])
  useEffect(() => { void Promise.resolve().then(reloadConfig) }, [reloadConfig])
  useEffect(() => { const changed = (event: StorageEvent) => { if (event.key === CONFIG_KEY) void reloadConfig() }; window.addEventListener('storage', changed); return () => window.removeEventListener('storage', changed) }, [reloadConfig])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 6500)
    return () => window.clearTimeout(timer)
  }, [toast])
  function login(nextRole: Role, id?: string) {
    const account = config.accounts.find(a => a.active && a.role === nextRole && (!id || a.id === id))
    if (!account) { notify('Tidak ada akun aktif untuk peran ini.'); return }
    try { sessionStorage.setItem(SESSION_KEY, nextRole); sessionStorage.setItem(`${SESSION_KEY}.account`, account.id) } catch { notify('Sesi demo hanya berlaku selama halaman ini terbuka.') }
    setAccountId(account.id); setRole(nextRole)
  }
  function logout() {
    try { sessionStorage.removeItem(SESSION_KEY) } catch { /* Sesi di memori tetap ditutup. */ }
    setRole(null)
  }
  const currentAccount = role ? config.accounts.find(a => a.active && a.role === role && (accountId ? a.id === accountId : a.id === demoUsers[role].id)) : null
  return <AppContext.Provider value={{ user: currentAccount ?? null, activities, loading, error, login, logout, reload, notify, hasUnsavedChanges, setUnsavedChanges, claims, claimsLoading, claimsError, reloadClaims, config, configError, reloadConfig }}>
    {children}
    {toast && <div className="toast" role="status" aria-live="polite"><span>{toast.text}</span><Button size="icon" variant="ghost" onClick={() => setToast(null)} aria-label="Tutup pemberitahuan"><X size={18} /></Button></div>}
  </AppContext.Provider>
}
