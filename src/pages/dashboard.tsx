import { useState } from 'react'
import { Link } from 'react-router'
import { Plus, ArrowRight, CalendarDays, Clock3, FileText, CircleCheck, ClipboardList, ChevronRight, Info } from 'lucide-react'
import { useApp, useUser } from '../app/context.ts'
import { Button } from '../components/ui/button.tsx'
import { Dialog } from '../components/ui/dialog.tsx'
import { LoadingState, EmptyState } from '../components/shared.tsx'
import { ActivityTable } from '../modules/activities/table.tsx'
import { visibleActivities, activitySummary, actionFor, canEditDraft } from '../modules/activities/rules.ts'
import { roleLabels } from '../modules/activities/model.ts'
import { announcements } from '../modules/activities/data.ts'
import { dateLabel } from '../lib/utils.ts'
import { DataError } from './data-error.tsx'

export function Dashboard() {
  const user = useUser()
  const { activities, loading, error } = useApp()
  const [announcementId, setAnnouncementId] = useState<string | null>(null)
  const announcement = announcements.find(item => item.id === announcementId)
  if (loading) return <LoadingState />
  if (error) return <DataError />
  const scoped = visibleActivities(activities, user)
  const summary = activitySummary(scoped)
  const actions = scoped.map(activity => ({ activity, action: actionFor(activity, user) })).filter(item => item.action)
  const stats = [
    { label: user.role === 'REVIEWER' ? 'Total Penugasan' : 'Total Pengajuan', value: summary.total, icon: FileText, detail: 'Dalam cakupan akun demo', url: '/activities' },
    { label: 'Sedang Diproses', value: summary.processing, icon: Clock3, detail: 'Pengajuan dan pelaksanaan aktif', url: '/activities?view=processing' },
    { label: 'Perlu Perbaikan', value: summary.correction, icon: ClipboardList, detail: 'Revisi atau kelengkapan berkas', url: '/activities?view=correction' },
    { label: 'Selesai', value: summary.completed, icon: CircleCheck, detail: 'Kegiatan telah diselesaikan', url: '/activities?view=completed' },
  ]
  return <>
    <div className="dashboard-kicker"><span>Dashboard {roleLabels[user.role]}</span><span><CalendarDays size={15} />Tahun akademik 2026</span></div>
    <section className="welcome-section"><div><h1>Selamat datang, {user.name}.</h1><p>{actions.length ? <><strong>{actions.length} kegiatan</strong> membutuhkan perhatian Anda. Mari lanjutkan aktivitas akademik hari ini.</> : 'Pantau pengajuan dan perkembangan kegiatan akademik Anda di sini.'}</p></div>{user.role === 'DOSEN' && <Button asChild><Link to="/activities/new/research"><Plus size={18} />Pengajuan Baru</Link></Button>}</section>
    <div className="period-banner"><div className="period-icon"><CalendarDays size={21} /></div><div><strong>Periode Hibah Internal 2026</strong><span>Pengajuan dibuka sampai 31 Oktober 2026 <span className="inline-demo">· Jadwal simulasi</span></span></div><button className="period-link" onClick={() => setAnnouncementId('period')}>Lihat informasi<ChevronRight size={16} /></button></div>
    <div className="summary-grid">{stats.map(({ label, value, icon: Icon, detail, url }) => <Link key={label} to={url} className="summary-item"><div className="summary-label"><span>{label}</span><Icon size={19} /></div><div className="summary-value">{value.toLocaleString('id-ID')}<span>pengajuan</span></div><p>{detail}</p></Link>)}</div>
    <div className="dashboard-content"><div className="dashboard-primary"><ActivityTable activities={scoped} compact title={user.role === 'REVIEWER' ? 'Pengajuan yang ditugaskan' : 'Aktivitas & Pengajuan'} /><div className="simulation-note"><Info size={15} /><span>Seluruh angka dan pengajuan di atas merupakan data simulasi, bukan data institusi.</span></div></div>
      <aside className="action-center surface"><div className="section-heading"><div><h2>Perlu Ditindaklanjuti</h2><p>Prioritas kegiatan Anda</p></div><span className="action-count">{actions.length}</span></div><div className="action-list">{actions.slice(0, 4).map(({ activity, action }) => <article key={activity.id}><span className={`action-category ${activity.status === 'REVISION_REQUIRED' || activity.status === 'NEEDS_CORRECTION' ? 'text-warning' : ''}`}>{action?.label}</span><h3>{activity.title}</h3><p>{action?.description}</p><Link to={canEditDraft(activity, user) ? `/activities/${activity.id}/edit` : `/activities/${activity.id}`}>{canEditDraft(activity, user) ? 'Lanjutkan draft' : 'Lihat detail'}<ArrowRight size={15} /></Link></article>)}</div>{!actions.length && <EmptyState title="Semua sudah ditinjau" description="Tidak ada kegiatan yang membutuhkan tindakan pada akun ini." />}{actions.length > 4 && <Link className="action-more" to="/activities">Lihat seluruh kegiatan<ChevronRight size={15} /></Link>}</aside>
    </div>
    <section className="surface announcements"><div className="section-heading"><div><h2>Informasi Kegiatan</h2><p>Periode dan pengumuman untuk aktivitas akademik</p></div><span className="inline-demo">Informasi simulasi</span></div><div className="announcement-list">{announcements.map(item => <button key={item.id} onClick={() => setAnnouncementId(item.id)} className="announcement-item"><span className="announcement-date"><span>{dateLabel(item.date).split(' ')[0]}</span><small>{dateLabel(item.date).split(' ').slice(1).join(' ')}</small></span><span className="announcement-copy"><small>{item.category}</small><strong>{item.title}</strong></span><ChevronRight size={18} /></button>)}</div></section>
    <Dialog open={!!announcement} onOpenChange={open => { if (!open) setAnnouncementId(null) }} title={announcement?.title ?? 'Informasi kegiatan'} description={`Informasi simulasi, ${dateLabel(announcement?.date ?? null, true)}`}><p className="announcement-body">{announcement?.body}</p><Button onClick={() => setAnnouncementId(null)}>Tutup informasi</Button></Dialog>
  </>
}
