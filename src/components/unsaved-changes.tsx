import { useCallback, useEffect } from 'react'
import { useBeforeUnload, useBlocker } from 'react-router'
import { useApp } from '../app/context.ts'
import { Button } from './ui/button.tsx'
import { Dialog } from './ui/dialog.tsx'

export function UnsavedChanges({ dirty, busy = false }: { dirty: boolean; busy?: boolean }) {
  const { setUnsavedChanges } = useApp()
  useEffect(() => { setUnsavedChanges(dirty || busy); return () => setUnsavedChanges(false) }, [dirty, busy, setUnsavedChanges])
  useBeforeUnload(useCallback(event => { if (dirty || busy) { event.preventDefault(); event.returnValue = '' } }, [dirty, busy]))
  const blocker = useBlocker(({ currentLocation, nextLocation }) => (dirty || busy) && currentLocation.pathname !== nextLocation.pathname)
  return <Dialog open={blocker.state === 'blocked'} onOpenChange={open => { if (!open && blocker.state === 'blocked') blocker.reset() }} title="Tinggalkan perubahan belum tersimpan?" description="Simpan formulir untuk mempertahankan isian dan daftar bukti lokal."><div className="dialog-actions"><Button variant="outline" onClick={() => blocker.state === 'blocked' && blocker.reset()}>Kembali ke formulir</Button><Button variant="destructive" disabled={busy} onClick={() => blocker.state === 'blocked' && blocker.proceed()}>Tinggalkan perubahan</Button></div></Dialog>
}
