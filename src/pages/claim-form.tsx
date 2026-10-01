import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useBeforeUnload, useBlocker, useNavigate, useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { ArrowLeft, ArrowRight, Check, Save, Send } from 'lucide-react'
import { useApp, useUser } from '../app/context.ts'
import { Button } from '../components/ui/button.tsx'
import { Dialog } from '../components/ui/dialog.tsx'
import { EmptyState, Field, LoadingState, PageHeading } from '../components/shared.tsx'
import { ClaimField, ClaimPreview } from '../modules/incentives/fields.tsx'
import { canEditClaim, claimIssues, claimWindowOpen, fieldVisible } from '../modules/incentives/rules.ts'
import { claimValuesSchema, incentivePeriods, initialClaimValues, templateFor, templates, unavailableCategories, type Claim, type ClaimValues } from '../modules/incentives/model.ts'
import { mockClaimRepository } from '../modules/incentives/repository.ts'
import { ClaimDataError } from './claims.tsx'

export function ClaimFormPage() {
  const user = useUser(), { id } = useParams(), { claims, claimsError, claimsLoading } = useApp(), [category, setCategory] = useState('')
  const claim = claims.find(item => item.id === id)
  if (user.role !== 'DOSEN') return <Navigate to="/incentives" replace />
  if (claimsLoading && !claims.length) return <LoadingState />
  if (claimsError) return <ClaimDataError />
  if (id && (!claim || !canEditClaim(claim, user) || !templateFor(claim.categoryCode))) return <EmptyState title="Klaim tidak dapat diubah" description="Pilih draft atau klaim milik sendiri yang meminta revisi." action={<Button asChild><Link to="/incentives">Kembali ke daftar</Link></Button>} />
  if (!claim && !category) return <><PageHeading title="Pengajuan Insentif Kepakaran" description="Pilih formulir yang sesuai karya Anda. Label dan pilihan bersumber dari Kepakaran 2026." /><section className="surface claim-category-picker"><h2>Sepuluh Formulir Kepakaran</h2><p className="muted">Semua template masih menunggu validasi SK/SOP. Form yang berbeda tidak disamakan.</p><div className="claim-category-list">{templates.map((template, index) => <button key={template.code} onClick={() => setCategory(template.code)}><span className="step-number">{index + 1}</span><span><strong>{template.label}</strong><small>Sumber: {template.sourceSheet}</small></span><ArrowRight size={18} /></button>)}</div><h3>Kategori yang menunggu template</h3><ul className="claim-unavailable-categories">{unavailableCategories.map(label => <li key={label}>{label}<span className="status-badge status-neutral">Belum ada template</span></li>)}</ul><Button asChild variant="outline"><Link to="/incentives"><ArrowLeft size={16} />Kembali ke daftar</Link></Button></section></>
  return <ClaimForm key={claim?.id ?? category} claim={claim} category={claim?.categoryCode ?? category} changeCategory={claim ? undefined : () => setCategory('')} />
}
function ClaimForm({ claim, category, changeCategory }: { claim?: Claim; category: string; changeCategory?: () => void }) {
  const user = useUser(), { notify, reloadClaims, setUnsavedChanges } = useApp(), navigate = useNavigate(), template = templateFor(category)!
  const form = useForm<ClaimValues>({ defaultValues: claim?.values ?? initialClaimValues(category, user) })
  const { watch, getValues, reset, setValue, formState: { isDirty } } = form, values = watch()
  const [preview, setPreview] = useState(false), [id, setId] = useState(claim?.id), [version, setVersion] = useState(claim?.version), [error, setError] = useState(''), [issues, setIssues] = useState<ReturnType<typeof claimIssues>>([]), [busy, setBusy] = useState(false), [uploading, setUploading] = useState(false), [confirm, setConfirm] = useState(false), [discardCategory, setDiscardCategory] = useState(false), [declared, setDeclared] = useState(false), [savedAt, setSavedAt] = useState(claim?.updatedAt ?? '')
  const leaving = useRef(false), heading = useRef<HTMLHeadingElement>(null)
  const identity = { id: user.id, name: user.name, academicId: user.academicId, studyProgram: user.studyProgram }
  const supplementalYear = !template.fields.some(field => ['publication_year', 'issue_details'].includes(field.key))
  const fields = template.fields.filter(field => field.actor === 'APPLICANT' && fieldVisible(field, values))
  useEffect(() => { setUnsavedChanges(isDirty || uploading); return () => setUnsavedChanges(false) }, [isDirty, uploading, setUnsavedChanges])
  useBeforeUnload(useCallback(event => { if ((isDirty || uploading) && !leaving.current) { event.preventDefault(); event.returnValue = '' } }, [isDirty, uploading]))
  const blocker = useBlocker(({ currentLocation, nextLocation }) => (isDirty || uploading) && !leaving.current && currentLocation.pathname !== nextLocation.pathname)
  function togglePreview(next: boolean) { setPreview(next); setError(''); requestAnimationFrame(() => heading.current?.focus()) }
  async function persist(submit: boolean) {
    if (busy || uploading) return
    setError('')
    const parsed = claimValuesSchema.safeParse(getValues())
    if (!parsed.success) { setError(parsed.error.issues[0].message); return }
    const validation = claimIssues(parsed.data, user, submit); setIssues(validation)
    if (validation.length) { setConfirm(false); setPreview(false); requestAnimationFrame(() => document.getElementById(`claim-field-${validation[0].key}`)?.focus()); return }
    setBusy(true)
    try {
      const result = submit ? await mockClaimRepository.submit(parsed.data, user, id, version) : await mockClaimRepository.saveDraft(parsed.data, user, id, version)
      setId(result.id); setVersion(result.version); setSavedAt(result.updatedAt); reset(parsed.data); setIssues([])
      notify(submit ? 'Klaim simulasi tersimpan. Nominal dan keputusan tetap menunggu SK/SOP.' : 'Draft klaim dan daftar bukti tersimpan lokal.')
      if (submit) { leaving.current = true; setConfirm(false); navigate(`/incentives/${result.id}`) }
      await reloadClaims()
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Klaim belum tersimpan. Isian tetap tersedia.'); setConfirm(false) }
    finally { setBusy(false) }
  }
  const errorFor = (key: string) => issues.find(issue => issue.key === key)?.message
  return <><PageHeading title={`${claim?.status === 'REVISION_REQUIRED' ? 'Revisi Klaim' : id ? 'Lanjutkan Draft' : 'Klaim Baru'} · ${template.label}`} description="Identitas otomatis, isian sesuai sumber, dan bukti lokal. Simpan draft sebelum berpindah halaman." trail="Insentif Kepakaran / Formulir" />{claim?.note && <div className="revision-note"><p>{claim.note}</p></div>}
    <section className="surface draft-form claim-form-panel"><nav className="claim-form-navigation" aria-label="Bagian formulir"><button className={!preview ? 'selected' : ''} aria-pressed={!preview} disabled={busy || uploading} onClick={() => togglePreview(false)}><span className="step-number">1</span>Formulir</button><button className={preview ? 'selected' : ''} aria-pressed={preview} disabled={busy || uploading} onClick={() => togglePreview(true)}><span className="step-number">2</span>Pratinjau</button><span>Menunggu Konfigurasi SK</span></nav><div className="section-heading"><div><h2 ref={heading} tabIndex={-1}>{preview ? 'Pratinjau Klaim' : template.label}</h2><p>Sumber: {template.sourceSheet} · periode {template.effectiveYear}</p></div>{changeCategory && !id && <Button variant="outline" disabled={busy || uploading} onClick={() => { if (isDirty) setDiscardCategory(true); else changeCategory() }}>Ganti Kategori</Button>}</div>
      <form className="draft-fields" noValidate onSubmit={event => { event.preventDefault(); if (!preview) togglePreview(true); else if (!declared) setError('Konfirmasikan bahwa karya dan bukti sudah diperiksa.'); else { const validation = claimIssues(getValues(), user, true); setIssues(validation); if (validation.length) setPreview(false); else setConfirm(true) } }}><fieldset className="wizard-fieldset" disabled={busy || uploading}>
        <p className="info-notice">Petunjuk seperti minimal 125 halaman, Impact Factor 0,10, SINTA 1–6, dan LOA berasal dari sumber. Ketentuan wajib, kelayakan, nominal, serta keputusan final menunggu SK/SOP; isian opsional tidak dibuat wajib secara global.</p>
        {!preview ? <><section className="form-section"><h3>Identitas Pengusul</h3><div className="form-grid">{template.fields.filter(field => field.actor === 'SYSTEM_PROFILE').map(field => <Field id={`identity-${field.key}`} label={field.sourceLabel} key={field.fieldId}><input id={`identity-${field.key}`} readOnly value={field.key === 'applicant_name_with_title' ? user.name : field.key === 'applicant_academic_identifier' ? user.academicId : user.studyProgram} /></Field>)}<Field id="claim-period" label="Periode klaim"><select id="claim-period" disabled={!!id} value={values.periodId} onChange={event => setValue('periodId', event.target.value, { shouldDirty: true })}>{incentivePeriods.map(period => <option key={period.id} value={period.id}>{period.label}</option>)}</select></Field></div></section><section className="form-section"><h3>Isian Karya / Kepakaran</h3>{fields.map(field => <ClaimField key={field.fieldId} field={field} value={values.answers[field.key]} error={errorFor(field.key)} onBusy={setUploading} onChange={answer => setValue(`answers.${field.key}`, answer, { shouldDirty: true })} />)}{supplementalYear && <Field id="claim-field-outputYear" label="Tahun luaran (metadata klaim)" required error={errorFor('outputYear')} hint="Metadata tambahan untuk periode klaim; template sumber kategori ini tidak memiliki kolom tahun."><input id="claim-field-outputYear" type="number" value={values.outputYear} onChange={event => setValue('outputYear', event.target.value, { shouldDirty: true })} /></Field>}{!supplementalYear && errorFor('outputYear') && <p role="alert" className="field-error">{errorFor('outputYear')} Isi Tahun Terbit atau Tahun pada Terbitan di atas.</p>}</section></> : <><ClaimPreview values={values} identity={identity} /><label className="checkbox-field"><input type="checkbox" checked={declared} onChange={event => setDeclared(event.target.checked)} />Saya telah memeriksa karya dan bukti pada klaim simulasi ini.</label></>}
        {issues.length > 0 && <div className="form-error" role="alert">Periksa {issues.length} isian yang ditandai. {preview && issues.map(issue => issue.message).join(' ')}</div>}{error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-actions"><Button type="button" variant="outline" onClick={() => preview ? togglePreview(false) : navigate(id ? `/incentives/${id}` : '/incentives')}><ArrowLeft size={16} />{preview ? 'Kembali ke Formulir' : 'Kembali'}</Button><Button type="button" variant="outline" onClick={() => persist(false)}><Save size={16} />{busy ? 'Menyimpan…' : 'Simpan Draft'}</Button><Button type="submit" disabled={preview && !claimWindowOpen(values.periodId)}>{preview ? <Send size={16} /> : <Check size={16} />}{preview ? 'Ajukan Simulasi' : 'Pratinjau'}</Button></div><p className="wizard-save-state" role="status">{isDirty ? 'Ada perubahan belum disimpan.' : savedAt ? `Tersimpan ${new Date(savedAt).toLocaleString('id-ID')}.` : 'Draft belum disimpan.'} {!claimWindowOpen(values.periodId) && 'Window pengajuan ditutup; draft tetap dapat disimpan.'}</p>
      </fieldset></form>
    </section>
    <Dialog open={confirm} onOpenChange={open => { if (!busy) setConfirm(open) }} title="Ajukan klaim simulasi?" description="Salinan isian, identitas, dan berkas disimpan sebagai versi pengajuan lokal. Pengajuan LOA tetap menunggu kebijakan; belum ada keputusan atau pencairan."><div className="dialog-actions"><Button variant="outline" disabled={busy} onClick={() => setConfirm(false)}>Periksa kembali</Button><Button disabled={busy} onClick={() => persist(true)}>{busy ? 'Menyimpan…' : 'Ya, ajukan simulasi'}</Button></div></Dialog>
    <Dialog open={discardCategory} onOpenChange={setDiscardCategory} title="Ganti kategori dan buang isian?" description="Isian yang belum disimpan tidak dipindahkan ke kategori lain karena template berbeda."><div className="dialog-actions"><Button variant="outline" onClick={() => setDiscardCategory(false)}>Lanjutkan isian</Button><Button variant="destructive" onClick={changeCategory}>Buang isian & ganti kategori</Button></div></Dialog>
    <Dialog open={blocker.state === 'blocked'} onOpenChange={open => { if (!open && blocker.state === 'blocked') blocker.reset() }} title="Tinggalkan klaim yang belum disimpan?" description="Simpan draft untuk mempertahankan jawaban dan daftar bukti."><div className="dialog-actions"><Button variant="outline" onClick={() => blocker.state === 'blocked' && blocker.reset()}>Tetap di formulir</Button><Button variant="destructive" disabled={busy || uploading} onClick={() => blocker.state === 'blocked' && blocker.proceed()}>Tinggalkan perubahan</Button></div></Dialog>
  </>
}
