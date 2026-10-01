import { useState } from 'react'
import { useApp } from '../app/context.ts'
import { ErrorState } from '../components/shared.tsx'
import { Button } from '../components/ui/button.tsx'
import { Dialog } from '../components/ui/dialog.tsx'
import { mockActivityRepository } from '../modules/activities/repository.ts'

export function DataError() {
  const { error, reload, notify } = useApp()
  const [confirm, setConfirm] = useState(false)
  return <><ErrorState message={error} retry={() => { void reload() }} /><Button variant="outline" onClick={() => setConfirm(true)}>Pulihkan data demo</Button><Dialog open={confirm} onOpenChange={setConfirm} title="Pulihkan data simulasi?" description="Tindakan ini menghapus seluruh draft dan perubahan APTIMAS yang tersimpan pada browser ini, lalu mengembalikan contoh awal."><div className="dialog-actions"><Button variant="outline" onClick={() => setConfirm(false)}>Batal</Button><Button variant="destructive" onClick={async () => { try { await mockActivityRepository.reset(); setConfirm(false); await reload(); notify('Data demo dikembalikan ke contoh awal.') } catch { notify('Penyimpanan browser tidak tersedia. Pemulihan belum berhasil.') } }}>Hapus perubahan & pulihkan</Button></div></Dialog></>
}
