import { useState } from 'react'
import { Download, Trash2, Upload, FileText } from 'lucide-react'
import { Button } from '../../components/ui/button.tsx'
import { downloadFile, FILE_ACCEPT, storeFile } from './files.ts'
import type { LocalFile } from './model.ts'
import { documentLabels } from './profiles.ts'

export function FileList({ files, remove, disabled = false }: { files: LocalFile[]; remove?: (index: number) => void; disabled?: boolean }) {
  const [error, setError] = useState('')
  return <><ul className="document-list">{files.map((file, index) => <li key={file.id}><FileText size={20} /><div><strong>{file.name}</strong><span>{file.purpose.startsWith('claim:') ? 'Bukti klaim' : documentLabels[file.purpose] ?? file.purpose} · {(file.size / 1024 / 1024).toLocaleString('id-ID', { maximumFractionDigits: 2 })} MB · Lokal</span></div><Button type="button" size="icon" variant="ghost" aria-label={`Unduh ${file.name}`} onClick={async () => { try { await downloadFile(file); setError('') } catch (failure) { setError(failure instanceof Error ? failure.message : 'Berkas gagal diunduh.') } }}><Download size={18} /></Button>{remove && <Button type="button" size="icon" variant="ghost" disabled={disabled} aria-label={`Lepas ${file.name}`} onClick={() => remove(index)}><Trash2 size={18} /></Button>}</li>)}</ul>{error && <p className="field-error" role="alert">{error}</p>}</>
}
export function FileInput({ files, onChange, purpose, onBusy, label }: { files: LocalFile[]; onChange: (files: LocalFile[]) => void; purpose: string; onBusy?: (busy: boolean) => void; label?: string }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  return <div className="file-input"><label htmlFor={`upload-${purpose}`}><Upload size={20} /><strong>{busy ? 'Menyimpan berkas…' : `Unggah ${label ?? documentLabels[purpose]?.toLowerCase() ?? 'berkas'}`}</strong><span>PDF untuk proposal/laporan. Berkas lain: PDF, DOCX, XLSX, JPG, PNG. Maksimal 10 MB per berkas (simulasi).</span></label><input id={`upload-${purpose}`} type="file" accept={['proposal', 'report'].includes(purpose) ? '.pdf' : FILE_ACCEPT} disabled={busy || files.length >= (purpose.startsWith('claim:') || ['report', 'output'].includes(purpose) ? 10 : 30)} aria-describedby={`upload-${purpose}-note`} onChange={async event => {
    const input = event.currentTarget, file = input.files?.[0]
    if (!file) return
    setBusy(true); onBusy?.(true); setError('')
    try { const stored = await storeFile(file, purpose); onChange([...files, stored]); input.value = '' }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Berkas gagal disimpan.') }
    finally { input.value = ''; setBusy(false); onBusy?.(false) }
  }} /><p id={`upload-${purpose}-note`} className="field-hint">Berkas tersimpan di IndexedDB browser ini. Simpan draft untuk mempertahankan daftar lampirannya.</p>{error && <p className="field-error" role="alert">{error}</p>}<FileList files={files} disabled={busy} remove={index => onChange(files.filter((_, at) => at !== index))} /></div>
}
