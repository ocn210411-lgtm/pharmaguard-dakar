import Head from 'next/head'
import { useState, useCallback } from 'react'
import { getSession } from '../../../lib/session'
import { getDB } from '../../../lib/db'

const CSS = `
:root{--primary:#00AEEF;--primary-dark:#0077b6;--primary-light:#e0f7ff;--success:#10b981;--warning:#f59e0b;--danger:#ef4444;--text:#1f2937;--text-light:#6b7280;--bg:#f0f9ff;--shadow:0 8px 24px rgba(0,174,239,.12);--radius:14px}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Poppins',sans-serif;background:var(--bg);color:var(--text);display:flex;min-height:100vh}
.sidebar{width:240px;background:linear-gradient(180deg,var(--primary),var(--primary-dark));color:white;padding:1.5rem;position:fixed;height:100%;z-index:900;display:flex;flex-direction:column;gap:.2rem;transition:.3s;overflow-y:auto}
.sidebar-brand{font-size:.95rem;font-weight:800;display:flex;align-items:center;gap:.6rem;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid rgba(255,255,255,.2)}
.commune-badge{background:rgba(255,255,255,.2);border-radius:8px;padding:.2rem .55rem;font-size:.68rem;margin-top:.2rem;display:block;text-align:center}
.sidebar-prof{padding:.75rem;background:rgba(255,255,255,.12);border-radius:12px;display:flex;align-items:center;gap:.75rem;margin-bottom:.75rem}
.avatar-circle{width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.25);border:2px solid rgba(255,255,255,.4);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:.95rem;color:white;flex-shrink:0}
.prof-name{font-size:.8rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.prof-role{font-size:.68rem;opacity:.75}
.nav-item{display:flex;align-items:center;gap:.7rem;padding:.65rem 1rem;border-radius:10px;color:rgba(255,255,255,.85);text-decoration:none;font-size:.86rem;font-weight:500;cursor:pointer;transition:.2s;border:none;background:none;width:100%;text-align:left}
.nav-item:hover{background:rgba(255,255,255,.15);color:white}
.nav-item.active{background:white;color:var(--primary-dark);font-weight:700}
.nav-item.danger{color:#fca5a5}
.sidebar-footer{margin-top:auto;display:flex;flex-direction:column;gap:.2rem;padding-top:.5rem}
.main{margin-left:240px;flex:1;padding:1.8rem;min-height:100vh}
.topbar{background:white;border-radius:var(--radius);padding:1rem 1.5rem;display:flex;align-items:center;justify-content:space-between;box-shadow:var(--shadow);margin-bottom:1.8rem}
.topbar-title{font-weight:700;font-size:1rem}
.burger{display:none;flex-direction:column;gap:5px;background:none;border:none;cursor:pointer;padding:.25rem}
.burger span{width:24px;height:3px;background:var(--primary);border-radius:2px;display:block}
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:800}
.stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem;margin-bottom:1.8rem}
.stat-card{background:white;border-radius:var(--radius);padding:1.2rem;box-shadow:var(--shadow);text-align:center}
.stat-icon{font-size:1.4rem;margin-bottom:.4rem}
.stat-val{font-size:1.6rem;font-weight:800}
.stat-lbl{font-size:.76rem;color:var(--text-light)}
.card{background:white;border-radius:var(--radius);padding:1.5rem;box-shadow:var(--shadow);margin-bottom:1.5rem}
.card-title{font-size:1rem;font-weight:700;margin-bottom:1.2rem;display:flex;align-items:center;gap:.5rem}
.form-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:.85rem;margin-bottom:1rem}
.form-group{display:flex;flex-direction:column;gap:.3rem}
label{font-size:.8rem;font-weight:600;color:#374151}
input,select{padding:.6rem .85rem;border:2px solid var(--primary-light);border-radius:8px;font-family:'Poppins',sans-serif;font-size:.85rem;color:var(--text);outline:none;transition:.2s;width:100%}
input:focus,select:focus{border-color:var(--primary)}
.btn{padding:.5rem .9rem;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-family:'Poppins',sans-serif;font-size:.82rem;display:inline-flex;align-items:center;gap:.4rem;transition:.2s;white-space:nowrap}
.btn-primary{background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:white}
.btn-success{background:linear-gradient(135deg,var(--success),#059669);color:white}
.btn-danger{background:linear-gradient(135deg,var(--danger),#b91c1c);color:white}
.btn-warning{background:linear-gradient(135deg,var(--warning),#d97706);color:white}
.btn-light{background:var(--primary-light);color:var(--primary-dark)}
.btn-sm{padding:.3rem .6rem;font-size:.74rem}
.btn:hover{opacity:.88;transform:translateY(-1px)}
.table-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:.84rem}
thead{background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:white}
th,td{padding:10px 13px;text-align:left;vertical-align:middle}
tbody tr{border-bottom:1px solid var(--primary-light)}
tbody tr:hover{background:var(--primary-light)}
.badge{display:inline-block;border-radius:20px;font-size:.69rem;font-weight:700;padding:.15rem .5rem}
.badge-green{background:#dcfce7;color:#166534}
.badge-red{background:#fee2e2;color:#991b1b}
.badge-blue{background:#dbeafe;color:#1e40af}
.cal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem}
.cal-card{background:white;border-radius:var(--radius);padding:1.2rem;box-shadow:var(--shadow)}
.cal-card.current{border:2px solid var(--primary)}
.cal-date{font-weight:700;color:var(--primary-dark);margin-bottom:.75rem;font-size:.88rem}
.cal-date.current{color:var(--success)}
.cal-item{display:flex;align-items:center;justify-content:space-between;border-radius:8px;padding:.4rem .65rem;margin-bottom:.3rem;font-size:.81rem}
.cal-item-nuit{background:var(--primary-light)}
.cal-item-dim{background:#fffbeb;border-left:3px solid var(--warning)}
.plan-pharms{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.4rem;background:white;border-radius:10px;padding:1rem;border:2px solid var(--primary-light);max-height:240px;overflow-y:auto}
.plan-pharm-label{display:flex;align-items:center;gap:.5rem;font-size:.83rem;cursor:pointer;padding:.3rem .4rem;border-radius:6px;transition:.12s}
.plan-pharm-label:hover{background:var(--primary-light)}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:2000;display:flex;align-items:center;justify-content:center;padding:1rem}
.modal{background:white;border-radius:var(--radius);padding:2rem;width:100%;max-width:520px;box-shadow:0 20px 60px rgba(0,0,0,.2);max-height:90vh;overflow-y:auto}
.modal h3{margin-bottom:1.2rem;font-size:1.05rem;display:flex;align-items:center;gap:.5rem}
.pw-bar-wrap{height:6px;background:#e5e7eb;border-radius:4px;margin:.4rem 0}
.pw-bar{height:100%;border-radius:4px;transition:width .3s,background .3s}
.pw-hint{font-size:.72rem;color:var(--text-light)}
.pw-hint.ok{color:var(--success)}
.pw-hint.err{color:var(--danger)}
.profile-avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--primary-dark));display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:800;color:white;margin:0 auto 1rem}
.profile-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
.flash{position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);background:#1f2937;color:white;border-radius:12px;padding:.75rem 1.5rem;font-size:.88rem;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.2);animation:fadeUp .25s ease}
@keyframes fadeUp{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translate(-50%,0)}}
@media(max-width:900px){
  .sidebar{transform:translateX(-260px);width:260px}
  .sidebar.open{transform:translateX(0)}
  .main{margin-left:0;padding:1rem}
  .burger{display:flex}
  .overlay{display:block}
  .stats-grid{gap:.75rem}
  .cal-grid{grid-template-columns:repeat(2,1fr)}
  .profile-grid{grid-template-columns:1fr}
}
@media(max-width:640px){
  .main{padding:.8rem}
  .stats-grid{gap:.6rem}
  .stat-card{padding:.9rem .6rem}
  .stat-val{font-size:1.3rem}
  .cal-grid{grid-template-columns:1fr}
  .form-grid{grid-template-columns:1fr}
  .card{padding:1rem}
}
@media(max-width:480px){
  table thead{display:none}
  table tbody tr{display:block;border:1px solid var(--primary-light);border-radius:10px;margin-bottom:.6rem;padding:.5rem}
  table tbody td{display:flex;justify-content:space-between;align-items:center;padding:.3rem .5rem;border:none;font-size:.8rem}
  table tbody td::before{content:attr(data-label);font-weight:700;color:var(--text-light);font-size:.72rem;min-width:90px}
}
`

export default function Dashboard({ adminInit, commune, pharmaciesInit, weeks4, today }) {
  const [tab, setTab]             = useState('overview')
  const [sidebarOpen, setSidebar] = useState(false)
  const [pharmacies, setPharms]   = useState(pharmaciesInit)
  const [editModal, setEditModal] = useState(null)
  const [addForm, setAddForm]     = useState({ name:'', address:'', phone:'', lat:'', lng:'', doctor:'' })
  const [planForm, setPlanForm]   = useState({ week_start: weeks4[0]?.startStr || '', garde_type:'nuit', pharm_ids:[] })
  const [weeks, setWeeks]         = useState(weeks4)
  const [msg, setMsg]             = useState('')
  const [msgType, setMsgType]     = useState('ok')

  // Profile state
  const [profileForm, setProfileForm] = useState({ full_name: adminInit.full_name||'', username: adminInit.username||'', email: adminInit.email||'' })
  const [pwForm, setPwForm]           = useState({ pw_current:'', pw_new:'', pw_confirm:'' })
  const [pwStrength, setPwStrength]   = useState(0)
  const [profileAdmin, setProfileAdmin] = useState(adminInit)

  const flash = (m, type='ok') => { setMsg(m); setMsgType(type); setTimeout(()=>setMsg(''), 3500) }

  const loadPharms = useCallback(async () => {
    const r = await fetch('/api/admin/pharmacies')
    if (r.ok) setPharms(await r.json())
  }, [])

  // ── Pharmacies CRUD ─────────────────────────────────────────
  async function addPharmacy(e) {
    e.preventDefault()
    const r = await fetch('/api/admin/pharmacies', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(addForm) })
    if (r.ok) { setAddForm({ name:'', address:'', phone:'', lat:'', lng:'', doctor:'' }); await loadPharms(); flash('Pharmacie ajoutée !') }
    else flash('Erreur lors de l\'ajout', 'err')
  }
  async function saveEdit(e) {
    e.preventDefault()
    const r = await fetch('/api/admin/pharmacies', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(editModal) })
    if (r.ok) { setEditModal(null); await loadPharms(); flash('Pharmacie modifiée !') }
    else flash('Erreur lors de la modification', 'err')
  }
  async function deletePharmacy(id, name) {
    if (!confirm(`Supprimer "${name}" ? Cette action est irréversible.`)) return
    const r = await fetch(`/api/admin/pharmacies?id=${id}`, { method:'DELETE' })
    if (r.ok) { await loadPharms(); flash('Pharmacie supprimée') }
    else flash('Erreur lors de la suppression', 'err')
  }

  // ── Planning ─────────────────────────────────────────────────
  async function planWeek(e) {
    e.preventDefault()
    if (!planForm.pharm_ids.length) { flash('Cochez au moins une pharmacie', 'err'); return }
    const r = await fetch('/api/admin/planning', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ week_start: planForm.week_start, garde_type: planForm.garde_type, pharm_ids: planForm.pharm_ids }) })
    if (r.ok) { flash('Semaine planifiée !'); refreshWeeks() }
    else flash('Erreur lors de la planification', 'err')
  }
  async function deleteWeek(weekStart, weekType) {
    const label = weekType === 'nuit' ? 'gardes de nuit' : 'gardes du dimanche'
    if (!confirm(`Supprimer toutes les ${label} de cette semaine ?`)) return
    const r = await fetch(`/api/admin/planning?week_start=${weekStart}&week_type=${weekType}`, { method:'DELETE' })
    if (r.ok) { flash('Semaine supprimée'); refreshWeeks() }
    else flash('Erreur', 'err')
  }
  async function refreshWeeks() {
    const r = await fetch('/api/admin/planning-data')
    if (r.ok) setWeeks(await r.json())
  }
  const togglePharmId = (id) => {
    const sid = id.toString()
    setPlanForm(f => ({ ...f, pharm_ids: f.pharm_ids.includes(sid) ? f.pharm_ids.filter(x=>x!==sid) : [...f.pharm_ids, sid] }))
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
  function handlePwNew(val) { setPwForm(f=>({...f,pw_new:val})); setPwStrength(calcStrength(val)) }
  const pwBarColor = ['#ef4444','#f59e0b','#10b981','#0077b6'][Math.max(0,pwStrength-1)] || '#ef4444'
  const pwBarW     = pwStrength === 0 ? '0%' : `${pwStrength*25}%`
  const pwLabel    = ['','Faible','Moyen','Fort','Très fort'][pwStrength] || ''

  const navItem = (tabId, icon, label) => (
    <button className={`nav-item${tab===tabId?' active':''}`} onClick={() => { setTab(tabId); if(typeof window!=='undefined'&&window.innerWidth<=900) setSidebar(false) }}>
      <i className={`fas fa-${icon}`}></i> {label}
    </button>
  )

  const initials = (profileAdmin.full_name || profileAdmin.username || 'A')[0].toUpperCase()

  // Gardes du jour depuis la 1re semaine
  const todayGuards = { nuit: [], dimanche: [] }
  if (weeks[0]) {
    const todayData = weeks[0].days?.find(d => d.date === today)
    if (todayData) { todayGuards.nuit = todayData.nuit || []; todayGuards.dimanche = todayData.dimanche || [] }
  }
  const activePharms = pharmacies.filter(p => p.is_active).length

  const TABS = { overview:'Tableau de bord', pharmacies:'Pharmacies', planning:'Planning de garde', settings:'Paramètres' }

  return (
    <>
      <Head>
        <title>Admin – {commune.name} | PharmaGuard</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>
      <style>{CSS}</style>

      {/* SIDEBAR */}
      <aside className={`sidebar${sidebarOpen?' open':''}`}>
        <div className="sidebar-brand">
          <i className="fas fa-user-shield"></i>
          <div>Admin Local<span className="commune-badge"><i className="fas fa-map-marker-alt"></i> {commune.name}</span></div>
        </div>
        <div className="sidebar-prof">
          <div className="avatar-circle">{initials}</div>
          <div>
            <div className="prof-name">{profileAdmin.full_name || profileAdmin.username}</div>
            <div className="prof-role"><i className="fas fa-user-tie"></i> Admin Local</div>
          </div>
        </div>
        {navItem('overview',   'home',     'Tableau de bord')}
        {navItem('pharmacies', 'pills',    'Pharmacies')}
        {navItem('planning',   'calendar', 'Planning de garde')}
        {navItem('settings',   'cog',      'Paramètres')}
        <div className="sidebar-footer">
          <a href={`/commune/${commune.slug}`} className="nav-item" target="_blank" rel="noopener">
            <i className="fas fa-eye"></i> Voir la commune
          </a>
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
            <div className="topbar-title">{TABS[tab]}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'.75rem',fontSize:'.82rem',color:'var(--text-light)'}}>
            <i className="fas fa-map-marker-alt" style={{color:'var(--primary)'}}></i>
            {commune.name}
            <div className="avatar-circle" style={{width:32,height:32,fontSize:'.8rem',background:'linear-gradient(135deg,var(--primary),var(--primary-dark))'}}>{initials}</div>
          </div>
        </div>

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{color:'var(--primary)'}}><i className="fas fa-pills"></i></div>
            <div className="stat-val">{activePharms}</div>
            <div className="stat-lbl">Pharmacies actives</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{color:'var(--success)'}}><i className="fas fa-moon"></i></div>
            <div className="stat-val">{todayGuards.nuit.length}</div>
            <div className="stat-lbl">Garde nuit auj.</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{color:'var(--warning)'}}><i className="fas fa-sun"></i></div>
            <div className="stat-val">{todayGuards.dimanche.length}</div>
            <div className="stat-lbl">Garde dim.</div>
          </div>
        </div>

        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <>
            <div className="card">
              <div className="card-title"><i className="fas fa-moon" style={{color:'var(--primary)'}}></i> Garde de nuit — aujourd&apos;hui</div>
              {todayGuards.nuit.length ? (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Pharmacie</th><th>Téléphone</th><th></th></tr></thead>
                    <tbody>
                      {todayGuards.nuit.map(p => (
                        <tr key={p.id}>
                          <td data-label="Pharmacie"><strong>{p.name}</strong><br /><small style={{color:'var(--text-light)'}}>{p.address||''}</small></td>
                          <td data-label="Téléphone">{p.phone ? <a href={`tel:${p.phone}`} style={{color:'var(--primary)'}}>{p.phone}</a> : '—'}</td>
                          <td>{p.latitude && p.longitude && <a href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`} target="_blank" rel="noopener" className="btn btn-sm btn-primary"><i className="fas fa-map-marker-alt"></i></a>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p style={{color:'var(--text-light)',fontSize:'.88rem'}}><i className="fas fa-info-circle"></i> Aucune garde de nuit aujourd&apos;hui.</p>}
            </div>
            <div className="card">
              <div className="card-title"><i className="fas fa-sun" style={{color:'var(--warning)'}}></i> Garde du dimanche</div>
              {todayGuards.dimanche.length ? (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Pharmacie</th><th>Téléphone</th></tr></thead>
                    <tbody>
                      {todayGuards.dimanche.map(p => (
                        <tr key={p.id}>
                          <td data-label="Pharmacie"><strong>{p.name}</strong></td>
                          <td data-label="Téléphone">{p.phone ? <a href={`tel:${p.phone}`} style={{color:'var(--warning)'}}>{p.phone}</a> : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p style={{color:'var(--text-light)',fontSize:'.88rem'}}><i className="fas fa-info-circle"></i> Aucune garde du dimanche aujourd&apos;hui.</p>}
            </div>
          </>
        )}

        {/* ── PHARMACIES ── */}
        {tab === 'pharmacies' && (
          <>
            <div className="card">
              <div className="card-title"><i className="fas fa-plus-circle" style={{color:'var(--success)'}}></i> Ajouter une pharmacie</div>
              <form onSubmit={addPharmacy}>
                <div className="form-grid">
                  <div className="form-group" style={{gridColumn:'1/-1'}}><label>Nom *</label><input value={addForm.name} onChange={e=>setAddForm(f=>({...f,name:e.target.value}))} placeholder="Pharmacie du Plateau" required /></div>
                  <div className="form-group" style={{gridColumn:'1/-1'}}><label>Médecin responsable</label><input value={addForm.doctor} onChange={e=>setAddForm(f=>({...f,doctor:e.target.value}))} placeholder="Dr Prénom Nom" /></div>
                  <div className="form-group" style={{gridColumn:'1/-1'}}><label>Adresse</label><input value={addForm.address} onChange={e=>setAddForm(f=>({...f,address:e.target.value}))} placeholder="Rue, avenue…" /></div>
                  <div className="form-group"><label>Téléphone</label><input value={addForm.phone} onChange={e=>setAddForm(f=>({...f,phone:e.target.value}))} placeholder="+221 33 8…" /></div>
                  <div className="form-group"><label>Latitude GPS</label><input type="number" step="0.000001" value={addForm.lat} onChange={e=>setAddForm(f=>({...f,lat:e.target.value}))} placeholder="14.693" /></div>
                  <div className="form-group"><label>Longitude GPS</label><input type="number" step="0.000001" value={addForm.lng} onChange={e=>setAddForm(f=>({...f,lng:e.target.value}))} placeholder="-17.444" /></div>
                </div>
                <button type="submit" className="btn btn-success"><i className="fas fa-plus"></i> Ajouter</button>
              </form>
            </div>
            <div className="card">
              <div className="card-title"><i className="fas fa-list"></i> Pharmacies de {commune.name} ({pharmacies.length})</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Nom</th><th>Médecin</th><th>Téléphone</th><th>Statut</th><th>Actions</th></tr></thead>
                  <tbody>
                    {pharmacies.map(p => (
                      <tr key={p.id}>
                        <td data-label="Nom"><strong>{p.name}</strong><br /><small style={{color:'var(--text-light)'}}>{p.address||''}</small></td>
                        <td data-label="Médecin" style={{fontSize:'.8rem',color:'var(--primary-dark)'}}>{p.doctor||'—'}</td>
                        <td data-label="Téléphone" style={{fontSize:'.8rem'}}>{p.phone ? <a href={`tel:${p.phone}`} style={{color:'var(--primary)'}}>{p.phone}</a> : '—'}</td>
                        <td data-label="Statut"><span className={`badge ${p.is_active ? 'badge-green' : 'badge-red'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                        <td data-label="Actions">
                          <div style={{display:'flex',gap:'.4rem'}}>
                            <button className="btn btn-sm btn-primary" onClick={() => setEditModal({...p, lat: p.latitude||'', lng: p.longitude||''})}><i className="fas fa-edit"></i></button>
                            <button className="btn btn-sm btn-danger" onClick={() => deletePharmacy(p.id, p.name)}><i className="fas fa-trash"></i></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── PLANNING ── */}
        {tab === 'planning' && (
          <>
            <div className="card">
              <div className="card-title"><i className="fas fa-calendar-plus" style={{color:'var(--success)'}}></i> Planifier une semaine</div>
              <form onSubmit={planWeek} style={{background:'var(--primary-light)',borderRadius:12,padding:'1.2rem'}}>
                <div className="form-grid" style={{marginBottom:'1rem'}}>
                  <div className="form-group">
                    <label><i className="fas fa-calendar"></i> Samedi de début *</label>
                    <input type="date" value={planForm.week_start} onChange={e=>setPlanForm(f=>({...f,week_start:e.target.value}))} required />
                    <small style={{color:'var(--text-light)',fontSize:'.73rem'}}>Le planning démarre chaque samedi</small>
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-tag"></i> Type de garde *</label>
                    <select value={planForm.garde_type} onChange={e=>setPlanForm(f=>({...f,garde_type:e.target.value}))}>
                      <option value="nuit">Nuit (toute la semaine – 7 jours)</option>
                      <option value="dimanche">Dimanche uniquement</option>
                    </select>
                    <small style={{color:'var(--text-light)',fontSize:'.73rem'}}>
                      {planForm.garde_type==='nuit' ? '7 jours de garde (Sam → Ven)' : 'Garde uniquement le dimanche'}
                    </small>
                  </div>
                </div>
                <label style={{display:'block',marginBottom:'.5rem',fontWeight:600,fontSize:'.83rem'}}>
                  <i className="fas fa-pills"></i> Pharmacies en garde * <span style={{fontWeight:400,color:'var(--text-light)'}}>— cochez celles concernées</span>
                </label>
                <div className="plan-pharms">
                  {pharmacies.filter(p=>p.is_active).map(p => (
                    <label key={p.id} className="plan-pharm-label">
                      <input type="checkbox" checked={planForm.pharm_ids.includes(p.id.toString())} onChange={()=>togglePharmId(p.id)} style={{accentColor:'var(--primary)',width:15,height:15,flexShrink:0}} />
                      {p.name}
                    </label>
                  ))}
                </div>
                <div style={{display:'flex',gap:'.75rem',marginTop:'1rem',flexWrap:'wrap'}}>
                  <button type="submit" className="btn btn-success"><i className="fas fa-calendar-check"></i> Planifier</button>
                  <button type="button" className="btn btn-light" onClick={()=>setPlanForm(f=>({...f,pharm_ids:pharmacies.filter(p=>p.is_active).map(p=>p.id.toString())}))}>Tout sélectionner</button>
                  <button type="button" className="btn" style={{background:'white',border:'1px solid #e5e7eb'}} onClick={()=>setPlanForm(f=>({...f,pharm_ids:[]}))}>Tout décocher</button>
                </div>
              </form>
            </div>
            <div className="card">
              <div className="card-title"><i className="fas fa-calendar-week"></i> Planning — 4 semaines</div>
              <div className="cal-grid">
                {weeks.map((wk, wi) => (
                  <div key={wi} className={`cal-card${wk.isCurrent?' current':''}`}>
                    <div className={`cal-date${wk.isCurrent?' current':''}`}>
                      {wk.isCurrent && <i className="fas fa-circle" style={{fontSize:'.5rem',verticalAlign:'middle',marginRight:'.3rem'}}></i>}
                      Sem. du {wk.startLabel} au {wk.endLabel}
                    </div>
                    <div style={{margin:'.6rem 0 .3rem',fontSize:'.73rem',fontWeight:700,color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span><i className="fas fa-moon"></i> Gardes de nuit</span>
                      {wk.nuit.length > 0 && <button className="btn btn-sm btn-danger" style={{padding:'.2rem .45rem',fontSize:'.68rem'}} onClick={()=>deleteWeek(wk.startStr,'nuit')}><i className="fas fa-trash"></i> Vider</button>}
                    </div>
                    {wk.nuit.length ? wk.nuit.map(p => (
                      <div key={p.id} className="cal-item cal-item-nuit">
                        <span style={{fontSize:'.79rem'}}>{p.name}</span>
                        {p.phone && <a href={`tel:${p.phone}`} className="btn btn-sm btn-primary" style={{padding:'.2rem .45rem'}}><i className="fas fa-phone"></i></a>}
                      </div>
                    )) : <div style={{color:'var(--text-light)',fontSize:'.77rem',padding:'.2rem 0'}}><i className="fas fa-minus"></i> Non planifié</div>}
                    <div style={{margin:'.7rem 0 .3rem',fontSize:'.73rem',fontWeight:700,color:'var(--warning)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span><i className="fas fa-sun"></i> Garde du dimanche</span>
                      {wk.dimanche.length > 0 && <button className="btn btn-sm btn-danger" style={{padding:'.2rem .45rem',fontSize:'.68rem'}} onClick={()=>deleteWeek(wk.startStr,'dimanche')}><i className="fas fa-trash"></i> Vider</button>}
                    </div>
                    {wk.dimanche.length ? wk.dimanche.map(p => (
                      <div key={p.id} className="cal-item cal-item-dim">
                        <span style={{fontSize:'.79rem'}}>{p.name}</span>
                        {p.phone && <a href={`tel:${p.phone}`} className="btn btn-sm" style={{background:'var(--warning)',color:'white',padding:'.2rem .45rem'}}><i className="fas fa-phone"></i></a>}
                      </div>
                    )) : <div style={{color:'var(--text-light)',fontSize:'.77rem',padding:'.2rem 0'}}><i className="fas fa-minus"></i> Non planifié</div>}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── SETTINGS / PROFIL ── */}
        {tab === 'settings' && (
          <>
            <div className="card" style={{textAlign:'center',paddingTop:'2rem',paddingBottom:'2rem'}}>
              <div className="profile-avatar">{initials}</div>
              <div style={{fontWeight:700,fontSize:'1.1rem'}}>{profileAdmin.full_name || profileAdmin.username}</div>
              <div style={{color:'var(--text-light)',fontSize:'.85rem',marginTop:'.25rem'}}>
                <span className="badge badge-blue"><i className="fas fa-user-tie"></i> Admin Local</span>
                {commune.name && <span style={{marginLeft:'.5rem'}} className="badge" style={{background:'var(--primary-light)',color:'var(--primary-dark)'}}><i className="fas fa-map-marker-alt"></i> {commune.name}</span>}
              </div>
              <div style={{display:'flex',justifyContent:'center',gap:'2rem',marginTop:'1rem',fontSize:'.8rem',color:'var(--text-light)'}}>
                <span><strong style={{color:'var(--text)'}}>ID</strong> #{profileAdmin.id}</span>
                <span><strong style={{color:'var(--text)'}}>Rôle</strong> {profileAdmin.role}</span>
                <span><strong style={{color:'var(--text)'}}>Commune</strong> {commune.name}</span>
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

      {/* MODAL EDIT */}
      {editModal && (
        <div className="modal-bg" onClick={e => { if (e.target===e.currentTarget) setEditModal(null) }}>
          <div className="modal">
            <h3><i className="fas fa-edit" style={{color:'var(--primary)'}}></i> Modifier la pharmacie</h3>
            <form onSubmit={saveEdit}>
              <div className="form-grid">
                <div className="form-group" style={{gridColumn:'1/-1'}}><label>Nom *</label><input value={editModal.name} onChange={e=>setEditModal(m=>({...m,name:e.target.value}))} required /></div>
                <div className="form-group" style={{gridColumn:'1/-1'}}><label>Médecin responsable</label><input value={editModal.doctor||''} onChange={e=>setEditModal(m=>({...m,doctor:e.target.value}))} placeholder="Dr Prénom Nom" /></div>
                <div className="form-group"><label>Téléphone</label><input value={editModal.phone||''} onChange={e=>setEditModal(m=>({...m,phone:e.target.value}))} /></div>
                <div className="form-group" style={{gridColumn:'1/-1'}}><label>Adresse</label><input value={editModal.address||''} onChange={e=>setEditModal(m=>({...m,address:e.target.value}))} /></div>
                <div className="form-group"><label>Latitude GPS</label><input type="number" step="0.000001" value={editModal.lat||''} onChange={e=>setEditModal(m=>({...m,lat:e.target.value}))} /></div>
                <div className="form-group"><label>Longitude GPS</label><input type="number" step="0.000001" value={editModal.lng||''} onChange={e=>setEditModal(m=>({...m,lng:e.target.value}))} /></div>
                <div className="form-group" style={{justifyContent:'flex-end',paddingTop:'1rem'}}>
                  <label style={{display:'flex',alignItems:'center',gap:'.5rem',cursor:'pointer'}}>
                    <input type="checkbox" checked={!!editModal.is_active} onChange={e=>setEditModal(m=>({...m,is_active:e.target.checked}))} style={{width:'auto'}} /> Active
                  </label>
                </div>
              </div>
              <div style={{display:'flex',gap:'.75rem',marginTop:'.75rem'}}>
                <button type="submit" className="btn btn-success"><i className="fas fa-save"></i> Enregistrer</button>
                <button type="button" className="btn btn-danger" onClick={()=>setEditModal(null)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {msg && <div className="flash" style={{background: msgType==='err' ? 'var(--danger)' : '#1f2937'}}>{msg}</div>}
    </>
  )
}

export async function getServerSideProps({ req, res }) {
  const session = await getSession(req, res)
  if (!session.admin) return { redirect: { destination: '/admin/login', permanent: false } }
  if (session.admin.role === 'super_admin') return { redirect: { destination: '/admin/super/dashboard', permanent: false } }

  const admin     = session.admin
  const communeId = parseInt(admin.communeId)
  if (!communeId) return { redirect: { destination: '/admin/login', permanent: false } }

  const sql = getDB()

  const [communeRows, pharmaciesRows, adminRows] = await Promise.all([
    sql`SELECT id, name, slug FROM communes WHERE id = ${communeId} LIMIT 1`,
    sql`SELECT * FROM pharmacies WHERE commune_id = ${communeId} ORDER BY name`,
    sql`SELECT id, username, full_name, email, role FROM admins WHERE id = ${admin.id} LIMIT 1`,
  ])
  const commune    = communeRows[0]
  const pharmacies = pharmaciesRows
  const adminFull  = adminRows[0] || {}

  // 4 semaines à partir du samedi courant
  const today    = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const lastSat  = new Date(today)
  while (lastSat.getDay() !== 6) lastSat.setDate(lastSat.getDate() - 1)

  const planEnd = new Date(lastSat); planEnd.setDate(planEnd.getDate() + 27)
  const wsStr   = lastSat.toISOString().split('T')[0]
  const weStr   = planEnd.toISOString().split('T')[0]

  const gardeRows = await sql`
    SELECT g.id, g.garde_date, g.garde_type, p.id AS pid, p.name, p.phone, p.latitude, p.longitude
    FROM garde g JOIN pharmacies p ON p.id = g.pharmacy_id
    WHERE g.commune_id = ${communeId} AND g.garde_date BETWEEN ${wsStr} AND ${weStr}
    ORDER BY g.garde_date, p.name`

  const byDate = {}
  for (const r of gardeRows) {
    const key = r.garde_date instanceof Date ? r.garde_date.toISOString().split('T')[0] : String(r.garde_date).split('T')[0]
    if (!byDate[key]) byDate[key] = { nuit:[], dimanche:[] }
    const t = r.garde_type === 'nuit' ? 'nuit' : 'dimanche'
    if (!byDate[key][t].find(x => x.id === r.pid)) {
      byDate[key][t].push({ id: r.pid, name: r.name, phone: r.phone||null, latitude: r.latitude?.toString()||null, longitude: r.longitude?.toString()||null })
    }
  }

  const weeks4 = []
  for (let w = 0; w < 4; w++) {
    const ws = new Date(lastSat); ws.setDate(ws.getDate() + w * 7)
    const we = new Date(ws);       we.setDate(we.getDate() + 6)
    const nuit = [], dimanche = [], seen = { nuit: new Set(), dimanche: new Set() }
    const days = []
    for (let d = 0; d <= 6; d++) {
      const dk    = new Date(ws); dk.setDate(dk.getDate() + d)
      const dkStr = dk.toISOString().split('T')[0]
      const dayData = byDate[dkStr] || { nuit:[], dimanche:[] }
      days.push({ date: dkStr, nuit: dayData.nuit, dimanche: dayData.dimanche })
      for (const p of dayData.nuit)     { if (!seen.nuit.has(p.id))     { nuit.push(p);     seen.nuit.add(p.id) } }
      for (const p of dayData.dimanche) { if (!seen.dimanche.has(p.id)) { dimanche.push(p); seen.dimanche.add(p.id) } }
    }
    const isCurrent = todayStr >= ws.toISOString().split('T')[0] && todayStr <= we.toISOString().split('T')[0]
    weeks4.push({
      startStr:   ws.toISOString().split('T')[0],
      startLabel: `${ws.getDate()}/${String(ws.getMonth()+1).padStart(2,'0')}`,
      endLabel:   `${we.getDate()}/${String(we.getMonth()+1).padStart(2,'0')}/${we.getFullYear()}`,
      isCurrent,
      nuit,
      dimanche,
      days,
    })
  }

  return {
    props: {
      adminInit:      { id: String(admin.id), username: admin.username, full_name: admin.full_name||'', email: adminFull.email||'', role: admin.role, communeId: String(communeId) },
      commune:        { id: String(commune.id), name: commune.name, slug: commune.slug },
      pharmaciesInit: pharmacies.map(p => ({ ...p, id: p.id.toString(), commune_id: p.commune_id.toString(), latitude: p.latitude?.toString()||null, longitude: p.longitude?.toString()||null })),
      weeks4:         JSON.parse(JSON.stringify(weeks4)),
      today:          todayStr,
    }
  }
}
