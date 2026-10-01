import { csvCell } from './rules.ts'
import { domainLabels, statusLabels, type Activity } from './model.ts'

export function exportActivities(activities: Activity[]) {
  const headers = ['Kode', 'Jenis kegiatan', 'Judul', 'Ketua', 'Program studi', 'Skema', 'Tahun', 'Status', 'Tanggal pengajuan', 'Sumber data']
  const rows = activities.map(item => [item.code, domainLabels[item.domain], item.title, item.ownerName, item.studyProgram, item.scheme, item.year, statusLabels[item.status], item.submittedAt?.slice(0, 10), 'DATA SIMULASI'])
  const csv = '\uFEFF' + [headers, ...rows].map(row => row.map(csvCell).join(';')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'APTIMAS-pengajuan-simulasi.csv'
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
