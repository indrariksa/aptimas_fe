import { fileSchema, type LocalFile } from './model.ts'

const allowed: Record<string, string[]> = { pdf: ['application/pdf'], docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'], xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], jpg: ['image/jpeg'], jpeg: ['image/jpeg'], png: ['image/png'] }
export const FILE_LIMIT = 10 * 1024 * 1024
export const FILE_ACCEPT = '.pdf,.docx,.xlsx,.jpg,.jpeg,.png'
export function validateFile(file: Pick<File, 'name' | 'size' | 'type'>, purpose: string) {
  const extension = file.name.split('.').at(-1)?.toLowerCase() ?? ''
  if (!allowed[extension] || (file.type && !allowed[extension].includes(file.type))) throw new Error('Jenis berkas tidak sesuai. Pilih PDF, DOCX, XLSX, JPG, atau PNG.')
  if (['proposal', 'report'].includes(purpose) && extension !== 'pdf') throw new Error('Proposal dan laporan harus berupa PDF pada profil demo ini.')
  if (!file.size || file.size > FILE_LIMIT) throw new Error('Ukuran berkas harus lebih dari 0 dan maksimal 10 MB (batas simulasi).')
}
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('aptimas.local.files.v1', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('files')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('Penyimpanan berkas lokal tidak tersedia. Pertahankan formulir dan coba kembali.'))
    request.onblocked = () => reject(new Error('Penyimpanan berkas sedang digunakan tab lain. Tutup tab APTIMAS lain dan coba kembali.'))
  })
}
async function fileTransaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase()
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction('files', mode)
      const request = run(tx.objectStore('files'))
      tx.oncomplete = () => resolve(request.result)
      tx.onerror = tx.onabort = () => reject(new Error('Berkas belum tersimpan / terbaca. Penyimpanan browser mungkin penuh atau tidak tersedia.'))
    })
  } finally { db.close() }
}
export async function storeFile(file: File, purpose: string): Promise<LocalFile> {
  validateFile(file, purpose)
  const metadata = fileSchema.parse({ id: crypto.randomUUID(), name: file.name, size: file.size, type: file.type, purpose, uploadedAt: new Date().toISOString() })
  await fileTransaction('readwrite', store => store.put(file, metadata.id))
  return metadata
}
// ponytail: berkas yang dilepas tetap disimpan untuk versi lama; bersihkan menurut referensi semua versi jika kuota lokal menjadi kendala.
export async function ensureFiles(files: LocalFile[]) {
  for (const file of files) {
    const blob = await fileTransaction<Blob | undefined>('readonly', store => store.get(file.id))
    if (!(blob instanceof Blob) || blob.size !== file.size) throw new Error(`Berkas “${file.name}” tidak tersedia di browser ini. Unggah kembali sebelum mengajukan.`)
    validateFile(file, file.purpose)
  }
}
export async function downloadFile(file: LocalFile) {
  const blob = await fileTransaction<Blob | undefined>('readonly', store => store.get(file.id))
  if (!(blob instanceof Blob)) throw new Error('Berkas lokal tidak ditemukan. Berkas hanya tersedia pada browser yang digunakan untuk mengunggahnya.')
  const url = URL.createObjectURL(blob), link = document.createElement('a')
  link.href = url; link.download = file.name; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
