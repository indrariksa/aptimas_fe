import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Pencil, Info, Clock3 } from 'lucide-react'
import { useApp, useUser } from '../app/context.ts'
import { Button } from '../components/ui/button.tsx'
import { EmptyState, LoadingState, PageHeading, StatusBadge } from '../components/shared.tsx'
import { visibleActivities, canEditDraft } from '../modules/activities/rules.ts'
import { domainLabels } from '../modules/activities/model.ts'
import { ProposalPreview } from '../modules/activities/proposal-preview.tsx'
import { ActivityMilestones } from '../modules/activities/milestones.tsx'
import { FileList } from '../modules/activities/file-input.tsx'
import { dateLabel, moneyLabel } from '../lib/utils.ts'
import { DataError } from './data-error.tsx'

const tabs = ['Informasi Umum', 'Proposal & Revisi', 'Laporan', 'Luaran', 'Riwayat Aktivitas'] as const
export function ActivityDetail() {
  const user = useUser(), { activities, loading, error } = useApp(), { id } = useParams()
  const [tab, setTab] = useState<typeof tabs[number]>('Informasi Umum')
  if (loading && !activities.length) return <LoadingState />
  if (error) return <DataError />
  const activity = visibleActivities(activities, user).find(item => item.id === id)
  if (!activity) return <EmptyState title="Pengajuan tidak ditemukan" description="Pengajuan tidak tersedia dalam cakupan akun demo ini." action={<Button asChild><Link to="/activities">Kembali ke daftar</Link></Button>} />
  const metadata = [['Jenis kegiatan', domainLabels[activity.domain]], ['Skema / versi', `${activity.scheme} / ${activity.schemeVersionId}`], ['Tahun pengajuan', String(activity.year)], ['Ketua pengusul', activity.ownerName], ['Program studi', activity.studyProgram], ['Tanggal pengajuan', dateLabel(activity.submittedAt, true)], ['Dana diajukan (simulasi)', moneyLabel(activity.requestedAmount, 2)], ['Dana disetujui (simulasi)', moneyLabel(activity.approvedAmount)]]
  return <><PageHeading title="Detail Kegiatan" description="Proposal, laporan, capaian, dan riwayat pengajuan akademik." trail={`${domainLabels[activity.domain]} / Detail`} action={<Button variant="outline" asChild><Link to="/activities"><ArrowLeft size={16} />Kembali ke daftar</Link></Button>} />
    <section className="surface detail-heading"><div><span className="detail-code">{activity.code} · Data simulasi</span><h2>{activity.title}</h2><p>{activity.ownerName} · {activity.studyProgram}</p></div><div className="detail-heading-actions"><StatusBadge status={activity.status} />{canEditDraft(activity, user) && <Button asChild><Link to={`/activities/${activity.id}/edit`}><Pencil size={16} />{activity.status === 'DRAFT' ? 'Lanjutkan Draft' : 'Perbaiki Proposal'}</Link></Button>}</div></section>
    {activity.note && <div className="revision-note"><Info size={20} /><div><strong>Catatan pemeriksaan simulasi</strong><p>{activity.note}</p><small>Perbaikan menghasilkan versi pengajuan baru; salinan sebelumnya tetap tersimpan.</small></div></div>}
    {user.role === 'REVIEWER' && <div className="info-notice">Anda memiliki penugasan untuk kegiatan ini. Form penilaian tersedia pada Fase 4; keputusan final menunggu SOP.</div>}
    <section className="surface detail-panel"><div className="table-tabs detail-tabs" role="group" aria-label="Bagian detail kegiatan">{tabs.map(label => <button key={label} className={tab === label ? 'selected' : ''} aria-pressed={tab === label} onClick={() => setTab(label)}>{label}</button>)}</div>
      {tab === 'Informasi Umum' && <div className="detail-content"><h3>Identitas Kegiatan</h3><dl className="metadata-grid">{metadata.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><section className="form-section"><h3>Ringkasan</h3><p className="summary-text">{activity.summary || 'Ringkasan belum diisi.'}</p></section><section className="form-section"><h3>Tahapan Kegiatan</h3><ol className="milestone-list">{[
        ['Proposal', activity.submissions.some(item => item.kind === 'PROPOSAL') ? 'Versi lokal tersedia' : 'Belum ada versi lokal'],
        ['Revisi Proposal', activity.submissions.some(item => item.kind === 'PROPOSAL_REVISION') ? 'Versi lokal tersedia' : ['REVISION_REQUIRED', 'NEEDS_CORRECTION'].includes(activity.status) ? 'Perlu perbaikan' : 'Bila diperlukan'],
        ['Laporan Kemajuan', activity.reports.some(item => item.kind === 'PROGRESS_REPORT') ? 'Diajukan lokal' : 'Belum ada laporan lokal'],
        ['Laporan Akhir', activity.reports.some(item => item.kind === 'FINAL_REPORT') ? 'Diajukan lokal' : 'Belum ada laporan lokal'],
        ['Luaran', activity.realizations.length ? 'Bukti lokal tersedia' : 'Belum ada bukti lokal'],
      ].map(([label, state], index) => <li key={label}><span>{index + 1}</span><div><strong>{label}</strong><p className="muted">{state}</p></div></li>)}</ol><p className="info-notice">Approval dan penerimaan milestone tidak diaktifkan sebelum SOP dikonfigurasi. Status pada data contoh awal tidak mewakili keputusan nyata.</p></section>{activity.fundingSource !== 'INTERNAL' && <div className="info-notice">Referensi eksternal dicatat manual. Tidak ada sinkronisasi ke BIMA/Hiliriset atau verifikasi status nasional otomatis.</div>}</div>}
      {tab === 'Proposal & Revisi' && <div className="detail-content"><h3>Isian Kegiatan Terkini</h3>{activity.proposal ? <ProposalPreview owner={activity.ownerName} values={{ title: activity.title, schemeVersionId: activity.schemeVersionId, year: '2026', summary: activity.summary, proposal: activity.proposal }} /> : <EmptyState title="Isian lengkap belum tersedia" description="Data contoh awal berisi identitas dan status. Lengkapi wizard pada kegiatan yang masih draft atau meminta perbaikan." />}<section className="form-section"><h3>Versi Pengajuan</h3><p className="muted">Setiap pengajuan menyimpan salinan isian dan berkas. Salinan lama tidak berubah ketika draft diperbaiki.</p>{activity.submissions.length ? [...activity.submissions].reverse().map(submission => <details className="submission-version" key={submission.version}><summary>{submission.kind === 'PROPOSAL' ? 'Proposal' : 'Revisi Proposal'} · Versi {submission.version} · {dateLabel(submission.at, true)}</summary><p className="muted">Diajukan oleh {submission.actor}</p><ProposalPreview owner={submission.actor} values={submission.values} /></details>) : <p className="muted">Belum ada salinan pengajuan lokal.</p>}</section>{!activity.proposal && activity.submissions.length > 0 && <FileList files={activity.submissions.at(-1)!.values.proposal.files} />}</div>}
      <ActivityMilestones key={activity.id} activity={activity} view={tab === 'Laporan' || tab === 'Luaran' ? tab : 'hidden'} />
      {tab === 'Riwayat Aktivitas' && <div className="detail-content"><h3>Riwayat Aktivitas</h3><ol className="history-list">{[...activity.history].reverse().map((item, index) => <li key={`${item.at}:${index}`}><Clock3 size={19} /><div><strong>{item.description}</strong><p>{item.actor}</p><time dateTime={item.at}>{dateLabel(item.at, true)}</time></div></li>)}</ol><p className="muted">Versi data saat ini: {activity.version}. Riwayat tersimpan lokal sebagai simulasi.</p></div>}
    </section>
  </>
}
