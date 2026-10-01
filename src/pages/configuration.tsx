import { useState } from 'react'
import { Navigate } from 'react-router'
import { useApp, useUser } from '../app/context.ts'
import { Button } from '../components/ui/button.tsx'
import { Dialog } from '../components/ui/dialog.tsx'
import { PageHeading } from '../components/shared.tsx'
import { schemes } from '../modules/activities/data.ts'
import { domainLabels } from '../modules/activities/model.ts'
import { mockActivityRepository } from '../modules/activities/repository.ts'
import { mockClaimRepository } from '../modules/incentives/repository.ts'

export function Configuration() {
  const user = useUser()
  const { reload, reloadClaims, notify } = useApp()
  const [confirm, setConfirm] = useState(false)
  const [claimConfirm, setClaimConfirm] = useState(false)
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return <><PageHeading title="Konfigurasi Demo" description="Informasi konfigurasi lokal. Pengelolaan master dan workflow lengkap tersedia pada Fase 4." /><section className="surface config-panel"><h2>Periode & Kebijakan</h2><dl className="metadata-grid"><div><dt>Periode aktif contoh</dt><dd>2026</dd></div><div><dt>Jadwal hibah internal simulasi</dt><dd>1 September sampai 31 Oktober 2026</dd></div><div><dt>Tarif insentif</dt><dd>Menunggu Konfigurasi SK</dd></div><div><dt>Persetujuan kegiatan</dt><dd>Nonaktif, menunggu SOP</dd></div><div><dt>Form Kepakaran referensi</dt><dd>10 template draft, belum dipublikasikan</dd></div><div><dt>Sumber data</dt><dd>Mock repository, localStorage & berkas lokal</dd></div></dl><h3>Skema pada Data Simulasi</h3><ul className="scheme-list">{schemes.map(scheme => <li key={scheme.id}><strong>{scheme.label}</strong><span>{domainLabels[scheme.domain]}</span></li>)}</ul><div className="form-section"><h3>Pulihkan contoh kegiatan</h3><p>Hapus catatan draft dan perubahan lokal untuk kembali ke contoh awal. Berkas lokal tetap dipertahankan untuk referensi versi; seluruh data situs dapat dibersihkan melalui pengaturan browser.</p><Button variant="outline" onClick={() => setConfirm(true)}>Pulihkan contoh awal</Button></div><div className="form-section"><h3>Pulihkan contoh klaim insentif</h3><p>Kembalikan draft, checklist, dan riwayat klaim ke sepuluh contoh awal. Catatan kegiatan dan berkas lokal tetap dipertahankan.</p><Button variant="outline" onClick={() => setClaimConfirm(true)}>Pulihkan contoh klaim</Button></div></section><Dialog open={confirm} onOpenChange={setConfirm} title="Hapus perubahan data demo?" description="Draft dan perubahan kegiatan Penelitian/PKM/Inovasi akan dihapus. Klaim insentif tetap tersedia; data contoh kegiatan akan ditampilkan kembali."><div className="dialog-actions"><Button variant="outline" onClick={() => setConfirm(false)}>Batal</Button><Button variant="destructive" onClick={async () => { try { await mockActivityRepository.reset(); setConfirm(false); await reload(); notify('Contoh awal berhasil dipulihkan.') } catch { notify('Pemulihan gagal. Penyimpanan browser tidak tersedia.') } }}>Hapus & pulihkan</Button></div></Dialog><Dialog open={claimConfirm} onOpenChange={setClaimConfirm} title="Hapus perubahan klaim insentif?" description="Seluruh draft dan pemeriksaan klaim lokal akan dikembalikan ke contoh awal. Catatan kegiatan dan berkas lokal tetap tersedia."><div className="dialog-actions"><Button variant="outline" onClick={() => setClaimConfirm(false)}>Batal</Button><Button variant="destructive" onClick={async () => { try { await mockClaimRepository.reset(); setClaimConfirm(false); await reloadClaims(); notify('Contoh klaim insentif dipulihkan.') } catch { notify('Pemulihan klaim gagal. Penyimpanan browser tidak tersedia.') } }}>Hapus & pulihkan klaim</Button></div></Dialog></>
}
