import { Link, useSearchParams } from 'react-router'
import { Plus } from 'lucide-react'
import { useApp, useUser } from '../app/context.ts'
import { Button } from '../components/ui/button.tsx'
import { LoadingState, PageHeading } from '../components/shared.tsx'
import { ActivityTable } from '../modules/activities/table.tsx'
import { domainPaths, domainLabels, type Domain } from '../modules/activities/model.ts'
import { visibleActivities } from '../modules/activities/rules.ts'
import { DataError } from './data-error.tsx'

export function ActivityList() {
  const { activities, loading, error } = useApp()
  const user = useUser()
  const [params] = useSearchParams()
  const domain = (Object.keys(domainPaths) as Domain[]).find(key => domainPaths[key] === params.get('domain')) ?? ''
  const view = params.get('view')
  let scoped = visibleActivities(activities, user)
  if (view === 'correction') scoped = scoped.filter(item => ['REVISION_REQUIRED', 'NEEDS_CORRECTION'].includes(item.status))
  if (view === 'completed') scoped = scoped.filter(item => item.status === 'COMPLETED')
  if (view === 'processing') scoped = scoped.filter(item => !['DRAFT', 'COMPLETED', 'REJECTED', 'WITHDRAWN', 'REVISION_REQUIRED', 'NEEDS_CORRECTION'].includes(item.status))
  if (view === 'review-history') scoped = scoped.filter(item => item.reviews.some(review => review.reviewerId === user.id) || (item.reviewerIds.includes(user.id) && ['REVIEW_COMPLETED', 'APPROVED', 'REJECTED', 'COMPLETED', 'REVISION_REQUIRED'].includes(item.status)))
  if (view === 'approvals') scoped = scoped.filter(item => ['REVIEW_COMPLETED', 'PROGRESS_SUBMITTED', 'FINAL_SUBMITTED', 'OUTPUT_PENDING', 'APPROVED'].includes(item.status))
  if (view === 'history') scoped = scoped.filter(item => item.status !== 'DRAFT')
  const title = domain ? domainLabels[domain] : view === 'approvals' ? 'Antrean Persetujuan' : view === 'recap' ? 'Rekapitulasi Kegiatan' : view === 'review-history' ? 'Riwayat Review' : view === 'history' ? 'Riwayat Pengajuan' : user.role === 'REVIEWER' ? 'Penugasan Review' : user.role === 'DOSEN' ? 'Seluruh Pengajuan' : 'Monitoring Kegiatan'
  return <><PageHeading title={title} description={user.role === 'REVIEWER' ? 'Pengajuan simulasi yang ditugaskan kepada Anda. Buka detail Pemeriksaan untuk mengisi rubrik SOP.' : 'Kelola dan pantau pengajuan kegiatan akademik berdasarkan skema, tahun, dan status.'} action={user.role === 'DOSEN' && <Button asChild><Link to={`/activities/new/${domainPaths[domain || 'RESEARCH']}`}><Plus size={18} />Tambah Pengajuan</Link></Button>} />
    {loading ? <LoadingState /> : error ? <DataError /> : <ActivityTable key={`${domain}:${view}:${user.id}`} activities={scoped} domain={domain} title={title} />}
  </>
}
