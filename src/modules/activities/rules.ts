import type { Activity, ActivityFilters, ActivityReview, DemoUser } from './model.ts'

export function visibleActivities(activities: Activity[], user: DemoUser) {
  if (user.role === 'DOSEN') return activities.filter(activity => activity.ownerId === user.id)
  if (user.role === 'REVIEWER') return activities.filter(activity => activity.reviewerIds.includes(user.id) || activity.assignments.some(a => a.reviewerIds.includes(user.id)))
  return activities.filter(activity => activity.status !== 'DRAFT' || user.role === 'ADMIN')
}
export function canReadActivityStage(activity: Activity, user: DemoUser, stage: ActivityReview['stage'], version: number) {
  if (user.role !== 'REVIEWER') return true
  return activity.assignments.some(a => a.stage === stage && a.submissionVersion === version && a.reviewerIds.includes(user.id)) || (!activity.assignments.length && activity.reviewerIds.includes(user.id))
}

export function canEditDraft(activity: Activity, user: DemoUser) {
  return user.role === 'DOSEN' && activity.ownerId === user.id && ['DRAFT', 'NEEDS_CORRECTION', 'REVISION_REQUIRED'].includes(activity.status)
}

export function filterActivities(activities: Activity[], filters: ActivityFilters) {
  const q = filters.q.trim().toLocaleLowerCase('id-ID')
  return activities.filter(activity =>
    (!q || `${activity.title} ${activity.code} ${activity.ownerName}`.toLocaleLowerCase('id-ID').includes(q)) &&
    (!filters.domain || activity.domain === filters.domain) &&
    (!filters.year || String(activity.year) === filters.year) &&
    (!filters.scheme || activity.scheme === filters.scheme) &&
    (!filters.status || activity.status === filters.status) &&
    (!filters.studyProgram || activity.studyProgram === filters.studyProgram),
  )
}

export function activitySummary(activities: Activity[]) {
  return {
    total: activities.length,
    processing: activities.filter(activity => !['DRAFT', 'COMPLETED', 'REJECTED', 'WITHDRAWN', 'REVISION_REQUIRED', 'NEEDS_CORRECTION'].includes(activity.status)).length,
    correction: activities.filter(activity => ['REVISION_REQUIRED', 'NEEDS_CORRECTION'].includes(activity.status)).length,
    completed: activities.filter(activity => activity.status === 'COMPLETED').length,
  }
}

export function actionFor(activity: Activity, user: DemoUser): { label: string; description: string } | null {
  if (user.role === 'REVIEWER') return activity.reviewerIds.includes(user.id) && ['UNDER_REVIEW', 'PROGRESS_SUBMITTED', 'FINAL_SUBMITTED', 'OUTPUT_PENDING'].includes(activity.status) ? { label: 'Periksa penugasan', description: 'Pengajuan menunggu pemeriksaan reviewer.' } : null
  if (user.role === 'DOSEN') {
    if (['REVISION_REQUIRED', 'NEEDS_CORRECTION'].includes(activity.status)) return { label: 'Lihat catatan', description: activity.note }
    if (activity.status === 'DRAFT') return { label: 'Lanjutkan draft', description: 'Lengkapi tim, substansi, RAB, dan dokumen sebelum mengajukan.' }
    if (activity.status === 'OUTPUT_PENDING') return { label: 'Lihat target luaran', description: 'Luaran belum tercatat sebagai capaian.' }
  }
  if (['OPERATOR', 'LPPM', 'ADMIN'].includes(user.role) && ['ADMIN_CHECK', 'REVIEW_COMPLETED', 'NEEDS_CORRECTION'].includes(activity.status)) return { label: 'Lihat pengajuan', description: 'Periksa kelengkapan dan status kegiatan.' }
  return null
}

export function csvCell(value: unknown) {
  const text = String(value ?? '')
  const safe = /^\s*[=+@-]/.test(text) ? `'${text}` : text
  return `"${safe.replaceAll('"', '""')}"`
}
