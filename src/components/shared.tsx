import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ChevronRight, CircleAlert, FileSearch } from 'lucide-react'
import { Button } from './ui/button.tsx'
import { statusLabels, type ActivityStatus } from '../modules/activities/model.ts'

export function StatusBadge({ status }: { status: ActivityStatus }) {
  const tone = ['COMPLETED', 'APPROVED'].includes(status) ? 'success' : ['REVISION_REQUIRED', 'NEEDS_CORRECTION', 'OUTPUT_PENDING'].includes(status) ? 'warning' : ['REJECTED', 'WITHDRAWN'].includes(status) ? 'danger' : status === 'DRAFT' ? 'neutral' : 'info'
  return <span className={`status-badge status-${tone}`}>{statusLabels[status]}</span>
}

export function PageHeading({ title, description, action, trail = title }: { title: string; description: string; action?: ReactNode; trail?: string }) {
  return <>
    <nav className="breadcrumb" aria-label="Jejak navigasi"><Link to="/dashboard">Beranda</Link><ChevronRight size={14} /><span aria-current="page">{trail}</span></nav>
    <div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div>{action}</div>
  </>
}

export function Field({ id, label, error, hint, children, required = false }: { id: string; label: string; error?: string; hint?: string; children: ReactNode; required?: boolean }) {
  return <div className="field"><label htmlFor={id}>{label}{required && <span className="required-mark" aria-label="wajib"> *</span>}</label>{children}
    {error ? <p id={`${id}-error`} className="field-error" role="alert">{error}</p> : hint ? <p id={`${id}-hint`} className="field-hint">{hint}</p> : null}
  </div>
}

export function LoadingState() {
  return <section className="surface loading-state" aria-busy="true" aria-label="Memuat pengajuan"><p role="status">Memuat data pengajuan…</p><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></section>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><FileSearch size={28} aria-hidden="true" /><h3>{title}</h3><p>{description}</p>{action}</div>
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <section className="surface error-state" role="alert"><CircleAlert size={24} /><div><h2>Data belum dapat ditampilkan</h2><p>{message}</p>{retry && <Button variant="outline" onClick={retry}>Coba kembali</Button>}</div></section>
}
