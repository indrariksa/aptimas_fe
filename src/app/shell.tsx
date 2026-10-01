import { useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import { Bell, ChevronDown, ChevronRight, FlaskConical, Home, LogOut, Menu, Plus, Settings, X, ClipboardList, FolderOpen, HelpCircle } from 'lucide-react'
import { useApp, useUser, demoMode } from './context.ts'
import { roleLabels, roles, domainPaths, type Role } from '../modules/activities/model.ts'
import { actionFor, visibleActivities } from '../modules/activities/rules.ts'
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '../components/ui/dropdown-menu.tsx'
import { Button } from '../components/ui/button.tsx'
import { Dialog } from '../components/ui/dialog.tsx'

export function Brand({ compact = false }: { compact?: boolean }) {
  return <span className="brand"><span className="brand-word">APT<span>IMAS</span><span className="brand-period">.</span></span>{!compact && <span className="brand-caption">Portal Penelitian & Pengabdian</span>}</span>
}

export function ProtectedLayout() {
  const { user } = useApp()
  return user ? <Shell /> : <Navigate to="/login" replace />
}

function Shell() {
  const { activities, login, logout, notify, error, hasUnsavedChanges } = useApp()
  const user = useUser()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [seenIds, setSeenIds] = useState<string[]>([])
  const [sessionAction, setSessionAction] = useState<Role | 'logout' | null>(null)
  const actionable = visibleActivities(activities, user).filter(item => actionFor(item, user))
  const unread = actionable.filter(item => !seenIds.includes(`${user.id}:${item.id}`))
  const isDosen = user.role === 'DOSEN'
  const isReviewer = user.role === 'REVIEWER'
  const query = new URLSearchParams(location.search)
  const selectedView = query.get('view')
  const selectedDomain = query.get('domain')
  const detailDomain = activities.find(item => item.id === location.pathname.split('/')[2])?.domain
  const researchActive = selectedDomain === 'research' || location.pathname === '/activities/new/research' || detailDomain === 'RESEARCH'
  function switchRole(role: Role) { login(role); setMobileOpen(false); navigate('/dashboard'); notify(`Akun demo diubah menjadi ${roleLabels[role]}.`) }
  function changeSession(action: Role | 'logout') {
    if (hasUnsavedChanges) { setSessionAction(action); return }
    if (action === 'logout') { logout(); navigate('/login') } else switchRole(action)
  }
  const navClass = ({ isActive }: { isActive: boolean }) => `nav-item${isActive ? ' active' : ''}`
  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Lewati ke konten utama</a>
    <header className="header"><div className="container header-inner">
      <Link to="/dashboard" className="brand-link" aria-label="APTIMAS, beranda"><Brand /></Link>
      <div className="institution"><span className="institution-short">ULBI</span><span>Universitas Logistik<br />dan Bisnis Internasional</span></div>
      <div className="header-actions">
        <span className="demo-label">Data simulasi</span>
        <DropdownMenu trigger={<Button variant="ghost" size="icon" className="notification-button" aria-label={`Notifikasi, ${unread.length} belum dibaca`}><Bell size={21} />{unread.length > 0 && <span className="notification-count">{unread.length}</span>}</Button>}>
          <DropdownMenuLabel>Notifikasi simulasi</DropdownMenuLabel>
          {actionable.length ? actionable.slice(0, 4).map(item => <DropdownMenuItem key={item.id} onSelect={() => { setSeenIds(old => [...old, `${user.id}:${item.id}`]); navigate(`/activities/${item.id}`) }}><span className="notification-item"><strong>{actionFor(item, user)?.label}</strong><span>{item.title}</span></span></DropdownMenuItem>) : <DropdownMenuLabel>Tidak ada tindak lanjut baru.</DropdownMenuLabel>}
          {unread.length > 0 && <><DropdownMenuSeparator /><DropdownMenuItem onSelect={() => { setSeenIds(old => [...old, ...actionable.map(item => `${user.id}:${item.id}`)]); notify('Semua notifikasi ditandai sudah dibaca.') }}>Tandai semua sudah dibaca</DropdownMenuItem></>}
        </DropdownMenu>
        <DropdownMenu trigger={<button className="profile-button" aria-label={`Profil ${user.name}, ${roleLabels[user.role]}`}><span className="avatar">{user.initials}</span><span className="profile-copy"><strong>{user.name}</strong><span>{roleLabels[user.role]}</span></span><ChevronDown size={15} /></button>}>
          <DropdownMenuLabel>{user.name}<span className="dropdown-subtitle">Akun demonstrasi, {user.academicId}</span></DropdownMenuLabel>
          {demoMode && <><DropdownMenuSeparator /><DropdownMenuLabel>Ganti role demo</DropdownMenuLabel>{roles.map(role => <DropdownMenuItem key={role} onSelect={() => changeSession(role)}>{roleLabels[role]}{user.role === role && <span className="selected-role">Aktif</span>}</DropdownMenuItem>)}</>}
          <DropdownMenuSeparator /><DropdownMenuItem onSelect={() => changeSession('logout')}><LogOut size={16} />Keluar dari demo</DropdownMenuItem>
        </DropdownMenu>
      </div>
    </div></header>
    <div className="navigation"><div className="container">
      <button className="mobile-menu-button" aria-expanded={mobileOpen} aria-controls="primary-navigation" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}Menu<span>{location.pathname === '/dashboard' ? 'Dashboard' : 'Kegiatan'}</span></button>
      <nav id="primary-navigation" className={`nav-inner ${mobileOpen ? 'mobile-open' : ''}`} aria-label="Navigasi utama" onClick={event => { if ((event.target as HTMLElement).closest('a')) setMobileOpen(false) }}>
        <NavLink to="/dashboard" className={navClass}><Home size={17} />Dashboard</NavLink>
        {isDosen ? <>
          <DropdownMenu align="start" trigger={<button className={`nav-item ${researchActive ? 'active' : ''}`}><FlaskConical size={17} />Penelitian<ChevronDown size={14} /></button>}>
            <DropdownMenuItem onSelect={() => { setMobileOpen(false); navigate('/activities?domain=research') }}><FolderOpen size={16} />Daftar Penelitian</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { setMobileOpen(false); navigate('/activities/new/research') }}><Plus size={16} />Buat draft Penelitian</DropdownMenuItem>
          </DropdownMenu>
          <Link to={`/activities?domain=${domainPaths.COMMUNITY_SERVICE}`} className={`nav-item ${selectedDomain === 'community-service' || location.pathname.endsWith('/new/community-service') || detailDomain === 'COMMUNITY_SERVICE' ? 'active' : ''}`}>Pengabdian</Link>
          <Link to={`/activities?domain=${domainPaths.INNOVATION}`} className={`nav-item ${selectedDomain === 'innovation' || location.pathname.endsWith('/new/innovation') || detailDomain === 'INNOVATION' ? 'active' : ''}`}>Inovasi</Link>
          <DropdownMenu align="start" trigger={<button className={`nav-item ${location.pathname.startsWith('/incentives') ? 'active' : ''}`}>Insentif Kepakaran<ChevronDown size={14} /></button>}><DropdownMenuItem onSelect={() => { setMobileOpen(false); navigate('/incentives') }}>Daftar Klaim</DropdownMenuItem><DropdownMenuItem onSelect={() => { setMobileOpen(false); navigate('/incentives/new') }}>Ajukan Klaim Baru</DropdownMenuItem><DropdownMenuItem onSelect={() => { setMobileOpen(false); navigate('/incentives?view=history') }}>Riwayat Klaim</DropdownMenuItem></DropdownMenu>
          <span className="nav-future" title="Pencatatan karya tersedia pada Fase 4">Karya Cipta<small>Fase 4</small></span>
        </> : <>
          <Link to={isReviewer ? '/activities?view=assignments' : '/activities'} className={`nav-item ${location.pathname.startsWith('/activities') && selectedView !== 'review-history' && selectedView !== 'recap' ? 'active' : ''}`}>{isReviewer ? <ClipboardList size={17} /> : <FolderOpen size={17} />}{isReviewer ? 'Penugasan Review' : 'Monitoring Kegiatan'}</Link>
          <Link to={isReviewer ? '/activities?view=review-history' : '/activities?view=recap'} className={`nav-item ${selectedView === (isReviewer ? 'review-history' : 'recap') ? 'active' : ''}`}>{isReviewer ? 'Riwayat Review' : 'Rekapitulasi'}</Link>
          {!isReviewer && <Link to="/incentives" className={`nav-item ${location.pathname.startsWith('/incentives') ? 'active' : ''}`}>Insentif & Rekap</Link>}
          {!isReviewer && <span className="nav-future">Persetujuan<small>Menunggu SOP</small></span>}
          {user.role === 'ADMIN' && <NavLink to="/configuration" className={navClass}><Settings size={17} />Konfigurasi Demo</NavLink>}
          {isReviewer && <Link to="/incentives" className={`nav-item ${location.pathname.startsWith('/incentives') ? 'active' : ''}`}>Review Insentif</Link>}
        </>}
        {isDosen && <Link to="/activities?view=history" className={`nav-item ${selectedView === 'history' ? 'active' : ''}`}>Riwayat Pengajuan</Link>}
        <button className="nav-help" onClick={() => { setMobileOpen(false); setHelpOpen(true) }} aria-label="Bantuan penggunaan demo"><HelpCircle size={18} /><span>Bantuan</span></button>
      </nav>
    </div></div>
    <main id="main-content" className="container main-content" tabIndex={-1} key={user.id}><Outlet /></main>
    <footer className="footer"><div className="container footer-inner"><span>© 2026 APTIMAS <span className="footer-separator">/</span> LPPM ULBI</span><span>Portal Penelitian, Pengabdian & Inovasi<span className="footer-demo">Frontend demo</span></span></div></footer>
    <Dialog open={helpOpen} onOpenChange={setHelpOpen} title="Menggunakan demo APTIMAS" description="Semua akun, pengajuan, jadwal, dan angka pada aplikasi ini merupakan data simulasi.">
      <ol className="help-list"><li>Gunakan menu profil untuk memilih role demo.</li><li>Cari dan filter pengajuan. Klik judul untuk membuka detail.</li><li>Akun Dosen dapat mengisi tujuh langkah pengajuan Penelitian, PKM, dan Inovasi. Simpan draft sebelum berpindah halaman.</li><li>Proposal, laporan, dan bukti luaran tersimpan lokal. Sepuluh formulir Insentif dan checklist reviewer tersedia lokal. Tarif/approval menunggu SK/SOP; review kegiatan dan Karya Cipta tersedia pada Fase 4.</li></ol>
      <p className="notice-text">Tidak ada pengiriman ke BIMA, Hiliriset, atau server lain. Login ini merupakan simulasi, bukan autentikasi produksi.</p>
      {error && <p className="field-error">{error}</p>}
      <Button onClick={() => setHelpOpen(false)}>Mengerti<ChevronRight size={16} /></Button>
    </Dialog>
    <Dialog open={!!sessionAction} onOpenChange={open => { if (!open) setSessionAction(null) }} title="Tutup formulir yang belum disimpan?" description="Simpan draft terlebih dahulu jika ada perubahan yang ingin dipertahankan. Perubahan yang belum disimpan akan hilang ketika akun diganti atau sesi ditutup."><div className="dialog-actions"><Button variant="outline" onClick={() => setSessionAction(null)}>Kembali ke formulir</Button><Button variant="destructive" onClick={() => { const action = sessionAction; setSessionAction(null); if (action === 'logout') { logout(); navigate('/login') } else if (action) switchRole(action) }}>Lanjutkan tanpa menyimpan</Button></div></Dialog>
  </div>
}
