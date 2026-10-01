import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, flexRender, type ColumnDef, type SortingState } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Download, RotateCcw, Eye, SlidersHorizontal } from 'lucide-react'
import { Button } from '../../components/ui/button.tsx'
import { EmptyState, Field, StatusBadge } from '../../components/shared.tsx'
import { dateLabel } from '../../lib/utils.ts'
import { filterActivities } from './rules.ts'
import { exportActivities } from './service.ts'
import { emptyFilters, statusLabels, statuses, domainLabels, type Activity, type ActivityFilters, type ActivityStatus, type Domain } from './model.ts'
import { useApp, useUser } from '../../app/context.ts'

export function ActivityTable({ activities, domain = '', compact = false, title = 'Daftar pengajuan', initialStatus = '' }: { activities: Activity[]; domain?: Domain | ''; compact?: boolean; title?: string; initialStatus?: ActivityStatus | '' }) {
  const navigate = useNavigate()
  const user = useUser()
  const { notify } = useApp()
  const initial: ActivityFilters = { ...emptyFilters, domain, status: initialStatus }
  const [inputs, setInputs] = useState(initial)
  const [filters, setFilters] = useState(initial)
  const [advanced, setAdvanced] = useState(!compact)
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }])
  const filtered = useMemo(() => filterActivities(activities, filters), [activities, filters])
  const columns = useMemo<ColumnDef<Activity>[]>(() => [
    { id: 'title', accessorKey: 'title', header: 'Judul kegiatan', cell: ({ row }) => <div className="table-title"><Link to={`/activities/${row.original.id}`}>{row.original.title}</Link><span>{row.original.code}{!domain && <> · {domainLabels[row.original.domain]}</>}</span>{user.role !== 'DOSEN' && <span>Ketua: {row.original.ownerName}</span>}</div> },
    { id: 'scheme', accessorKey: 'scheme', header: 'Skema', cell: ({ row }) => <div className="table-scheme"><span>{row.original.scheme}</span><small>{row.original.fundingSource === 'INTERNAL' ? 'Pendanaan internal' : row.original.fundingSource === 'GOVERNMENT' ? 'Pendanaan pemerintah' : 'Pendanaan industri'}</small></div> },
    { id: 'year', accessorKey: 'year', header: 'Tahun' },
    { id: 'date', accessorFn: row => row.submittedAt ?? row.updatedAt, header: 'Tanggal pengajuan', cell: ({ row }) => <span className={row.original.submittedAt ? '' : 'muted'}>{dateLabel(row.original.submittedAt)}</span> },
    { id: 'status', accessorFn: row => statusLabels[row.status], header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { id: 'actions', header: 'Aksi', enableSorting: false, cell: ({ row }) => <Button variant="ghost" size="icon" asChild><Link to={`/activities/${row.original.id}`} aria-label={`Lihat detail ${row.original.title}`}><Eye size={18} /></Link></Button> },
  ], [domain, user.role])
  const table = useReactTable({ data: filtered, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getPaginationRowModel: getPaginationRowModel(), initialState: { pagination: { pageSize: compact ? 5 : 10 } } })
  const { pageIndex, pageSize } = table.getState().pagination
  const visibleCount = table.getRowModel().rows.length
  const schemes = [...new Set(activities.filter(item => !domain || item.domain === domain).map(item => item.scheme))]
  const programs = [...new Set(activities.map(item => item.studyProgram))]
  const canExport = ['OPERATOR', 'LPPM', 'ADMIN'].includes(user.role)
  function apply(event?: FormEvent) { event?.preventDefault(); setFilters(inputs); table.setPageIndex(0) }
  function setStatus(status: ActivityStatus | '') { setInputs(old => ({ ...old, status })); setFilters(old => ({ ...old, status })); table.setPageIndex(0) }
  function reset() { const next = { ...emptyFilters, domain }; setInputs(next); setFilters(next); table.setPageIndex(0) }
  return <section className="surface activity-table-panel" aria-label={title}>
    <div className="section-heading"><div><h2>{title}</h2><p>{filtered.length} pengajuan{domain ? ` ${domainLabels[domain].toLocaleLowerCase('id-ID')}` : ''} dari data simulasi</p></div>{canExport && <Button variant="outline" onClick={() => { exportActivities(table.getSortedRowModel().rows.map(row => row.original)); notify(`${filtered.length} pengajuan sesuai filter diekspor sebagai CSV simulasi.`) }} disabled={!filtered.length}><Download size={16} />Ekspor CSV</Button>}</div>
    {compact && <div className="table-tabs" role="group" aria-label="Filter cepat status"><button className={!filters.status ? 'selected' : ''} aria-pressed={!filters.status} onClick={() => setStatus('')}>Semua pengajuan</button><button className={filters.status === 'UNDER_REVIEW' ? 'selected' : ''} aria-pressed={filters.status === 'UNDER_REVIEW'} onClick={() => setStatus('UNDER_REVIEW')}>Dalam review</button><button className={filters.status === 'REVISION_REQUIRED' ? 'selected' : ''} aria-pressed={filters.status === 'REVISION_REQUIRED'} onClick={() => setStatus('REVISION_REQUIRED')}>Perlu revisi</button><button className={filters.status === 'DRAFT' ? 'selected' : ''} aria-pressed={filters.status === 'DRAFT'} onClick={() => setStatus('DRAFT')}>Draft</button></div>}
    <form className={`table-filters ${advanced ? 'filters-expanded' : ''}`} onSubmit={apply}>
      <div className="search-row"><div className="search-control"><Search size={18} aria-hidden="true" /><label className="sr-only" htmlFor="activity-search">Cari judul, kode, atau ketua</label><input id="activity-search" placeholder="Cari judul, kode, atau ketua…" value={inputs.q} onChange={event => setInputs(old => ({ ...old, q: event.target.value }))} /></div><Button type="submit" variant={compact ? 'outline' : 'default'}>Cari</Button><Button type="button" variant="outline" aria-expanded={advanced} aria-controls="advanced-filters" onClick={() => setAdvanced(!advanced)}><SlidersHorizontal size={16} />Filter</Button></div>
      {advanced && <div className="advanced-filters" id="advanced-filters">
        <Field id="scheme-filter" label="Skema"><select id="scheme-filter" value={inputs.scheme} onChange={event => setInputs(old => ({ ...old, scheme: event.target.value }))}><option value="">Semua skema</option>{schemes.map(scheme => <option key={scheme}>{scheme}</option>)}</select></Field>
        <Field id="year-filter" label="Tahun"><select id="year-filter" value={inputs.year} onChange={event => setInputs(old => ({ ...old, year: event.target.value }))}><option value="">Semua tahun</option>{[...new Set([2026, ...activities.map(item => item.year)])].sort((a, b) => b - a).map(year => <option key={year}>{year}</option>)}</select></Field>
        <Field id="status-filter" label="Status"><select id="status-filter" value={inputs.status} onChange={event => setInputs(old => ({ ...old, status: event.target.value as ActivityStatus | '' }))}><option value="">Semua status</option>{statuses.map(status => <option key={status} value={status}>{statusLabels[status]}</option>)}</select></Field>
        {canExport && <Field id="program-filter" label="Program studi"><select id="program-filter" value={inputs.studyProgram} onChange={event => setInputs(old => ({ ...old, studyProgram: event.target.value }))}><option value="">Semua program studi</option>{programs.map(program => <option key={program}>{program}</option>)}</select></Field>}
        <Button type="button" variant="ghost" onClick={reset}><RotateCcw size={15} />Reset filter</Button>
      </div>}
      {!advanced && (filters.q || filters.status || filters.scheme) && <button className="text-link clear-filter" type="button" onClick={reset}>Hapus filter</button>}
    </form>
    <div className="table-scroll" role="region" aria-label="Tabel pengajuan, dapat digeser horizontal" tabIndex={0}>
      <table><caption className="sr-only">{title}, seluruh data merupakan simulasi</caption><thead>{table.getHeaderGroups().map(group => <tr key={group.id}><th className="number-cell" scope="col">No.</th>{group.headers.map(header => <th key={header.id} scope="col" aria-sort={header.column.getIsSorted() === 'asc' ? 'ascending' : header.column.getIsSorted() === 'desc' ? 'descending' : undefined}>{header.column.getCanSort() ? <button className="sort-button" onClick={header.column.getToggleSortingHandler()} aria-label={`Urutkan berdasarkan ${header.column.columnDef.header}`} type="button">{flexRender(header.column.columnDef.header, header.getContext())}{header.column.getIsSorted() === 'asc' ? <ArrowUp size={13} /> : header.column.getIsSorted() === 'desc' ? <ArrowDown size={13} /> : <ArrowUpDown size={13} />}</button> : flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead>
        <tbody>{table.getRowModel().rows.map((row, index) => <tr key={row.id} onClick={event => { if (!(event.target as HTMLElement).closest('a, button')) navigate(`/activities/${row.original.id}`) }}><td className="number-cell">{pageIndex * pageSize + index + 1}</td>{row.getVisibleCells().map(cell => <td key={cell.id} className={`column-${cell.column.id}`}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody>
      </table>
    </div>
    {!filtered.length && <EmptyState title="Tidak ada pengajuan yang sesuai" description="Coba kata kunci lain atau reset filter untuk menampilkan pengajuan." action={<Button variant="outline" onClick={reset}>Reset filter</Button>} />}
    <div className="pagination"><label>Tampilkan<select aria-label="Jumlah pengajuan per halaman" value={pageSize} onChange={event => table.setPageSize(Number(event.target.value))}>{[5, 10, 20].map(size => <option key={size}>{size}</option>)}</select><span>per halaman</span></label><span className="pagination-summary" aria-live="polite">{filtered.length ? pageIndex * pageSize + 1 : 0}–{pageIndex * pageSize + visibleCount} dari {filtered.length}</span><div className="pagination-buttons"><Button variant="ghost" size="icon" onClick={() => table.firstPage()} disabled={!table.getCanPreviousPage()} aria-label="Halaman pertama"><ChevronsLeft size={17} /></Button><Button variant="ghost" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Halaman sebelumnya"><ChevronLeft size={17} /></Button><span className="page-number" aria-label="Halaman aktif">{pageIndex + 1}</span><Button variant="ghost" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Halaman selanjutnya"><ChevronRight size={17} /></Button><Button variant="ghost" size="icon" onClick={() => table.lastPage()} disabled={!table.getCanNextPage()} aria-label="Halaman terakhir"><ChevronsRight size={17} /></Button></div></div>
  </section>
}
