import { useCallback, useEffect, useRef, useState } from 'react'
import { useBeforeUnload, useBlocker } from 'react-router'
import { Check, Save } from 'lucide-react'
import { useApp, useUser } from '../../app/context.ts'
import { Button } from '../../components/ui/button.tsx'
import { Dialog } from '../../components/ui/dialog.tsx'
import { Field } from '../../components/shared.tsx'
import { dateLabel } from '../../lib/utils.ts'
import { AnswerView } from './fields.tsx'
import { emptyReview, templateFor, type Claim, type ClaimReview } from './model.ts'
import { canReviewClaim, fieldVisible, reviewIssues } from './rules.ts'
import { mockClaimRepository } from './repository.ts'

const recommendationLabels = { '': 'Belum diberikan', CONTINUE: 'Dapat diteruskan untuk pemeriksaan kebijakan', CORRECTION_NEEDED: 'Perlu perbaikan / pemeriksaan lanjutan' }
export function ClaimReviewPanel({ claim }: { claim: Claim }) {
  const user = useUser(), { reloadClaims, notify, setUnsavedChanges } = useApp(), canReview = canReviewClaim(claim, user)
  const template = templateFor(claim.categoryCode)!, latest = claim.submissions.at(-1), before = claim.submissions.at(-2)
  const initial = claim.reviewDrafts.find(review => review.reviewerId === user.id && review.submissionVersion === latest?.version) ?? emptyReview(claim, user.id)
  const [review, setReview] = useState(initial), [dirty, setDirty] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(''), [confirm, setConfirm] = useState(false), [expectedVersion, setExpectedVersion] = useState(claim.version)
  const saved = useRef(false)
  useEffect(() => { setUnsavedChanges(dirty); return () => setUnsavedChanges(false) }, [dirty, setUnsavedChanges])
  useBeforeUnload(useCallback(event => { if (dirty && !saved.current) { event.preventDefault(); event.returnValue = '' } }, [dirty]))
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !saved.current && currentLocation.pathname !== nextLocation.pathname)
  const sourceValues = latest?.values ?? claim.values, fields = template.fields.filter(field => field.reviewerSuitabilityField)
  const applicable = fields.filter(field => fieldVisible(field, sourceValues)), completed = applicable.filter(field => review.checks[field.fieldId]).length
  async function persist(finish: boolean) {
    if (busy) return
    const errors = reviewIssues(claim, review, user, finish)
    setError(errors.join(' '))
    if (errors.length) { setConfirm(false); return }
    setBusy(true)
    try {
      const result = await mockClaimRepository.saveReview(claim.id, review, user, expectedVersion, finish)
      setExpectedVersion(result.version); setDirty(false); saved.current = true; setConfirm(false)
      notify(finish ? 'Checklist selesai disimpan. Keputusan final dan nominal mengikuti SK/SOP pada Administrasi & Keputusan.' : 'Draft checklist reviewer tersimpan.')
      await reloadClaims()
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Checklist belum tersimpan. Coba kembali.'); setConfirm(false) }
    finally { setBusy(false) }
  }
  function update<K extends keyof ClaimReview>(key: K, value: ClaimReview[K]) { saved.current = false; setReview(current => ({ ...current, [key]: value })); setDirty(true) }
  return <div className="detail-content claim-review-panel"><h3>Checklist Kesesuaian Reviewer</h3><p className="info-notice">Pemeriksaan mengacu versi pengajuan {latest?.version ?? 'belum tersedia'}. Jawaban Ya/Tidak pengusul dan Kesesuaian reviewer disimpan terpisah. Keputusan final mengikuti SK/SOP pada bagian Administrasi & Keputusan.</p>{canReview && <p className="claim-review-progress" role="status">{completed} dari {applicable.length} butir yang berlaku sudah diperiksa.</p>}
    <form onSubmit={event => { event.preventDefault(); if (!canReview) return; const errors = reviewIssues(claim, review, user, true); setError(errors.join(' ')); if (!errors.length) setConfirm(true) }}><fieldset className="wizard-fieldset" disabled={busy}><div className="table-scroll" role="region" aria-label="Checklist kesesuaian dan jawaban pengusul" tabIndex={0}><table className="claim-review-table"><thead><tr><th scope="col">Butir sumber</th><th scope="col">Jawaban / bukti pengusul</th><th scope="col">Kesesuaian</th></tr></thead><tbody>{fields.map(field => {
      const active = fieldVisible(field, sourceValues), changed = before && JSON.stringify(before.values.answers[field.key]) !== JSON.stringify(sourceValues.answers[field.key])
      const recorded = !canReview ? claim.reviews.filter(item => item.submissionVersion === latest?.version).at(-1)?.checks[field.fieldId] ?? claim.reviewDrafts.find(item => item.reviewerId === user.id && item.submissionVersion === latest?.version)?.checks[field.fieldId] : review.checks[field.fieldId]
      return <tr key={field.fieldId}><th scope="row"><strong>{field.sourceLabel}</strong><span>Baris {field.sourceRow} · {field.sourceSheet}</span>{changed && <span className="status-badge status-warning">Diubah sejak versi sebelumnya</span>}</th><td><AnswerView answer={sourceValues.answers[field.key]} />{changed && <details className="previous-answer"><summary>Lihat jawaban sebelumnya</summary><AnswerView answer={before.values.answers[field.key]} /></details>}</td><td>{active ? canReview ? <><label className="sr-only" htmlFor={`check-${field.fieldId}`}>Kesesuaian {field.sourceLabel}</label><select id={`check-${field.fieldId}`} value={recorded ?? ''} onChange={event => { const value = event.target.value; const checks = { ...review.checks }; if (value === 'Ya' || value === 'Tidak') checks[field.fieldId] = value; else delete checks[field.fieldId]; update('checks', checks) }}><option value="">Belum diperiksa</option><option>Ya</option><option>Tidak</option></select></> : <span>{recorded ?? 'Belum diperiksa'}</span> : <span className="muted">Tidak berlaku pada kondisi isian ini</span>}</td></tr>
    })}</tbody></table></div>
      {canReview && <><Field id="reviewer-comment" label={template.fields.find(field => field.actor === 'REVIEWER')?.sourceLabel ?? 'Komentar Reviewer'} required hint="Komentar diperlukan saat menyelesaikan pemeriksaan."><textarea id="reviewer-comment" rows={4} maxLength={5000} value={review.comment} onChange={event => update('comment', event.target.value)} /></Field><Field id="reviewer-recommendation" label="Rekomendasi pemeriksaan (bukan keputusan final)"><select id="reviewer-recommendation" value={review.recommendation} onChange={event => update('recommendation', event.target.value as ClaimReview['recommendation'])}>{Object.entries(recommendationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>{error && <div className="form-error" role="alert">{error}</div>}<div className="form-actions"><Button variant="outline" type="button" onClick={() => persist(false)}><Save size={16} />{busy ? 'Menyimpan…' : 'Simpan Draft Checklist'}</Button><Button type="submit"><Check size={16} />Selesaikan Pemeriksaan</Button></div></>}
    </fieldset></form>
    {!canReview && claim.reviews.length === 0 && <p className="muted">Belum ada pemeriksaan butir yang diselesaikan pada data lokal.</p>}
    <p className="info-notice">Keputusan final, quote SK, dan koreksi nominal tersedia pada bagian Administrasi & Keputusan, sesuai kewenangan akun.</p>
    {claim.reviews.length > 0 && <section className="form-section"><h3>Riwayat Pemeriksaan</h3>{[...claim.reviews].reverse().map(item => <details className="submission-version" key={item.version}><summary>{item.actor} · Pengajuan v{item.submissionVersion} · {dateLabel(item.at, true)}</summary><p className="summary-text">{item.comment}</p><p>Rekomendasi: {recommendationLabels[item.recommendation]}</p><dl className="review-history-checks">{fields.map(field => <div key={field.fieldId}><dt>{field.sourceLabel}</dt><dd>{item.checks[field.fieldId] ?? 'Tidak diperiksa / kondisi tidak berlaku'}</dd></div>)}</dl></details>)}</section>}
    <Dialog open={confirm} onOpenChange={open => { if (!busy) setConfirm(open) }} title="Selesaikan pemeriksaan butir?" description="Checklist dan komentar dikunci pada versi pengajuan ini. Keputusan final dan nominal diproses terpisah menurut SK/SOP."><div className="dialog-actions"><Button variant="outline" disabled={busy} onClick={() => setConfirm(false)}>Periksa kembali</Button><Button disabled={busy} onClick={() => persist(true)}>{busy ? 'Menyimpan…' : 'Simpan Pemeriksaan'}</Button></div></Dialog>
    <Dialog open={blocker.state === 'blocked'} onOpenChange={open => { if (!open && blocker.state === 'blocked') blocker.reset() }} title="Tinggalkan checklist belum tersimpan?" description="Simpan draft checklist untuk mempertahankan pilihan dan komentar."><div className="dialog-actions"><Button variant="outline" onClick={() => blocker.state === 'blocked' && blocker.reset()}>Tetap memeriksa</Button><Button variant="destructive" disabled={busy} onClick={() => blocker.state === 'blocked' && blocker.proceed()}>Tinggalkan perubahan</Button></div></Dialog>
  </div>
}
