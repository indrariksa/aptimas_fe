import { useState } from 'react'
import { Navigate } from 'react-router'
import { useApp, useUser } from '../app/context.ts'
import { Button } from '../components/ui/button.tsx'
import { Dialog } from '../components/ui/dialog.tsx'
import { PageHeading } from '../components/shared.tsx'
import { schemes } from '../modules/activities/data.ts'
import { domainLabels } from '../modules/activities/model.ts'
import { mockActivityRepository } from '../modules/activities/repository.ts'

export function Configuration() {
  const user = useUser()
  const { reload, notify } = useApp()
  const [confirm, setConfirm] = useState(false)
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return <><PageHeading title="Konfigurasi Demo" description="Informasi konfigurasi lokal. Pengelolaan master dan workflow lengkap tersedia pada Fase 4." /><section className="surface config-panel"><h2>Periode & Kebijakan</h2><dl className="metadata-grid"><div><dt>Periode aktif contoh</dt><dd>2026</dd></div><div><dt>Jadwal hibah internal simulasi</dt><dd>1 September sampai 31 Oktober 2026</dd></div><div><dt>Tarif insentif</dt><dd>Menunggu Konfigurasi SK</dd></div><div><dt>Persetujuan kegiatan</dt><dd>Nonaktif, menunggu SOP</dd></div><div><dt>Form Kepakaran referensi</dt><dd>10 template draft, belum dipublikasikan</dd></div><div><dt>Sumber data</dt><dd>Mock repository, localStorage & berkas lokal</dd></div></dl><h3>Skema pada Data Simulasi</h3><ul className="scheme-list">{schemes.map(scheme => <li key={scheme.id}><strong>{scheme.label}</strong><span>{domainLabels[scheme.domain]}</span></li>)}</ul><div className="form-section"><h3>Pulihkan data demo</h3><p>Hapus catatan draft dan perubahan lokal untuk kembali ke contoh awal. Berkas lokal tetap dipertahankan untuk referensi versi; seluruh data situs dapat dibersihkan melalui pengaturan browser.</p><Button variant="outline" onClick={() => setConfirm(true)}>Pulihkan contoh awal</Button></div></section><Dialog open={confirm} onOpenChange={setConfirm} title="Hapus perubahan data demo?" description="Seluruh draft yang dibuat dan perubahan lokal akan dihapus. Data contoh awal akan ditampilkan kembali."><div className="dialog-actions"><Button variant="outline" onClick={() => setConfirm(false)}>Batal</Button><Button variant="destructive" onClick={async () => { try { await mockActivityRepository.reset(); setConfirm(false); await reload(); notify('Contoh awal berhasil dipulihkan.') } catch { notify('Pemulihan gagal. Penyimpanan browser tidak tersedia.') } }}>Hapus & pulihkan</Button></div></Dialog></>
}
