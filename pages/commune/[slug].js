import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import { getCommuneBySlug, getWeekGuards, getGuardsByDateRange, getPharmaciesByCommune } from '../../lib/functions'

const MOIS_FR = ['','janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
const JOURS_FR = ['dim','lun','mar','mer','jeu','ven','sam']

function h(s) { return String(s || '') }

export default function CommunePage({ commune, nuitThisWeek, dimancheThisWeek, weekStartStr, weekEndStr, dates, schedule, allPharms, pharmsJs, isSingleZone }) {
  const weekStart = new Date(weekStartStr + 'T12:00:00')
  const weekEnd   = new Date(weekEndStr   + 'T12:00:00')
  const today     = new Date().toISOString().split('T')[0]
  const isSunday  = new Date().getDay() === 0

  const thisSunday = new Date(weekStart)
  thisSunday.setDate(thisSunday.getDate() + 1)

  // ── State React ──────────────────────────────────────────────
  const [activeTab, setActiveTab]         = useState('today')
  const [searchOpen, setSearchOpen]       = useState(false)
  const [searchQuery, setSearchQuery]     = useState('')
  const [pharmModal, setPharmModal]       = useState(null)
  const searchInputRef                    = useRef(null)

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 80)
  }, [searchOpen])

  useEffect(() => {
    const handleKey = e => { if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery(''); setPharmModal(null) } }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  // ── Recherche ────────────────────────────────────────────────
  const q = searchQuery.trim().toLowerCase()
  const matches = q ? pharmsJs.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.doctor.toLowerCase().includes(q) ||
    p.address.toLowerCase().includes(q)
  ) : []
  const gardesResults = matches.filter(p => p.garde)
  const autresResults = matches.filter(p => !p.garde)

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={`Pharmacies de garde à ${commune.name} – PharmaGuard Dakar`} />
        <title>{commune.name} – PharmaGuard Dakar</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>

      <style>{`
        :root{
          --primary:#00AEEF;--primary-dark:#0077b6;--primary-light:#e0f7ff;
          --success:#10b981;--text:#1f2937;--text-light:#6b7280;
          --bg:#f0f9ff;--radius:16px;
          --shadow-sm:0 2px 8px rgba(0,0,0,.08);
          --shadow-md:0 6px 20px rgba(0,0,0,.12);
          --transition:.25s cubic-bezier(.4,0,.2,1);
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        body{font-family:'Poppins',sans-serif;background:var(--bg);color:var(--text)}
        .navbar{
          background:linear-gradient(135deg,rgba(0,174,239,.97),rgba(0,119,182,.97));
          padding:.85rem 1.5rem;display:flex;align-items:center;justify-content:space-between;
          position:sticky;top:0;z-index:999;box-shadow:0 2px 16px rgba(0,119,182,.25);
          gap:.5rem;
        }
        .navbar-back{color:white;text-decoration:none;font-weight:700;display:flex;align-items:center;gap:.5rem;padding:.45rem .85rem;border-radius:8px;background:rgba(255,255,255,.15);transition:background var(--transition);font-size:.9rem;flex-shrink:0}
        .navbar-back:hover{background:rgba(255,255,255,.25)}
        .navbar-title{color:white;font-weight:800;font-size:1rem;display:flex;align-items:center;gap:.4rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1;justify-content:center}
        .navbar-title-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .navbar-action{color:rgba(255,255,255,.85);background:none;border:none;cursor:pointer;padding:.45rem .7rem;border-radius:8px;transition:background var(--transition);font-size:1rem}
        .navbar-action:hover{background:rgba(255,255,255,.18);color:white}
        .navbar-brand{color:white;font-weight:800;font-size:1rem;display:flex;align-items:center;gap:.5rem;letter-spacing:-.01em;flex-shrink:0}
        .navbar-brand i{color:rgba(255,255,255,.75)}
        .navbar-action{flex-shrink:0}
        .commune-hero{background:linear-gradient(150deg,var(--primary),var(--primary-dark),#004f78);color:white;padding:2.5rem 1.5rem 4.5rem;text-align:center;position:relative;overflow:hidden}
        .commune-hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 20% 70%,rgba(255,255,255,.08) 0%,transparent 55%),radial-gradient(ellipse at 80% 20%,rgba(0,212,255,.1) 0%,transparent 55%);pointer-events:none}
        .commune-hero-content{position:relative;z-index:1}
        .commune-icon{width:64px;height:64px;background:rgba(255,255,255,.18);border-radius:18px;display:inline-flex;align-items:center;justify-content:center;font-size:1.8rem;margin-bottom:1rem;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.25)}
        .commune-hero h1{font-size:clamp(1.8rem,5vw,2.8rem);font-weight:800;margin-bottom:.4rem;letter-spacing:-.02em}
        .commune-hero p{opacity:.88;font-size:.95rem;font-weight:300}
        .hero-wave{position:absolute;bottom:-1px;left:0;right:0;line-height:0}
        .hero-wave svg{display:block;width:100%}
        .container{max-width:1100px;margin:0 auto;padding:0 1.2rem}
        .section{padding:2.2rem 1.2rem}
        .stats-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:2rem;margin-top:-2rem;position:relative;z-index:10}
        .stat-box{background:white;border-radius:var(--radius);padding:1.3rem 1rem;text-align:center;box-shadow:var(--shadow-md);transition:all var(--transition)}
        .stat-box:hover{transform:translateY(-3px);box-shadow:0 10px 30px rgba(0,0,0,.14)}
        .stat-icon-wrap{width:44px;height:44px;border-radius:12px;background:var(--primary-light);color:var(--primary);display:inline-flex;align-items:center;justify-content:center;font-size:1.1rem;margin-bottom:.6rem}
        .stat-num{font-size:1.9rem;font-weight:800;color:var(--text);line-height:1}
        .stat-lbl{font-size:.74rem;color:var(--text-light);margin-top:.2rem}
        .tabs-wrap{background:white;border-radius:var(--radius);padding:.4rem;box-shadow:0 2px 8px rgba(0,0,0,.08);display:inline-flex;gap:.2rem;margin-bottom:2rem;flex-wrap:wrap}
        .tab{padding:.6rem 1.2rem;border-radius:10px;border:none;color:var(--text-light);font-weight:600;cursor:pointer;font-family:'Poppins',sans-serif;font-size:.875rem;transition:all var(--transition);background:none;display:flex;align-items:center;gap:.45rem}
        .tab:hover{color:var(--primary-dark);background:var(--primary-light)}
        .tab.active{background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:white;box-shadow:0 4px 12px rgba(0,174,239,.3)}
        .tab-content{display:none}
        .tab-content.active{display:block;animation:fadeIn .25s ease}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .section-title{font-size:1.3rem;font-weight:800;background:linear-gradient(135deg,var(--primary),var(--primary-dark));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:1.5rem;display:flex;align-items:center;gap:.6rem;letter-spacing:-.01em}
        .guard-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:1.2rem}
        .pharm-card{background:white;border-radius:var(--radius);padding:1.4rem;box-shadow:var(--shadow-sm);border-left:4px solid var(--success);transition:all var(--transition);position:relative;overflow:hidden}
        .pharm-card::after{content:'';position:absolute;top:0;right:0;width:70px;height:70px;background:radial-gradient(circle,rgba(16,185,129,.07) 0%,transparent 70%);pointer-events:none}
        .pharm-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-md)}
        .pharm-header{display:flex;gap:.9rem;margin-bottom:.9rem;align-items:flex-start}
        .pharm-icon{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,rgba(16,185,129,.15),rgba(16,185,129,.05));color:var(--success);display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
        .pharm-name{font-weight:700;font-size:1rem;line-height:1.3;margin-bottom:.35rem}
        .badges{display:flex;flex-wrap:wrap;gap:.3rem}
        .badge{display:inline-flex;align-items:center;gap:.3rem;border-radius:20px;font-size:.68rem;font-weight:700;padding:.2rem .65rem}
        .badge-green{background:linear-gradient(135deg,var(--success),#059669);color:white}
        .pulse-dot{width:6px;height:6px;border-radius:50%;background:white;animation:pulseDot 2s infinite;flex-shrink:0}
        @keyframes pulseDot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.8)}}
        .detail-line{display:flex;align-items:flex-start;gap:.6rem;font-size:.86rem;color:var(--text-light);margin-bottom:.45rem}
        .detail-icon{width:26px;height:26px;border-radius:7px;background:var(--primary-light);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:.72rem;flex-shrink:0}
        .detail-line a{color:var(--primary);text-decoration:none;font-weight:600}
        .pharm-actions{display:flex;gap:.6rem;margin-top:1rem}
        .btn{flex:1;padding:.6rem .8rem;border:none;border-radius:10px;font-weight:600;cursor:pointer;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:.4rem;font-size:.85rem;min-height:42px;transition:all var(--transition);font-family:'Poppins',sans-serif}
        .btn-primary{background:linear-gradient(135deg,var(--primary),var(--primary-dark));color:white;box-shadow:0 4px 12px rgba(0,174,239,.3)}
        .btn-secondary{background:var(--primary-light);color:var(--primary-dark)}
        .btn:hover{transform:translateY(-2px)}
        .calendar-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:1rem}
        .cal-card{background:white;border-radius:var(--radius);padding:1.1rem;box-shadow:var(--shadow-sm);transition:all var(--transition)}
        .cal-card:hover{box-shadow:var(--shadow-md)}
        .cal-card.today-card{border:2px solid var(--success);box-shadow:0 0 0 3px rgba(16,185,129,.12)}
        .cal-date{font-weight:700;margin-bottom:.7rem;font-size:.88rem;display:flex;align-items:center;gap:.5rem;color:var(--text-light)}
        .cal-date.today{color:var(--success)}
        .cal-date-badge{background:var(--primary-light);color:var(--primary-dark);border-radius:6px;padding:.1rem .45rem;font-size:.72rem;font-weight:700}
        .cal-date.today .cal-date-badge{background:var(--success);color:white}
        .cal-item{display:flex;align-items:center;justify-content:space-between;background:var(--primary-light);border-radius:8px;padding:.5rem .75rem;margin-bottom:.35rem;font-size:.83rem}
        .cal-item-name{display:flex;align-items:center;gap:.5rem;font-weight:600;color:var(--text)}
        .cal-phone-btn{color:var(--primary);font-size:.88rem;text-decoration:none;width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(0,174,239,.1);transition:all var(--transition);flex-shrink:0}
        .cal-empty{color:var(--text-light);font-size:.82rem;padding:.4rem 0;display:flex;align-items:center;gap:.4rem}
        .empty{text-align:center;padding:3rem 2rem;background:white;border-radius:var(--radius);box-shadow:var(--shadow-sm)}
        .empty-icon{width:64px;height:64px;border-radius:18px;background:var(--primary-light);color:var(--primary);display:inline-flex;align-items:center;justify-content:center;font-size:1.6rem;margin-bottom:1rem}
        .empty p{color:var(--text-light);line-height:1.7;font-size:.9rem}
        footer{background:linear-gradient(135deg,#1f2937,#111827);color:rgba(255,255,255,.7);padding:1.5rem;text-align:center;font-size:.85rem}
        footer a{color:rgba(255,255,255,.6);text-decoration:none;margin:0 .5rem;transition:color var(--transition)}
        /* Search overlay */
        .search-overlay{position:fixed;inset:0;z-index:2000;background:rgba(0,30,60,.55);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:center;padding-top:80px;padding-left:1rem;padding-right:1rem;opacity:0;pointer-events:none;transition:opacity .2s ease}
        .search-overlay.open{opacity:1;pointer-events:all}
        .search-box{width:100%;max-width:620px;background:white;border-radius:20px;box-shadow:0 24px 60px rgba(0,0,0,.28);overflow:hidden;transform:translateY(-16px);transition:transform .22s cubic-bezier(.34,1.56,.64,1)}
        .search-overlay.open .search-box{transform:translateY(0)}
        .search-input-row{display:flex;align-items:center;gap:.75rem;padding:1rem 1.2rem;border-bottom:1px solid #e5e7eb}
        .search-input-row i{color:var(--primary);font-size:1.1rem;flex-shrink:0}
        .search-input-row input{flex:1;border:none;outline:none;font-size:1.05rem;font-family:'Poppins',sans-serif;color:var(--text)}
        .search-close{background:none;border:none;cursor:pointer;color:var(--text-light);font-size:1.1rem;padding:.3rem;border-radius:8px}
        .search-results{max-height:60vh;overflow-y:auto;padding:.5rem .6rem .6rem}
        .search-hint{padding:1.4rem 1rem;text-align:center;color:var(--text-light);font-size:.88rem}
        .search-hint i{display:block;font-size:1.8rem;margin-bottom:.5rem;color:#d1d5db}
        .sr-item{display:flex;align-items:center;gap:.9rem;padding:.75rem .85rem;border-radius:12px;cursor:pointer;transition:background var(--transition);color:var(--text)}
        .sr-item:hover{background:var(--primary-light)}
        .sr-icon{width:40px;height:40px;border-radius:11px;flex-shrink:0;background:var(--primary-light);color:var(--primary);display:flex;align-items:center;justify-content:center;font-size:1rem}
        .sr-icon.garde{background:linear-gradient(135deg,rgba(16,185,129,.18),rgba(16,185,129,.06));color:var(--success)}
        .sr-name{font-weight:700;font-size:.9rem;line-height:1.3}
        .sr-meta{font-size:.76rem;color:var(--text-light);margin-top:.1rem}
        .sr-badge{margin-left:auto;flex-shrink:0;font-size:.65rem;font-weight:700;padding:.15rem .55rem;border-radius:20px}
        .sr-badge-garde{background:var(--success);color:white}
        .sr-badge-dim{background:#fef3c7;color:#92400e}
        .sr-section-title{font-size:.68rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--text-light);padding:.6rem .85rem .2rem}
        @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
        @media(max-width:640px){
          .stats-strip{grid-template-columns:1fr 1fr;gap:.7rem;margin-top:-1.5rem}
          .stats-strip .stat-box:last-child{grid-column:span 2}
          .guard-grid{grid-template-columns:1fr}
          .tabs-wrap{width:100%}
          .tab{flex:1;justify-content:center;padding:.55rem .7rem;font-size:.8rem}
          .search-overlay{padding-top:40px}
          .navbar{padding:.7rem 1rem}
          .navbar-brand-text{display:none}
          .navbar-title{font-size:.92rem}
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="navbar">
        {isSingleZone ? (
          <span className="navbar-brand">
            <i className="fas fa-shield-alt"></i>
            <span className="navbar-brand-text"> PharmaGarde</span>
          </span>
        ) : (
          <a href="/" className="navbar-back"><i className="fas fa-chevron-left"></i> Accueil</a>
        )}
        <span className="navbar-title">
          <i className="fas fa-map-marker-alt"></i>
          <span className="navbar-title-text"> {commune.name}</span>
        </span>
        <button className="navbar-action" title="Rechercher" onClick={() => setSearchOpen(true)}>
          <i className="fas fa-search"></i>
        </button>
      </nav>

      {/* SEARCH OVERLAY */}
      <div className={`search-overlay${searchOpen ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) { setSearchOpen(false); setSearchQuery('') } }}>
        <div className="search-box">
          <div className="search-input-row">
            <i className="fas fa-search"></i>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Nom, médecin, adresse…"
              autoComplete="off"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button className="search-close" onClick={() => { setSearchOpen(false); setSearchQuery('') }}><i className="fas fa-times"></i></button>
          </div>
          <div className="search-results">
            {!q ? (
              <div className="search-hint">
                <i className="fas fa-pills"></i>
                Tapez le nom d&apos;une pharmacie ou d&apos;un médecin
              </div>
            ) : matches.length === 0 ? (
              <div style={{padding:'1.5rem',textAlign:'center',color:'var(--text-light)'}}>Aucun résultat pour «{searchQuery.trim()}»</div>
            ) : (
              <>
                {gardesResults.length > 0 && <>
                  <div className="sr-section-title"><i className="fas fa-circle-dot" style={{color:'var(--success)'}}></i> En garde cette semaine</div>
                  {gardesResults.map(p => <SearchItem key={p.id} p={p} onClick={() => { setSearchOpen(false); setSearchQuery(''); setPharmModal(p) }} />)}
                </>}
                {autresResults.length > 0 && <>
                  {gardesResults.length > 0 && <div className="sr-section-title" style={{marginTop:'.4rem'}}>Toutes les pharmacies</div>}
                  {autresResults.map(p => <SearchItem key={p.id} p={p} onClick={() => { setSearchOpen(false); setSearchQuery(''); setPharmModal(p) }} />)}
                </>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* PHARMACY MODAL */}
      {pharmModal && <PharmModal p={pharmModal} onClose={() => setPharmModal(null)} />}

      {/* HERO */}
      <div className="commune-hero">
        <div className="commune-hero-content">
          <div className="commune-icon"><i className="fas fa-hospital"></i></div>
          <h1>{commune.name}</h1>
          <p>{commune.description || 'Zone de Yeumbeul et Malika – banlieue dakaroise'}</p>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" fill="#f0f9ff"/>
          </svg>
        </div>
      </div>

      <div className="container section">

        {/* STATS */}
        <div className="stats-strip">
          <div className="stat-box">
            <div className="stat-icon-wrap"><i className="fas fa-prescription-bottle-medical"></i></div>
            <div className="stat-num">{allPharms.length}</div>
            <div className="stat-lbl">Pharmacies</div>
          </div>
          <div className="stat-box">
            <div className="stat-icon-wrap" style={{background:'#dbeafe',color:'#1d4ed8'}}><i className="fas fa-moon"></i></div>
            <div className="stat-num">{nuitThisWeek.length}</div>
            <div className="stat-lbl">Garde nuit sem.</div>
          </div>
          <div className="stat-box">
            <div className="stat-icon-wrap" style={{background:'#fef3c7',color:'#d97706'}}><i className="fas fa-sun"></i></div>
            <div className="stat-num">{dimancheThisWeek.length}</div>
            <div className="stat-lbl">Garde dimanche</div>
          </div>
        </div>

        {/* TABS */}
        <div className="tabs-wrap">
          <button className={`tab${activeTab==='today' ? ' active' : ''}`} onClick={() => setActiveTab('today')}>
            <i className="fas fa-moon"></i> Cette semaine
            {nuitThisWeek.length > 0 && (
              <span style={{background:'var(--primary)',color:'white',borderRadius:'50px',padding:'.05rem .4rem',fontSize:'.7rem',minWidth:'18px',textAlign:'center'}}>{nuitThisWeek.length}</span>
            )}
          </button>
          <button className={`tab${activeTab==='planning' ? ' active' : ''}`} onClick={() => setActiveTab('planning')}>
            <i className="fas fa-calendar-week"></i> Planning semaine
          </button>
          <button className={`tab${activeTab==='all' ? ' active' : ''}`} onClick={() => setActiveTab('all')}>
            <i className="fas fa-list"></i> Toutes ({allPharms.length})
          </button>
        </div>

        {/* ONGLET : Cette semaine */}
        <div className={`tab-content${activeTab==='today' ? ' active' : ''}`}>
          <h2 className="section-title" style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
            <i className="fas fa-moon" style={{color:'var(--primary)'}}></i>
            Gardes de nuit
            <span style={{fontSize:'.8rem',fontWeight:500,color:'var(--text-light)',marginLeft:'.3rem',WebkitTextFillColor:'var(--text-light)'}}>
              Du {weekStart.getDate()} au {weekEnd.getDate()} {MOIS_FR[weekEnd.getMonth()+1]} {weekEnd.getFullYear()}
            </span>
          </h2>

          {nuitThisWeek.length > 0 ? (
            <div className="guard-grid" style={{marginBottom:'2rem'}}>
              {nuitThisWeek.map(p => (
                <div key={p.id} className="pharm-card">
                  <div className="pharm-header">
                    <div className="pharm-icon"><i className="fas fa-prescription-bottle-medical"></i></div>
                    <div>
                      <div className="pharm-name">{p.name}</div>
                      <div className="badges">
                        <span className="badge badge-green"><span className="pulse-dot"></span> GARDE NUIT</span>
                      </div>
                    </div>
                  </div>
                  {p.doctor && <div className="detail-line"><div className="detail-icon"><i className="fas fa-user-md"></i></div><span style={{color:'var(--primary-dark)',fontWeight:600}}>{p.doctor}</span></div>}
                  <div className="detail-line"><div className="detail-icon"><i className="fas fa-location-dot"></i></div><span>{p.address || 'Adresse non renseignée'}</span></div>
                  {p.phone && <div className="detail-line"><div className="detail-icon"><i className="fas fa-phone"></i></div><a href={`tel:${p.phone}`}>{p.phone}</a></div>}
                  <div className="pharm-actions">
                    {p.phone && <a href={`tel:${p.phone}`} className="btn btn-primary"><i className="fas fa-phone"></i> Appeler</a>}
                    {p.latitude && p.longitude && (
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary"><i className="fas fa-directions"></i> Itinéraire</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty" style={{marginBottom:'2rem'}}>
              <div className="empty-icon"><i className="fas fa-moon"></i></div>
              <p>Aucune garde de nuit enregistrée pour cette semaine.</p>
            </div>
          )}

          {/* Dimanche */}
          <h2 className="section-title" style={{display:'flex',alignItems:'center',gap:'.6rem'}}>
            <i className="fas fa-sun" style={{color:'#d97706'}}></i>
            <span style={{WebkitTextFillColor:'#d97706',background:'linear-gradient(135deg,#d97706,#b45309)',WebkitBackgroundClip:'text',backgroundClip:'text'}}>Garde du dimanche</span>
            <span style={{fontSize:'.8rem',fontWeight:500,color:'var(--text-light)',marginLeft:'.3rem',WebkitTextFillColor:'var(--text-light)'}}>
              {thisSunday.getDate()} {MOIS_FR[thisSunday.getMonth()+1]}
              {isSunday && <span style={{background:'#d97706',color:'white',borderRadius:'20px',padding:'.1rem .5rem',fontSize:'.72rem',marginLeft:'.3rem'}}>Aujourd&apos;hui</span>}
            </span>
          </h2>

          {dimancheThisWeek.length > 0 ? (
            <div className="guard-grid">
              {dimancheThisWeek.map(p => (
                <div key={p.id} className="pharm-card" style={{borderLeft:'4px solid #d97706'}}>
                  <div className="pharm-header">
                    <div className="pharm-icon" style={{background:'#fef3c7',color:'#d97706'}}><i className="fas fa-sun"></i></div>
                    <div>
                      <div className="pharm-name">{p.name}</div>
                      <div className="badges">
                        <span className="badge" style={{background:'#fef3c7',color:'#92400e'}}>GARDE DIMANCHE</span>
                      </div>
                    </div>
                  </div>
                  {p.doctor && <div className="detail-line"><div className="detail-icon" style={{background:'#fef3c7',color:'#d97706'}}><i className="fas fa-user-md"></i></div><span style={{color:'#92400e',fontWeight:600}}>{p.doctor}</span></div>}
                  <div className="detail-line"><div className="detail-icon" style={{background:'#fef3c7',color:'#d97706'}}><i className="fas fa-location-dot"></i></div><span>{p.address || 'Adresse non renseignée'}</span></div>
                  {p.phone && <div className="detail-line"><div className="detail-icon" style={{background:'#fef3c7',color:'#d97706'}}><i className="fas fa-phone"></i></div><a href={`tel:${p.phone}`} style={{color:'#d97706'}}>{p.phone}</a></div>}
                  <div className="pharm-actions">
                    {p.phone && <a href={`tel:${p.phone}`} className="btn" style={{background:'#d97706',color:'white'}}><i className="fas fa-phone"></i> Appeler</a>}
                    {p.latitude && p.longitude && (
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary"><i className="fas fa-directions"></i> Itinéraire</a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              <div className="empty-icon" style={{background:'#fef3c7',color:'#d97706'}}><i className="fas fa-sun"></i></div>
              <p>Pas encore de garde du dimanche planifiée pour ce weekend.</p>
            </div>
          )}
        </div>

        {/* ONGLET : Planning semaine */}
        <div className={`tab-content${activeTab==='planning' ? ' active' : ''}`}>
          <h2 className="section-title">
            <i className="fas fa-calendar-week"></i>
            Planning — semaine du {weekStart.getDate()} au {weekEnd.getDate()} {MOIS_FR[weekEnd.getMonth()+1]} {weekEnd.getFullYear()}
          </h2>
          <div className="calendar-grid">
            {dates.map(d => {
              const isToday = d === today
              const isDim   = new Date(d + 'T12:00:00').getDay() === 0
              const nuitDay = (schedule[d] || {}).nuit     || []
              const dimDay  = (schedule[d] || {}).dimanche || []
              const total   = nuitDay.length + dimDay.length
              const dateObj = new Date(d + 'T12:00:00')
              const label   = ['dim','lun','mar','mer','jeu','ven','sam'][dateObj.getDay()] + ' ' + dateObj.getDate() + ' ' + MOIS_FR[dateObj.getMonth()+1].slice(0,3)
              return (
                <div key={d} className={`cal-card ${isToday ? 'today-card' : ''}`}>
                  <div className={`cal-date ${isToday ? 'today' : ''}`}>
                    <i className={`fas fa-${isToday ? 'circle' : isDim ? 'sun' : 'moon'}`} style={{fontSize:'.75rem', ...(isDim && {color:'#d97706'})}}></i>
                    {isToday ? 'Aujourd\'hui — ' : ''}{label}
                    {total > 0 && <span className="cal-date-badge">{total}</span>}
                  </div>
                  {nuitDay.length > 0 && <>
                    <div style={{fontSize:'.7rem',fontWeight:700,color:'var(--primary)',margin:'.3rem 0 .2rem'}}><i className="fas fa-moon"></i> Nuit</div>
                    {nuitDay.map(g => (
                      <div key={g.id} className="cal-item">
                        <div className="cal-item-name"><i className="fas fa-prescription-bottle-medical"></i>{g.name}</div>
                        {g.phone && <a href={`tel:${g.phone}`} className="cal-phone-btn"><i className="fas fa-phone"></i></a>}
                      </div>
                    ))}
                  </>}
                  {dimDay.length > 0 && <>
                    <div style={{fontSize:'.7rem',fontWeight:700,color:'#d97706',margin:'.4rem 0 .2rem'}}><i className="fas fa-sun"></i> Dimanche</div>
                    {dimDay.map(g => (
                      <div key={g.id} className="cal-item" style={{background:'#fffbeb',borderLeft:'3px solid #d97706'}}>
                        <div className="cal-item-name" style={{color:'#92400e'}}><i className="fas fa-sun" style={{color:'#d97706'}}></i>{g.name}</div>
                        {g.phone && <a href={`tel:${g.phone}`} className="cal-phone-btn" style={{background:'rgba(217,119,6,.1)',color:'#d97706'}}><i className="fas fa-phone"></i></a>}
                      </div>
                    ))}
                  </>}
                  {nuitDay.length === 0 && dimDay.length === 0 && <div className="cal-empty"><i className="fas fa-minus"></i> Aucune garde</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* ONGLET : Toutes */}
        <div className={`tab-content${activeTab==='all' ? ' active' : ''}`}>
          <h2 className="section-title"><i className="fas fa-list"></i> Toutes les pharmacies</h2>
          <div className="guard-grid">
            {allPharms.map(p => (
              <div key={p.id} className={`pharm-card ${p.is_active ? '' : 'inactive'}`} style={{opacity:p.is_active?1:.75}}>
                <div className="pharm-header">
                  <div className="pharm-icon"><i className="fas fa-prescription-bottle-medical"></i></div>
                  <div>
                    <div className="pharm-name">{p.name}</div>
                    <div className="badges">
                      <span className={`badge ${p.is_active ? 'badge-green' : ''}`} style={!p.is_active?{background:'#e5e7eb',color:'#374151'}:{}}>{p.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>
                <div className="detail-line"><div className="detail-icon"><i className="fas fa-location-dot"></i></div><span>{p.address || '—'}</span></div>
                {p.phone && <div className="detail-line"><div className="detail-icon"><i className="fas fa-phone"></i></div><a href={`tel:${p.phone}`}>{p.phone}</a></div>}
                {p.latitude && p.longitude && (
                  <div className="pharm-actions">
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`} target="_blank" rel="noopener noreferrer" className="btn btn-primary"><i className="fas fa-directions"></i> Itinéraire</a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      <footer>
        <a href="/"><i className="fas fa-home"></i> Accueil</a> ·
        <a href="#"><i className="fas fa-search"></i> Recherche</a>
        <p style={{marginTop:'.6rem',opacity:.5}}>&copy; {new Date().getFullYear()} PharmaGuard Dakar</p>
      </footer>

    </>
  )
}

// ── Composants helper ────────────────────────────────────────────
function SearchItem({ p, onClick }) {
  return (
    <div className="sr-item" onClick={onClick}>
      <div className={`sr-icon${p.garde ? ' garde' : ''}`}><i className="fas fa-prescription-bottle-medical"></i></div>
      <div style={{flex:1,minWidth:0}}>
        <div className="sr-name">{p.name}</div>
        <div className="sr-meta">
          {p.doctor && <><i className="fas fa-user-md" style={{marginRight:'.3rem'}}></i>{p.doctor} · </>}
          {p.address || '—'}
        </div>
      </div>
      {p.garde === 'nuit'     && <span className="sr-badge sr-badge-garde"><i className="fas fa-moon"></i> NUIT</span>}
      {p.garde === 'dimanche' && <span className="sr-badge sr-badge-dim"><i className="fas fa-sun"></i> DIM.</span>}
    </div>
  )
}

function PharmModal({ p, onClose }) {
  const mapsUrl = p.lat ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}` : null
  const nuitDaysStr = p.nuitDays && p.nuitDays.length ? p.nuitDays.join(' · ') : 'cette semaine'

  return (
    <div
      style={{position:'fixed',inset:0,zIndex:3000,background:'rgba(0,30,60,.5)',backdropFilter:'blur(4px)',display:'flex',alignItems:'flex-end',justifyContent:'center'}}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{background:'white',width:'100%',maxWidth:520,borderRadius:'24px 24px 0 0',padding:'1.5rem 1.4rem 2rem',boxShadow:'0 -8px 40px rgba(0,0,0,.2)',animation:'slideUp .25s cubic-bezier(.34,1.2,.64,1)'}}>
        {/* Handle bar */}
        <div style={{width:40,height:4,background:'#e5e7eb',borderRadius:4,margin:'0 auto 1.2rem'}}></div>
        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',gap:'1rem',marginBottom:'1rem'}}>
          <div style={{width:48,height:48,borderRadius:13,background:'var(--primary-light)',color:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>
            <i className="fas fa-prescription-bottle-medical"></i>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:800,fontSize:'1.05rem',lineHeight:1.3}}>{p.name}</div>
            {p.doctor && <div style={{fontSize:'.82rem',color:'var(--primary)',fontWeight:600,marginTop:'.2rem'}}><i className="fas fa-user-md"></i> {p.doctor}</div>}
          </div>
        </div>
        {/* Garde status */}
        {p.garde === 'nuit' ? (
          <div style={{background:'#f0fdf4',border:'1.5px solid #bbf7d0',borderRadius:12,padding:'.9rem 1rem',marginBottom:'1rem',display:'flex',gap:'.75rem',alignItems:'flex-start'}}>
            <div style={{width:34,height:34,borderRadius:9,background:'var(--success)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><i className="fas fa-moon"></i></div>
            <div>
              <div style={{fontWeight:800,fontSize:'.88rem',color:'#166534'}}>EN GARDE DE NUIT cette semaine</div>
              <div style={{fontSize:'.78rem',color:'#15803d',marginTop:'.2rem'}}>{nuitDaysStr}</div>
            </div>
          </div>
        ) : p.garde === 'dimanche' ? (
          <div style={{background:'#fffbeb',border:'1.5px solid #fde68a',borderRadius:12,padding:'.9rem 1rem',marginBottom:'1rem',display:'flex',gap:'.75rem',alignItems:'flex-start'}}>
            <div style={{width:34,height:34,borderRadius:9,background:'#d97706',color:'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><i className="fas fa-sun"></i></div>
            <div>
              <div style={{fontWeight:800,fontSize:'.88rem',color:'#92400e'}}>GARDE DU DIMANCHE</div>
              <div style={{fontSize:'.78rem',color:'#b45309',marginTop:'.2rem'}}>{p.dimDate ? `Le ${p.dimDate}` : 'Ce weekend'}</div>
            </div>
          </div>
        ) : (
          <div style={{background:'#f9fafb',border:'1.5px solid #e5e7eb',borderRadius:12,padding:'.9rem 1rem',marginBottom:'1rem',display:'flex',gap:'.75rem',alignItems:'center'}}>
            <div style={{width:34,height:34,borderRadius:9,background:'#e5e7eb',color:'#9ca3af',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><i className="fas fa-moon"></i></div>
            <div>
              <div style={{fontWeight:700,fontSize:'.88rem',color:'#6b7280'}}>Pas de garde cette semaine</div>
              <div style={{fontSize:'.76rem',color:'#9ca3af',marginTop:'.1rem'}}>Consultez le planning pour la prochaine garde</div>
            </div>
          </div>
        )}
        {/* Address & phone */}
        {p.address && <div style={{display:'flex',alignItems:'center',gap:'.6rem',fontSize:'.86rem',color:'#6b7280',marginBottom:'.5rem'}}><i className="fas fa-location-dot" style={{color:'var(--primary)',width:16,flexShrink:0}}></i>{p.address}</div>}
        {p.phone
          ? <div style={{display:'flex',alignItems:'center',gap:'.6rem',fontSize:'.86rem',color:'#6b7280',marginBottom:'1.2rem'}}><i className="fas fa-phone" style={{color:'var(--primary)',width:16,flexShrink:0}}></i>{p.phone}</div>
          : <div style={{marginBottom:'1.2rem'}}></div>
        }
        {/* Actions */}
        <div style={{display:'flex',gap:'.7rem'}}>
          {p.phone && <a href={`tel:${p.phone}`} style={{flex:1,background:'linear-gradient(135deg,var(--primary),var(--primary-dark))',color:'white',border:'none',borderRadius:12,padding:'.75rem',fontWeight:700,fontSize:'.9rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'.4rem',textDecoration:'none'}}><i className="fas fa-phone"></i> Appeler</a>}
          {mapsUrl && <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{flex:1,background:'var(--primary-light)',color:'var(--primary-dark)',border:'none',borderRadius:12,padding:'.75rem',fontWeight:700,fontSize:'.9rem',display:'flex',alignItems:'center',justifyContent:'center',gap:'.4rem',textDecoration:'none'}}><i className="fas fa-directions"></i> Itinéraire</a>}
        </div>
      </div>
    </div>
  )
}

export async function getServerSideProps({ params }) {
  try {
    const commune = await getCommuneBySlug(params.slug)
    if (!commune) return { notFound: true }

    const communeId = parseInt(commune.id)
    const weekData  = await getWeekGuards(communeId)
    const { weekStart, weekEnd, nuit, dimanche } = weekData

    // 7 jours (Sam→Ven)
    const dates = []
    const cursor = new Date(weekStart)
    for (let i = 0; i < 7; i++) {
      dates.push(cursor.toISOString().split('T')[0])
      cursor.setDate(cursor.getDate() + 1)
    }

    const fmt = d => d.toISOString().split('T')[0]
    const schedule = await getGuardsByDateRange(fmt(weekStart), fmt(weekEnd), communeId)
    const allPharms = await getPharmaciesByCommune(communeId)

    // Total communes actives → isSingleZone
    const { getDB } = await import('../../lib/db')
    const sql = getDB()
    const countRows = await sql`SELECT COUNT(*) AS n FROM communes WHERE is_active = true`
    const isSingleZone = parseInt(countRows[0].n) === 1

    // Gardes par pharmacie + jours pour la recherche JS
    const gardeParPharmacie = {}
    const JOURS = ['dim','lun','mar','mer','jeu','ven','sam']
    const MOIS  = ['','janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
    for (const [date, types] of Object.entries(schedule)) {
      for (const [type, pharms] of Object.entries(types)) {
        for (const ph of pharms) {
          if (!gardeParPharmacie[ph.id]) gardeParPharmacie[ph.id] = {}
          if (!gardeParPharmacie[ph.id][type]) gardeParPharmacie[ph.id][type] = []
          gardeParPharmacie[ph.id][type].push(date)
        }
      }
    }

    const pharmsJs = allPharms.map(p => {
      const gardes = gardeParPharmacie[p.id] || {}
      const nuitDays = (gardes.nuit || []).map(d => {
        const dt = new Date(d + 'T12:00:00')
        return JOURS[dt.getDay()] + ' ' + dt.getDate()
      })
      let dimDate = null
      if (gardes.dimanche && gardes.dimanche[0]) {
        const dt = new Date(gardes.dimanche[0] + 'T12:00:00')
        dimDate = dt.getDate() + ' ' + MOIS[dt.getMonth() + 1]
      }
      return {
        id:      p.id,
        name:    p.name,
        doctor:  p.doctor || '',
        address: p.address || '',
        phone:   p.phone || '',
        lat:     p.latitude  ? parseFloat(p.latitude)  : null,
        lng:     p.longitude ? parseFloat(p.longitude) : null,
        active:  p.is_active,
        garde:   gardes.nuit ? 'nuit' : gardes.dimanche ? 'dimanche' : null,
        nuitDays,
        dimDate,
      }
    })

    return {
      props: {
        commune:          { ...commune, id: commune.id.toString() },
        nuitThisWeek:     nuit.map(p => ({ ...p, id: p.id.toString(), latitude: p.latitude?.toString() || null, longitude: p.longitude?.toString() || null })),
        dimancheThisWeek: dimanche.map(p => ({ ...p, id: p.id.toString(), latitude: p.latitude?.toString() || null, longitude: p.longitude?.toString() || null })),
        weekStartStr:     fmt(weekStart),
        weekEndStr:       fmt(weekEnd),
        dates,
        schedule:         JSON.parse(JSON.stringify(schedule)),
        allPharms:        allPharms.map(p => ({ ...p, id: p.id.toString(), latitude: p.latitude?.toString() || null, longitude: p.longitude?.toString() || null })),
        pharmsJs,
        isSingleZone,
      }
    }
  } catch (e) {
    console.error(e)
    return { notFound: true }
  }
}
