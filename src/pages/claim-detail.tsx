import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, Clock3, Pencil } from 'lucide-react'
import { useApp, useUser } from '../app/context.ts'
import { Button } from '../components/ui/button.tsx'
import { EmptyState, LoadingState, PageHeading } from '../components/shared.tsx'
import { dateLabel, moneyLabel } from '../lib/utils.ts'
import { quoteClaim } from '../modules/configuration/store.ts'
import { ClaimOperations } from '../modules/incentives/operations.tsx'
import { ClaimStatusBadge, ClaimPreview } from '../modules/incentives/fields.tsx'
import { ClaimReviewPanel } from '../modules/incentives/review.tsx'
import { canEditClaim, canReviewClaim, visibleClaims } from '../modules/incentives/rules.ts'
import { templateFor, textAnswer } from '../modules/incentives/model.ts'
import { ClaimDataError } from './claims.tsx'

const tabs = ['Isian & Bukti', 'Versi Pengajuan', 'Pemeriksaan', 'Administrasi & Keputusan', 'Riwayat Aktivitas'] as const
export function ClaimDetailPage() {
  const { id } = useParams(), user = useUser(), { claims, claimsLoading, claimsError, hasUnsavedChanges } = useApp()
  const [tab, setTab] = useState<typeof tabs[number]>('Isian & Bukti'), [tabError, setTabError] = useState('')
  if (claimsLoading && !claims.length) return <LoadingState />
  if (claimsError) return <ClaimDataError />
  const claim = visibleClaims(claims, user).find(item => item.id === id), template = claim && templateFor(claim.categoryCode)
  if (!claim || !template) return <EmptyState title="Klaim tidak ditemukan" description="Klaim atau template tidak tersedia dalam cakupan akun ini." action={<Button asChild><Link to="/incentives">Kembali ke daftar</Link></Button>} />
  const quote = quoteClaim(claim.values, claim.ruleVersionId)
  return <><PageHeading title="Detail Klaim Insentif" description="Isian karya, bukti, pemeriksaan, dan salinan versi pengajuan." trail="Insentif Kepakaran / Detail" action={<Button variant="outline" asChild><Link to="/incentives"><ArrowLeft size={16} />Kembali ke daftar</Link></Button>} /><section className="surface detail-heading"><div><span className="detail-code">{claim.code} · Data simulasi</span><h2>{claim.title}</h2><p>{template.label} · {claim.identity.name}</p></div><div className="detail-heading-actions"><ClaimStatusBadge status={claim.status} />{canEditClaim(claim, user) && <Button asChild><Link to={`/incentives/${claim.id}/edit`}><Pencil size={16} />{claim.status === 'DRAFT' ? 'Lanjutkan Draft' : 'Perbaiki Klaim'}</Link></Button>}{canReviewClaim(claim, user) && <Button onClick={() => setTab('Pemeriksaan')}>Periksa Checklist</Button>}</div></section>
    <div className="info-notice"><strong>{quote.policy ? `SK ${quote.policy.reference} v${quote.policy.version}.` : 'Menunggu Konfigurasi SK.'}</strong> {quote.reason} {textAnswer(claim.values, 'publication_status') === 'LOA' && 'Status LOA mengikuti izin pada SK terikat.'} Penugasan dan keputusan tersedia pada Administrasi & Keputusan.</div>{claim.note && <div className="revision-note"><p>{claim.note}</p></div>}
    <section className="surface detail-panel"><div className="table-tabs detail-tabs" role="group" aria-label="Bagian klaim insentif">{tabs.map(label => <button key={label} className={tab === label ? 'selected' : ''} aria-pressed={tab === label} onClick={() => { if (tab !== label && hasUnsavedChanges) { setTabError('Simpan draft checklist sebelum berpindah bagian.'); return } setTabError(''); setTab(label) }}>{label}</button>)}</div>{tabError && <p role="alert" className="form-error">{tabError}</p>}
      {tab === 'Isian & Bukti' && <div className="detail-content"><dl className="metadata-grid"><div><dt>Tahun luaran</dt><dd>{claim.outputYear ?? 'Belum diisi'}</dd></div><div><dt>Tanggal pengajuan</dt><dd>{dateLabel(claim.submittedAt, true)}</dd></div><div><dt>Nominal usulan / disetujui</dt><dd>{claim.quotedAmount === null ? quote.reason : moneyLabel(claim.quotedAmount, 2)} / {claim.approvedAmount === null ? 'Belum diputuskan' : moneyLabel(claim.approvedAmount, 2)}</dd></div><div><dt>Versi template</dt><dd>{claim.templateVersionId}</dd></div></dl><ClaimPreview identity={claim.identity} values={claim.values} includeHidden /></div>}
      {tab === 'Versi Pengajuan' && <div className="detail-content"><h3>Salinan Versi Pengajuan</h3><p className="muted">Identitas, jawaban, dan bukti lama dipertahankan ketika klaim direvisi.</p>{claim.submissions.length ? [...claim.submissions].reverse().map(submission => <details className="submission-version" key={submission.version}><summary>Pengajuan versi {submission.version} · {dateLabel(submission.at, true)}</summary><ClaimPreview identity={submission.identity} values={submission.values} includeHidden /></details>) : <EmptyState title="Belum ada versi pengajuan" description="Simpan draft dan ajukan simulasi setelah isian teknis diperiksa." />}</div>}
      {tab === 'Pemeriksaan' && <ClaimReviewPanel key={`${claim.id}:${user.id}`} claim={claim} />}
      {tab === 'Administrasi & Keputusan' && <ClaimOperations key={`${claim.id}:${user.id}:${claim.version}`} claim={claim} />}
      {tab === 'Riwayat Aktivitas' && <div className="detail-content"><h3>Riwayat Aktivitas Klaim</h3><ol className="history-list">{[...claim.history].reverse().map((entry, index) => <li key={`${entry.at}:${index}`}><Clock3 size={18} /><div><strong>{entry.description}</strong><p>{entry.actor}</p><time dateTime={entry.at}>{dateLabel(entry.at, true)}</time></div></li>)}</ol><p className="muted">Versi record: {claim.version}. Semua riwayat disimpan di browser ini.</p></div>}
    </section>
  </>
}
