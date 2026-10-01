import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { ArrowRight, Info, FlaskConical, Users, FolderOpen } from 'lucide-react'
import { Brand } from '../app/shell.tsx'
import { useApp, demoMode } from '../app/context.ts'
import { roles, roleLabels, type Role } from '../modules/activities/model.ts'
import { demoUsers } from '../modules/activities/data.ts'
import { Field } from '../components/shared.tsx'
import { Button } from '../components/ui/button.tsx'

export function Login() {
  const { user, login } = useApp()
  const [role, setRole] = useState<Role>('DOSEN')
  const navigate = useNavigate()
  if (user) return <Navigate to="/dashboard" replace />
  const account = demoUsers[role]
  return <main className="login-page"><section className="login-introduction"><Brand /><div className="login-message"><span className="login-institution">Universitas Logistik dan Bisnis Internasional</span><h1>Satu tempat untuk<br />aktivitas akademik.</h1><p>Kelola penelitian, pengabdian, dan inovasi. Dari pengajuan kegiatan hingga pencatatan luaran.</p><ul><li><FlaskConical size={20} />Penelitian & Inovasi</li><li><Users size={20} />Pengabdian kepada Masyarakat</li><li><FolderOpen size={20} />Arsip Capaian Akademik</li></ul></div><span className="login-footer">APTIMAS · LPPM ULBI · 2026</span></section><section className="login-form-area"><div className="login-form-card"><span className="login-version">Frontend demo / Fase 3</span><h2>Masuk ke APTIMAS</h2><p>Pilih akun simulasi untuk mencoba portal akademik.</p><form onSubmit={event => { event.preventDefault(); login(role); navigate('/dashboard') }}>
    {demoMode && <Field id="demo-role" label="Peran akun demo"><select id="demo-role" value={role} onChange={event => setRole(event.target.value as Role)}>{roles.map(item => <option key={item} value={item}>{roleLabels[item]}</option>)}</select></Field>}
    <div className="demo-account"><span className="avatar">{account.initials}</span><div><strong>{account.name}</strong><span>{roleLabels[role]} · {account.studyProgram}</span></div></div><Button type="submit" className="login-submit">Masuk sebagai {roleLabels[role]}<ArrowRight size={17} /></Button></form><div className="login-note"><Info size={18} /><p>Login tanpa kata sandi untuk demonstrasi. Seluruh data adalah simulasi dan tidak dikirim ke server.</p></div></div><p className="login-bottom-note">Penelitian, Pengabdian kepada Masyarakat & Inovasi</p></section></main>
}
