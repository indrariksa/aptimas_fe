import { createContext, useContext } from 'react'
import type { Activity, DemoUser, Role } from '../modules/activities/model.ts'
import type { Claim } from '../modules/incentives/model.ts'
import type { ConfigurationData } from '../modules/configuration/store.ts'

interface AppState {
  user: DemoUser | null; activities: Activity[]; loading: boolean; error: string;
  login: (role: Role, accountId?: string) => void; logout: () => void; reload: () => Promise<void>;
  notify: (message: string) => void;
  hasUnsavedChanges: boolean; setUnsavedChanges: (dirty: boolean) => void;
  claims: Claim[]; claimsLoading: boolean; claimsError: string; reloadClaims: () => Promise<void>;
  config: ConfigurationData; configError: string; reloadConfig: () => Promise<void>;
}
export const AppContext = createContext<AppState | null>(null)
export const demoMode = import.meta.env.DEV || import.meta.env.VITE_DEMO_MODE === 'true'
export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('AppProvider tidak tersedia.')
  return context
}
export function useUser() {
  const { user } = useApp()
  if (!user) throw new Error('Akun demo belum dipilih.')
  return user
}
