import { z } from 'zod'
import { fileSchema, type DemoUser } from '../activities/model.ts'
import { mockActivityRepository } from '../activities/repository.ts'
import { ensureFiles } from '../activities/files.ts'
import { httpsUrl } from '../incentives/rules.ts'
import { requireAccount } from '../configuration/store.ts'

export const workCategories = ['Produk Barang', 'Produk Jasa', 'Produk Teknologi', 'Buku Chapter', 'Buku Populer', 'Karya Seni'] as const
export const workValuesSchema = z.object({ category: z.enum(workCategories), title: z.string().trim().min(3, 'Judul minimal tiga karakter.').max(500), description: z.string().trim().min(10, 'Deskripsi minimal sepuluh karakter.').max(10000), availableOn: z.iso.date({ error: 'Isi tanggal karya tersedia.' }), contributors: z.array(z.object({ name: z.string().trim().min(1), role: z.string().trim().min(1), affiliation: z.string().max(200) })).max(30), producer: z.string().max(300), registration: z.string().max(200), url: z.string().max(2000).refine(url => !url || httpsUrl(url), 'Gunakan tautan HTTPS tanpa kredensial.'), linkedActivityId: z.string(), files: z.array(fileSchema).min(1, 'Unggah minimal satu bukti karya.').max(10) }).strict()
export type WorkValues = z.infer<typeof workValuesSchema>
export const workSchema = z.object({ id: z.string(), code: z.string(), ownerId: z.string(), ownerName: z.string(), studyProgram: z.string(), status: z.literal('RECORDED'), values: workValuesSchema, version: z.number().int().positive(), createdAt: z.string().datetime(), updatedAt: z.string().datetime(), deletedAt: z.string().datetime().nullable(), snapshots: z.array(z.object({ at: z.string().datetime(), actor: z.string(), values: workValuesSchema })), history: z.array(z.object({ at: z.string().datetime(), actor: z.string(), description: z.string() })) })
export type CreativeWork = z.infer<typeof workSchema>
export interface WorkRepository { list(user: DemoUser): Promise<CreativeWork[]>; save(input: WorkValues, user: DemoUser, id?: string, expected?: number): Promise<CreativeWork>; archive(id: string, user: DemoUser, expected: number, restore?: boolean): Promise<CreativeWork> }
export const WORK_KEY = 'aptimas.demo.creative-works.v1'
function read() {
  const stored = localStorage.getItem(WORK_KEY)
  try { return stored ? z.array(workSchema).parse(JSON.parse(stored)) : [] }
  catch { throw new Error('Arsip karya lokal tidak dapat dibaca. Catatan tetap dipertahankan; periksa penyimpanan browser sebelum mengubah data.') }
}
function write(items: CreativeWork[], entry: CreativeWork) {
  try { localStorage.setItem(WORK_KEY, JSON.stringify([...items.filter(item => item.id !== entry.id), workSchema.parse(entry)])) }
  catch { throw new Error('Karya belum tersimpan. Penyimpanan browser penuh atau tidak tersedia.') }
  return entry
}
export function visibleWorks(items: CreativeWork[], user: DemoUser) { return user.role === 'REVIEWER' ? [] : items.filter(work => (user.role !== 'DOSEN' || work.ownerId === user.id) && (!work.deletedAt || user.role === 'ADMIN')) }
export const mockWorkRepository: WorkRepository = {
  async list(user) { return visibleWorks(read(), user) },
  async save(input, user, id, expected) {
    requireAccount(user)
    if (user.role !== 'DOSEN') throw new Error('Pencatatan karya hanya untuk Dosen pemilik.')
    const values = workValuesSchema.parse(input)
    if (values.url && !httpsUrl(values.url)) throw new Error('Tautan karya harus menggunakan HTTPS tanpa kredensial.')
    if (values.availableOn > new Date().toISOString().slice(0, 10)) throw new Error('Karya harus sudah tersedia; tanggal tidak boleh di masa depan.')
    if (values.files.some(file => file.purpose !== 'work')) throw new Error('Gunakan unggahan bukti karya yang sesuai.')
    await ensureFiles(values.files)
    const items = read(), previous = items.find(item => item.id === id)
    if (id && (!previous || previous.ownerId !== user.id || previous.deletedAt)) throw new Error('Karya tidak dapat diubah oleh akun aktif.')
    if (previous && previous.version !== expected) throw new Error('Karya berubah di tab lain. Muat ulang sebelum menyimpan.')
    if (values.linkedActivityId && !(await mockActivityRepository.list()).some(activity => activity.id === values.linkedActivityId && activity.ownerId === user.id)) throw new Error('Pilih kegiatan milik Anda untuk relasi luaran.')
    if (items.some(item => !item.deletedAt && item.id !== id && item.ownerId === user.id && item.values.title.trim().toLowerCase() === values.title.toLowerCase() && item.values.availableOn === values.availableOn)) throw new Error('Judul dan tanggal karya ini sudah tercatat. Perbarui catatan yang tersedia.')
    const at = new Date().toISOString()
    return write(items, { id: previous?.id ?? crypto.randomUUID(), code: previous?.code ?? `KC-${values.availableOn.slice(0, 4)}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, ownerId: user.id, ownerName: user.name, studyProgram: user.studyProgram, status: 'RECORDED', values, version: (previous?.version ?? 0) + 1, createdAt: previous?.createdAt ?? at, updatedAt: at, deletedAt: null, snapshots: [...(previous?.snapshots ?? []), { at, actor: user.name, values: structuredClone(values) }], history: [...(previous?.history ?? []), { at, actor: user.name, description: previous ? 'Metadata karya diperbarui.' : 'Karya langsung tercatat tanpa persetujuan.' }] })
  },
  async archive(id, user, expected, restore = false) {
    requireAccount(user)
    const items = read(), previous = items.find(item => item.id === id)
    if (!previous || (restore ? user.role !== 'ADMIN' || !previous.deletedAt : user.role !== 'DOSEN' || previous.ownerId !== user.id || previous.deletedAt)) throw new Error('Aksi arsip tidak diizinkan untuk akun atau status ini.')
    if (previous.version !== expected) throw new Error('Karya berubah di tab lain. Muat ulang terlebih dahulu.')
    const at = new Date().toISOString()
    return write(items, { ...previous, version: previous.version + 1, updatedAt: at, deletedAt: restore ? null : at, history: [...previous.history, { at, actor: user.name, description: restore ? 'Administrator memulihkan catatan karya.' : 'Pemilik menghapus catatan secara logis; bukti dan versi tetap tersimpan.' }] })
  },
}
