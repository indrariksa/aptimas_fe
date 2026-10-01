import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Plus } from 'lucide-react'
import { useApp, useUser } from '../app/context.ts'
import { Button } from '../components/ui/button.tsx'
import { Dialog } from '../components/ui/dialog.tsx'
import { ErrorState, LoadingState, PageHeading, EmptyState } from '../components/shared.tsx'
import { ClaimsTable } from '../modules/incentives/table.tsx'
import { visibleClaims } from '../modules/incentives/rules.ts'
import { mockClaimRepository } from '../modules/incentives/repository.ts'

export function ClaimDataError() {
  const { claimsError, reloadClaims, notify } = useApp(), [confirm, setConfirm] = useState(false)
  return <><ErrorState message={claimsError} retry={() => { void reloadClaims() }} /><Button variant="outline" onClick={() => setConfirm(true)}>Pulihkan contoh klaim insentif</Button><Dialog open={confirm} onOpenChange={setConfirm} title="Hapus perubahan klaim insentif?" description="Draft, review, dan riwayat klaim lokal akan dikembalikan ke contoh awal. Data kegiatan Penelitian/PKM/Inovasi tetap tersedia. Berkas lokal dipertahankan."><div className="dialog-actions"><Button variant="outline" onClick={() => setConfirm(false)}>Batal</Button><Button variant="destructive" onClick={async () => { try { await mockClaimRepository.reset(); setConfirm(false); await reloadClaims(); notify('Contoh klaim insentif dipulihkan.') } catch { notify('Pemulihan klaim belum berhasil. Penyimpanan browser tidak tersedia.') } }}>Hapus perubahan klaim</Button></div></Dialog></>
}
export function ClaimsPage() {
  const { claims, claimsLoading, claimsError } = useApp(), user = useUser(), [params] = useSearchParams()
  const recap = params.get('view') === 'recap', history = params.get('view') === 'history', monitor = ['OPERATOR', 'LPPM', 'ADMIN'].includes(user.role)
  if (recap && !monitor) return <EmptyState title="Rekap monitoring tidak tersedia" description="Akun ini dapat membuka daftar klaim dalam cakupannya." action={<Button asChild><Link to="/incentives">Daftar klaim</Link></Button>} />
  const scoped = visibleClaims(claims, user).filter(claim => !history || claim.status !== 'DRAFT')
  return <><PageHeading title={recap ? 'Rekap Insentif Kepakaran' : history ? 'Riwayat Klaim Insentif' : user.role === 'REVIEWER' ? 'Penugasan Review Insentif' : 'Insentif Kepakaran'} description={user.role === 'REVIEWER' ? 'Periksa klaim yang ditugaskan dengan checklist Ya/Tidak per butir. Keputusan final menunggu SOP.' : 'Satu karya untuk satu klaim. Sepuluh formulir mengikuti sumber Kepakaran 2026.'} action={user.role === 'DOSEN' ? <Button asChild><Link to="/incentives/new"><Plus size={18} />Ajukan Klaim Baru</Link></Button> : monitor ? <Button asChild variant="outline"><Link to={recap ? '/incentives' : '/incentives?view=recap'}>{recap ? 'Daftar Klaim' : 'Buka Rekap'}</Link></Button> : undefined} />
    <div className="info-notice"><strong>Menunggu Konfigurasi SK.</strong> Template masih berstatus draft untuk validasi. Nominal, kelayakan LOA, approval, dan batch tidak ditetapkan oleh contoh formulir ini.</div>
    {claimsLoading ? <LoadingState /> : claimsError ? <ClaimDataError /> : <ClaimsTable key={`${user.id}:${recap}:${history}`} claims={scoped} recap={recap} />}
  </>
}
