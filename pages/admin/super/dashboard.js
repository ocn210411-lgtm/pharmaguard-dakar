import Head from 'next/head'
import { useState, useEffect } from 'react'
import { getSession } from '../../../lib/session'
import { getDB } from '../../../lib/db'

const CSS = `
:root{--primary:#00AEEF;--primary-dark:#0077b6;--primary-light:#e0f7ff;--success:#10b981;--warning:#f59e0b;--danger:#ef4444;--text:#1f2937;--text-light:#6b7280;--bg:#f0f9ff;--shadow:0 8px 24px rgba(0,174,239,.12);--radius:14px}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Poppins',sans-serif;background:var(--bg);color:var(--text);display:flex;min-height:100vh}
.sidebar{width:280px;background:linear-gradient(180deg,var(--primary),var(--primary-dark));color:white;padding:1.6rem;position:fixed;height:100%;z-index:900;display:flex;flex-direction:column;gap:.3rem;transition:.3s;overflow-y:auto}
.sidebar-brand{font-size:1.25rem;font-weight:800;display:flex;align-items:center;gap:.6rem;margin-bottom:1.2rem;padding-bottom:1rem;border-bottom:1px solid rgba(255,255,255,.2)}
.super-badge{background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:8px;padding:.25rem .6rem;font-size:.72rem;font-weight:700;margin-top:.25rem;display:inline-block}
.sidebar-prof{padding:1rem;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:12px;display:flex;align-items:center;gap:.85rem;margin-bottom:1.1rem}
.avatar-circle{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.25);border:2px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.3rem;color:white;flex-shrink:0}
.prof-name{font-size:.92rem;font-weight:700;line-height:1.3;word-break:break-word}
.prof-role{font-size:.74rem;opacity:.75;display:flex;align-items:center;gap:.3rem;margin-top:.15rem}
.nav-item{display:flex;align-items:center;gap:.75rem;padding:.8rem 1.1rem;border-radius:10px;color:rgba(255,255,255,.85);text-decoration:none;font-size:.93rem;font-weight:500;cursor:pointer;transition:.2s;border:none;background:none;width:100%;text-align:left}
.nav-item:hover{background:rgba(255,255,255,.18);color:white}
.nav-item.active{background:white;color:var(--primary-dark);font-weight:700}
.nav-item.danger{color:#fca5a5}
.sidebar-footer{margin-top:auto;display:flex;flex-direction:column;gap:.2rem;padding-top:.5rem}
.main{margin-left:280px;flex:1;padding:2rem;min-height:100vh}
.topbar{background:white;border-radius:var(--radius);padding:1.1rem 1.6rem;display:flex;align-items:center;justify-content:space-between;box-shadow:var(--shadow);margin-bottom:2rem}
.topbar-title{font-weight:700;font-size:1.25rem}
.burger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:.25rem}
.burger span{width:24px;height:3px;background:var(--primary);border-radius:2px;display:block}
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:800}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1.4rem;margin-bottom:2rem}
.stat-card{background:white;border-radius:var(--radius);padding:1.8rem 1.2rem;box-shadow:var(--shadow);text-align:center;transition:.25s}
.stat-card:hover{transform:translateY(-3px)}
.stat-icon{font-size:2.2rem;margin-bottom:.6rem}
.stat-val{font-size:2.2rem;font-weight:800;line-height:1}
.stat-lbl{font-size:.87rem;color:var(--text-light);margin-top:.4rem}
.card{background:white;border-radius:var(--radius);padding:1.8rem;box-shadow:var(--shadow);margin-bottom:1.6rem}
.card-title{font-size:1.15rem;font-weight:700;margin-bottom:1.3rem;display:flex;align-items:center;gap:.5rem}
.form-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:1rem;margin-bottom:1rem}
.form-group{display:flex;flex-direction:column;gap:.35rem}
label{font-size:.88rem;font-weight:600;color:#374151}
input,select,textarea{padding:.7rem 1rem;border:2px solid var(--primary-light);border-radius:8px;font-family:'Poppins',sans-serif;font-size:.93rem;color:var(--text);outline:none;transition:.2s;width:100%}
input:focus,select:focus,textarea:focus{border-color:var(--primary)}
textarea{resize:vertical;min-height:80px}
.btn{padding:.55rem 1rem;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-family:'Poppins',sans-serif;font-size:.85rem;display:inline-flex;align-items:center;gap:.4rem;transition:.2s;white-space:nowrap}
.btn-primary{background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:white}
.btn-success{background:linear-gradient(135deg,var(--success),#059669);color:white}
.btn-danger{background:linear-gradient(135deg,var(--danger),#b91c1c);color:white}
.btn-warning{background:linear-gradient(135deg,var(--warning),#d97706);color:white}
.btn-light{background:var(--primary-light);color:var(--primary-dark)}
.btn-sm{padding:.35rem .7rem;font-size:.78rem}
.btn:hover{opacity:.88;transform:translateY(-1px)}
.table-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:.88rem}
thead{background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:white}
th,td{padding:13px 16px;text-align:left;vertical-align:middle}
tbody tr{border-bottom:1px solid var(--primary-light)}
tbody tr:hover{background:var(--primary-light)}
.badge{display:inline-block;border-radius:20px;font-size:.7rem;font-weight:700;padding:.2rem .6rem}
.badge-green{background:#dcfce7;color:#166534}
.badge-red{background:#fee2e2;color:#991b1b}
.badge-blue{background:#dbeafe;color:#1e40af}
.badge-orange{background:#fef3c7;color:#92400e}
.pw-bar-wrap{height:6px;background:#e5e7eb;border-radius:4px;margin:.4rem 0}
.pw-bar{height:100%;border-radius:4px;transition:width .3s,background .3s}
.pw-hint{font-size:.75rem;color:var(--text-light)}
.pw-hint.ok{color:var(--success)}
.pw-hint.err{color:var(--danger)}
.profile-avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--primary-dark));display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:800;color:white;margin:0 auto 1rem}
.profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
.log-item{display:flex;align-items:flex-start;gap:.8rem;padding:.7rem 0;border-bottom:1px solid var(--primary-light)}
.log-icon{width:32px;height:32px;border-radius:50%;background:var(--primary-light);color:var(--primary-dark);display:flex;align-items:center;justify-content:center;font-size:.8rem;flex-shrink:0}
.log-body{flex:1;min-width:0}
.log-action{font-size:.85rem;font-weight:600;color:var(--text)}
.log-detail{font-size:.78rem;color:var(--text-light)}
.log-date{font-size:.75rem;color:var(--text-light);white-space:nowrap}
.flash{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#1f2937;color:white;border-radius:12px;padding:.75rem 1.5rem;font-size:.88rem;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.2);animation:fadeUp .25s ease}
@keyframes fadeUp{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}
@media(max-width:1200px){.stats-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:900px){
  .sidebar{transform:translateX(-295px);width:295px}
  .sidebar.open{transform:translateX(0)}
  .main{margin-left:0;padding:1rem}
  .burger{display:flex}
  .overlay{display:block}
  .profile-grid{grid-template-columns:1fr}
}
@media(max-width:768px){
  input,select,textarea{font-size:16px}
}
@media(max-width:640px){
  .main{padding:.8rem}
  .stats-grid{grid-template-columns:repeat(2,1fr);gap:.7rem}
  .stat-card{padding:1rem .8rem}
  .stat-val{font-size:1.5rem}
  .card{padding:1.1rem}
  .form-grid{grid-template-columns:1fr}
  .section-heading{font-size:.95rem}
}
@media(max-width:480px){
  table thead{display:none}
  table tbody tr{display:block;border:1px solid var(--primary-light);border-radius:10px;margin-bottom:.6rem;padding:.5rem}
  table tbody td{display:flex;justify-content:space-between;align-items:center;padding:.3rem .5rem;border:none;font-size:.82rem}
  table tbody td::before{content:attr(data-label);font-weight:700;color:var(--text-light);font-size:.72rem;min-width:90px}
}
`

export default function SuperDashboard({ adminInit, statsInit, communesInit, adminsInit, logsInit }) {
  const [tab, setTab]       = useState('overview')
  const [sidebarOpen, setSidebar] = useState(false)
  const [msg, setMsg]       = useState('')
  const [msgType, setMsgType] = useState('ok')

  // Data states
  const [stats, setStats]     = useState(statsInit)
  const [communes, setCommunes] = useState(communesInit)
  const [admins, setAdmins]   = useState(adminsInit)
  const [logs, setLogs]       = useState(logsInit)

  // Forms
  const [communeForm, setCommuneForm] = useState({ name: '', desc: '' })
  const [adminForm, setAdminForm]     = useState({ username:'', full_name:'', email:'', password:'', commune_id:'' })

  // Profile
  const [profileForm, setProfileForm] = useState({ full_name: adminInit.full_name||'', username: adminInit.username||'', email: adminInit.email||'' })
  const [pwForm, setPwForm]           = useState({ pw_current:'', pw_new:'', pw_confirm:'' })
  const [pwStrength, setPwStrength]   = useState(0)
  const [profileAdmin, setProfileAdmin] = useState(adminInit)

  const flash = (m, type='ok') => { setMsg(m); setMsgType(type); setTimeout(()=>setMsg(''), 3500) }

  // ── Reload helpers ───────────────────────────────────────────
  async function reloadCommunes() {
    const r = await fetch('/api/admin/super/communes'); if(r.ok) setCommunes(await r.json())
  }
  async function reloadAdmins() {
    const r = await fetch('/api/admin/super/admins'); if(r.ok) setAdmins(await r.json())
  }
  async function reloadLogs() {
    const r = await fetch('/api/admin/super/logs'); if(r.ok) setLogs(await r.json())
  }

  // ── Communes ─────────────────────────────────────────────────
  async function addCommune(e) {
    e.preventDefault()
    const r = await fetch('/api/admin/super/communes', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(communeForm) })
    const d = await r.json()
    if (!r.ok) { flash(d.error||'Erreur', 'err'); return }
    setCommuneForm({ name:'', desc:'' })
    await reloadCommunes(); await reloadLogs()
    flash('Commune ajoutée !')
  }
  async function disableCommune(id, name) {
    if (!confirm(`Désactiver la commune "${name}" ?`)) return
    const r = await fetch(`/api/admin/super/communes?id=${id}`, { method:'DELETE' })
    if (r.ok) { await reloadCommunes(); flash('Commune désactivée') }
    else flash('Erreur', 'err')
  }

  // ── Admins ───────────────────────────────────────────────────
  async function addAdmin(e) {
    e.preventDefault()
    const r = await fetch('/api/admin/super/admins', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(adminForm) })
    const d = await r.json()
    if (!r.ok) { flash(d.error||'Erreur', 'err'); return }
    setAdminForm({ username:'', full_name:'', email:'', password:'', commune_id:'' })
    await reloadAdmins(); await reloadLogs()
    flash('Admin créé !')
  }
  async function disableAdmin(id, name) {
    if (!confirm(`Désactiver l'admin "${name}" ?`)) return
    const r = await fetch(`/api/admin/super/admins?id=${id}`, { method:'DELETE' })
    if (r.ok) { await reloadAdmins(); flash('Admin désactivé') }
    else flash('Erreur', 'err')
  }

  // ── Profil ───────────────────────────────────────────────────
  async function saveProfile(e) {
    e.preventDefault()
    const r = await fetch('/api/admin/profile', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(profileForm) })
    const d = await r.json()
    if (!r.ok) { flash(d.error||'Erreur', 'err'); return }
    setProfileAdmin(prev => ({ ...prev, ...profileForm }))
    flash('Profil enregistré !')
  }
  async function savePassword(e) {
    e.preventDefault()
    if (pwForm.pw_new !== pwForm.pw_confirm) { flash('Les mots de passe ne correspondent pas', 'err'); return }
    const r = await fetch('/api/admin/profile', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ pw_current: pwForm.pw_current, pw_new: pwForm.pw_new }) })
    const d = await r.json()
    if (!r.ok) { flash(d.error||'Erreur', 'err'); return }
    setPwForm({ pw_current:'', pw_new:'', pw_confirm:'' }); setPwStrength(0)
    flash('Mot de passe modifié !')
  }

  function calcStrength(pw) {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw)) s++
    if (/[0-9]/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    return s
  }
  function handlePwNew(val) {
    setPwForm(f => ({ ...f, pw_new: val }))
    setPwStrength(calcStrength(val))
  }
  const pwBarColor = ['#ef4444','#f59e0b','#10b981','#0077b6'][Math.max(0,pwStrength-1)] || '#ef4444'
  const pwBarW     = pwStrength === 0 ? '0%' : `${pwStrength*25}%`
  const pwLabel    = ['','Faible','Moyen','Fort','Très fort'][pwStrength] || ''

  const initials = (profileAdmin.full_name || profileAdmin.username || 'A')[0].toUpperCase()

  const navItem = (tabId, icon, label) => (
    <button className={`nav-item${tab===tabId?' active':''}`} onClick={() => { setTab(tabId); if(typeof window!=='undefined'&&window.innerWidth<=900) setSidebar(false) }}>
      <i className={`fas fa-${icon}`}></i> {label}
    </button>
  )

  const TABS = { overview:'Vue globale', communes:'Communes', admins:'Admins locaux', logs:'Journal', settings:'Paramètres' }

  function fmtDate(d) {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
  }
  function logIcon(action) {
    if (!action) return 'fa-circle-dot'
    if (action.includes('commune')) return 'fa-map'
    if (action.includes('admin')) return 'fa-user-cog'
    if (action.includes('pharma')) return 'fa-pills'
    return 'fa-circle-dot'
  }

  return (
    <>
      <Head>
        <title>Super Admin – PharmaGuard Dakar</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>
      <style>{CSS}</style>

      {/* SIDEBAR */}
      <aside className={`sidebar${sidebarOpen?' open':''}`}>
        <div className="sidebar-brand">
          <i className="fas fa-shield-alt"></i>
          <div>
            PharmaGuard
            <span className="super-badge"><i className="fas fa-crown"></i> Super Admin</span>
          </div>
        </div>
        <div className="sidebar-prof">
          <div className="avatar-circle">{initials}</div>
          <div>
            <div className="prof-name">{profileAdmin.full_name || profileAdmin.username}</div>
            <div className="prof-role"><i className="fas fa-crown"></i> Super Admin</div>
          </div>
        </div>
        {navItem('overview',  'chart-bar', 'Vue globale')}
        {navItem('communes',  'map',       'Communes')}
        {navItem('admins',    'users-cog', 'Admins locaux')}
        {navItem('logs',      'history',   'Journal d\'activité')}
        {navItem('settings',  'cog',       'Paramètres')}
        <div className="sidebar-footer">
          <a href="/api/auth/logout" className="nav-item danger">
            <i className="fas fa-sign-out-alt"></i> Déconnexion
          </a>
        </div>
      </aside>

      {sidebarOpen && <div className="overlay" onClick={() => setSidebar(false)} style={{opacity:1,pointerEvents:'auto'}}></div>}

      {/* MAIN */}
      <main className="main">
        {/* TOPBAR */}
        <div className="topbar">
          <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
            <button className="burger" onClick={() => setSidebar(o => !o)}><span></span><span></span><span></span></button>
            <div className="topbar-title"><i className="fas fa-crown" style={{color:'#f59e0b',marginRight:'.4rem'}}></i>{TABS[tab]}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'.75rem',fontSize:'.82rem',color:'var(--text-light)'}}>
            <span className="badge badge-orange"><i className="fas fa-crown"></i> Super Admin</span>
            <div className="avatar-circle" style={{width:32,height:32,fontSize:'.8rem',background:'linear-gradient(135deg,#f59e0b,#d97706)'}}>{initials}</div>
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{color:'var(--primary)'}}><i className="fas fa-map"></i></div>
                <div className="stat-val">{stats.communes}</div>
                <div className="stat-lbl">Communes actives</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{color:'var(--success)'}}><i className="fas fa-pills"></i></div>
                <div className="stat-val">{stats.pharmacies}</div>
                <div className="stat-lbl">Pharmacies actives</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{color:'var(--warning)'}}><i className="fas fa-users-cog"></i></div>
                <div className="stat-val">{stats.admins}</div>
                <div className="stat-lbl">Admins locaux</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{color:'var(--danger)'}}><i className="fas fa-moon"></i></div>
                <div className="stat-val">{stats.guards}</div>
                <div className="stat-lbl">En garde aujourd&apos;hui</div>
              </div>
            </div>
            <div className="card">
              <div className="card-title"><i className="fas fa-map" style={{color:'var(--primary)'}}></i> Toutes les communes</div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Commune</th><th>Slug</th><th>Pharmacies</th><th>En garde auj.</th><th>Statut</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {communes.map(c => (
                      <tr key={c.id}>
                        <td data-label="Commune"><strong>{c.name}</strong></td>
                        <td data-label="Slug"><code style={{background:'var(--primary-light)',padding:'.1rem .4rem',borderRadius:4,fontSize:'.78rem'}}>{c.slug}</code></td>
                        <td data-label="Pharmacies"><span className="badge badge-blue">{c.nb_pharmacies}</span></td>
                        <td data-label="En garde">{c.guards_today > 0 ? <span className="badge badge-green">{c.guards_today}</span> : <span style={{color:'var(--text-light)',fontSize:'.8rem'}}>—</span>}</td>
                        <td data-label="Statut"><span className={`badge ${c.is_active ? 'badge-green' : 'badge-red'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td data-label="Actions">
                          {c.is_active && <button className="btn btn-sm btn-danger" onClick={() => disableCommune(c.id, c.name)}><i className="fas fa-ban"></i> Désactiver</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── COMMUNES ── */}
        {tab === 'communes' && (
          <>
            <div className="card">
              <div className="card-title"><i className="fas fa-plus-circle" style={{color:'var(--success)'}}></i> Ajouter une commune</div>
              <form onSubmit={addCommune}>
                <div className="form-grid">
                  <div className="form-group"><label>Nom de la commune *</label><input value={communeForm.name} onChange={e=>setCommuneForm(f=>({...f,name:e.target.value}))} placeholder="Médina, Plateau…" required /></div>
                  <div className="form-group"><label>Description (optionnel)</label><input value={communeForm.desc} onChange={e=>setCommuneForm(f=>({...f,desc:e.target.value}))} placeholder="Quartier centre-ville…" /></div>
                </div>
                <button type="submit" className="btn btn-success"><i className="fas fa-plus"></i> Ajouter</button>
              </form>
            </div>
            <div className="card">
              <div className="card-title"><i className="fas fa-map"></i> Toutes les communes ({communes.length})</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Nom</th><th>Slug</th><th>Pharmacies</th><th>Statut</th><th>Actions</th></tr></thead>
                  <tbody>
                    {communes.map(c => (
                      <tr key={c.id}>
                        <td data-label="Nom"><strong>{c.name}</strong><br /><small style={{color:'var(--text-light)',fontSize:'.75rem'}}>{c.description||''}</small></td>
                        <td data-label="Slug"><code style={{background:'var(--primary-light)',padding:'.1rem .4rem',borderRadius:4,fontSize:'.78rem'}}>{c.slug}</code></td>
                        <td data-label="Pharmacies"><span className="badge badge-blue">{c.nb_pharmacies}</span></td>
                        <td data-label="Statut"><span className={`badge ${c.is_active ? 'badge-green' : 'badge-red'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td data-label="Actions">
                          {c.is_active && <button className="btn btn-sm btn-danger" onClick={() => disableCommune(c.id, c.name)}><i className="fas fa-ban"></i> Désactiver</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── ADMINS ── */}
        {tab === 'admins' && (
          <>
            <div className="card">
              <div className="card-title"><i className="fas fa-user-plus" style={{color:'var(--success)'}}></i> Créer un admin local</div>
              <form onSubmit={addAdmin}>
                <div className="form-grid">
                  <div className="form-group"><label>Nom d&apos;utilisateur *</label><input value={adminForm.username} onChange={e=>setAdminForm(f=>({...f,username:e.target.value}))} placeholder="dr.khady" required /></div>
                  <div className="form-group"><label>Nom complet</label><input value={adminForm.full_name} onChange={e=>setAdminForm(f=>({...f,full_name:e.target.value}))} placeholder="Dr Khady Diallo" /></div>
                  <div className="form-group"><label>Email</label><input type="email" value={adminForm.email} onChange={e=>setAdminForm(f=>({...f,email:e.target.value}))} placeholder="admin@commune.sn" /></div>
                  <div className="form-group"><label>Mot de passe *</label><input type="password" value={adminForm.password} onChange={e=>setAdminForm(f=>({...f,password:e.target.value}))} placeholder="min. 6 caractères" required /></div>
                  <div className="form-group"><label>Commune assignée</label>
                    <select value={adminForm.commune_id} onChange={e=>setAdminForm(f=>({...f,commune_id:e.target.value}))}>
                      <option value="">— Aucune —</option>
                      {communes.filter(c=>c.is_active).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn btn-success"><i className="fas fa-user-plus"></i> Créer l&apos;admin</button>
              </form>
            </div>
            <div className="card">
              <div className="card-title"><i className="fas fa-users-cog"></i> Admins locaux ({admins.length})</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Admin</th><th>Email</th><th>Commune</th><th>Statut</th><th>Actions</th></tr></thead>
                  <tbody>
                    {admins.map(a => (
                      <tr key={a.id}>
                        <td data-label="Admin">
                          <strong>{a.full_name || a.username}</strong>
                          <br /><small style={{color:'var(--text-light)'}}>{a.username}</small>
                        </td>
                        <td data-label="Email" style={{fontSize:'.8rem'}}>{a.email||'—'}</td>
                        <td data-label="Commune">{a.commune_name ? <span className="badge badge-blue">{a.commune_name}</span> : <span style={{color:'var(--text-light)',fontSize:'.8rem'}}>—</span>}</td>
                        <td data-label="Statut"><span className={`badge ${a.is_active ? 'badge-green' : 'badge-red'}`}>{a.is_active ? 'Actif' : 'Inactif'}</span></td>
                        <td data-label="Actions">
                          {a.is_active && <button className="btn btn-sm btn-danger" onClick={() => disableAdmin(a.id, a.full_name||a.username)}><i className="fas fa-ban"></i> Désactiver</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── LOGS ── */}
        {tab === 'logs' && (
          <div className="card">
            <div className="card-title"><i className="fas fa-history" style={{color:'var(--primary)'}}></i> Journal d&apos;activité (15 dernières entrées)</div>
            {logs.length === 0
              ? <p style={{color:'var(--text-light)',fontSize:'.88rem'}}><i className="fas fa-info-circle"></i> Aucun journal disponible.</p>
              : logs.map((l, i) => (
                <div key={l.id||i} className="log-item">
                  <div className="log-icon"><i className={`fas ${logIcon(l.action)}`}></i></div>
                  <div className="log-body">
                    <div className="log-action">{l.full_name || l.username} <span style={{fontWeight:400,color:'var(--text-light)'}}>— {l.action}</span></div>
                    {l.details && <div className="log-detail">{l.details}</div>}
                  </div>
                  <div className="log-date">{fmtDate(l.created_at)}</div>
                </div>
              ))
            }
            {logs.length > 0 && <button className="btn btn-light" style={{marginTop:'1rem'}} onClick={reloadLogs}><i className="fas fa-sync"></i> Actualiser</button>}
          </div>
        )}

        {/* ── SETTINGS / PROFIL ── */}
        {tab === 'settings' && (
          <>
            <div className="card" style={{textAlign:'center',paddingTop:'2rem',paddingBottom:'2rem'}}>
              <div className="profile-avatar">{initials}</div>
              <div style={{fontWeight:700,fontSize:'1.1rem'}}>{profileAdmin.full_name || profileAdmin.username}</div>
              <div style={{color:'var(--text-light)',fontSize:'.85rem',marginTop:'.25rem'}}>
                <span className="badge badge-orange" style={{fontSize:'.75rem'}}><i className="fas fa-crown"></i> Super Admin</span>
              </div>
              <div style={{display:'flex',justifyContent:'center',gap:'2rem',marginTop:'1rem',fontSize:'.8rem',color:'var(--text-light)'}}>
                <span><strong style={{color:'var(--text)'}}>ID</strong> #{profileAdmin.id}</span>
                <span><strong style={{color:'var(--text)'}}>Rôle</strong> {profileAdmin.role}</span>
              </div>
            </div>
            <div className="profile-grid">
              <div className="card">
                <div className="card-title"><i className="fas fa-user-edit" style={{color:'var(--primary)'}}></i> Informations du compte</div>
                <form onSubmit={saveProfile}>
                  <div className="form-group" style={{marginBottom:'.85rem'}}>
                    <label>Nom complet</label>
                    <input value={profileForm.full_name} onChange={e=>setProfileForm(f=>({...f,full_name:e.target.value}))} placeholder="Dr Prénom Nom" />
                  </div>
                  <div className="form-group" style={{marginBottom:'.85rem'}}>
                    <label>Nom d&apos;utilisateur *</label>
                    <input value={profileForm.username} onChange={e=>setProfileForm(f=>({...f,username:e.target.value}))} required />
                  </div>
                  <div className="form-group" style={{marginBottom:'1.2rem'}}>
                    <label>Email</label>
                    <input type="email" value={profileForm.email} onChange={e=>setProfileForm(f=>({...f,email:e.target.value}))} placeholder="admin@exemple.sn" />
                  </div>
                  <button type="submit" className="btn btn-primary"><i className="fas fa-save"></i> Enregistrer</button>
                </form>
              </div>
              <div className="card">
                <div className="card-title"><i className="fas fa-lock" style={{color:'var(--warning)'}}></i> Changer le mot de passe</div>
                <form onSubmit={savePassword}>
                  <div className="form-group" style={{marginBottom:'.85rem'}}>
                    <label>Mot de passe actuel</label>
                    <input type="password" value={pwForm.pw_current} onChange={e=>setPwForm(f=>({...f,pw_current:e.target.value}))} required />
                  </div>
                  <div className="form-group" style={{marginBottom:'.4rem'}}>
                    <label>Nouveau mot de passe</label>
                    <input type="password" value={pwForm.pw_new} onChange={e=>handlePwNew(e.target.value)} required />
                  </div>
                  {pwForm.pw_new && (
                    <div style={{marginBottom:'.85rem'}}>
                      <div className="pw-bar-wrap"><div className="pw-bar" style={{width:pwBarW,background:pwBarColor}}></div></div>
                      <span className="pw-hint">{pwLabel}</span>
                    </div>
                  )}
                  <div className="form-group" style={{marginBottom:'.5rem'}}>
                    <label>Confirmer le nouveau mot de passe</label>
                    <input type="password" value={pwForm.pw_confirm} onChange={e=>setPwForm(f=>({...f,pw_confirm:e.target.value}))} required />
                  </div>
                  {pwForm.pw_confirm && (
                    <div style={{marginBottom:'1rem'}}>
                      {pwForm.pw_new === pwForm.pw_confirm
                        ? <span className="pw-hint ok"><i className="fas fa-check"></i> Les mots de passe correspondent</span>
                        : <span className="pw-hint err"><i className="fas fa-times"></i> Ne correspondent pas</span>}
                    </div>
                  )}
                  <button type="submit" className="btn btn-warning"><i className="fas fa-key"></i> Modifier le mot de passe</button>
                </form>
              </div>
            </div>
          </>
        )}
      </main>

      {msg && <div className="flash" style={{background: msgType==='err' ? 'var(--danger)' : '#1f2937'}}>{msg}</div>}
    </>
  )
}

export async function getServerSideProps({ req, res }) {
  const session = await getSession(req, res)
  if (!session.admin) return { redirect: { destination: '/admin/login', permanent: false } }
  if (session.admin.role !== 'super_admin') return { redirect: { destination: '/admin/local/dashboard', permanent: false } }

  const sql = getDB()
  const today = new Date().toISOString().split('T')[0]

  const [statsRows, communes, admins] = await Promise.all([
    Promise.all([
      sql`SELECT COUNT(*) AS n FROM communes WHERE is_active=true`,
      sql`SELECT COUNT(*) AS n FROM pharmacies WHERE is_active=true`,
      sql`SELECT COUNT(*) AS n FROM admins WHERE role='local_admin' AND is_active=true`,
      sql`SELECT COUNT(DISTINCT pharmacy_id) AS n FROM garde WHERE garde_date=${today}`,
    ]),
    sql`SELECT c.id, c.name, c.slug, c.description, c.is_active,
               COUNT(DISTINCT p.id) FILTER (WHERE p.is_active) AS nb_pharmacies,
               COUNT(DISTINCT g.pharmacy_id) AS guards_today
        FROM communes c
        LEFT JOIN pharmacies p ON p.commune_id = c.id
        LEFT JOIN garde g ON g.commune_id = c.id AND g.garde_date = ${today}
        GROUP BY c.id ORDER BY c.name`,
    sql`SELECT a.id, a.username, a.full_name, a.email, a.role, a.is_active, a.created_at,
               c.name AS commune_name, a.commune_id
        FROM admins a LEFT JOIN communes c ON a.commune_id = c.id
        WHERE a.role = 'local_admin' ORDER BY a.full_name, a.username`,
  ])

  let logs = []
  try {
    logs = await sql`SELECT l.id, l.action, l.details, l.created_at, a.username, a.full_name, a.role
                     FROM admin_logs l JOIN admins a ON l.admin_id = a.id
                     ORDER BY l.created_at DESC LIMIT 15`
  } catch {}

  const stats = {
    communes:   parseInt(statsRows[0][0].n),
    pharmacies: parseInt(statsRows[1][0].n),
    admins:     parseInt(statsRows[2][0].n),
    guards:     parseInt(statsRows[3][0].n),
  }

  const adminData = session.admin

  return {
    props: {
      adminInit:    { id: String(adminData.id), username: adminData.username, full_name: adminData.full_name||'', email: '', role: adminData.role },
      statsInit:    stats,
      communesInit: communes.map(c => ({ ...c, id: String(c.id), nb_pharmacies: String(c.nb_pharmacies||0), guards_today: String(c.guards_today||0) })),
      adminsInit:   admins.map(a => ({ ...a, id: String(a.id), commune_id: a.commune_id ? String(a.commune_id) : null })),
      logsInit:     logs.map(l => ({ ...l, id: l.id ? String(l.id) : null })),
    }
  }
}
