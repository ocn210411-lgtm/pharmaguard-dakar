import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || 'Identifiants incorrects'); return }
    if (data.role === 'super_admin') router.push('/admin/super/dashboard')
    else router.push('/admin/local/dashboard')
  }

  return (
    <>
      <Head>
        <title>Connexion Admin – PharmaGuard Dakar</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Poppins',sans-serif;min-height:100vh;overflow:hidden}

        /* ── LAYOUT ── */
        .login-wrapper{display:grid;grid-template-columns:1fr 480px;min-height:100vh}

        /* ── LEFT PANEL ── */
        .panel-left{
          position:relative;
          background:linear-gradient(145deg,#003f7f 0%,#0077b6 40%,#00AEEF 100%);
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:3rem;overflow:hidden;
        }
        .bg-blur-1{position:absolute;width:500px;height:500px;border-radius:50%;background:rgba(255,255,255,.06);top:-120px;left:-140px;animation:drift 12s ease-in-out infinite}
        .bg-blur-2{position:absolute;width:380px;height:380px;border-radius:50%;background:rgba(255,255,255,.05);bottom:-80px;right:-80px;animation:drift 16s ease-in-out infinite reverse}
        .bg-blur-3{position:absolute;width:220px;height:220px;border-radius:50%;background:rgba(255,255,255,.07);top:50%;left:60%;animation:drift 10s ease-in-out infinite 3s}
        @keyframes drift{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-30px) scale(1.08)}}

        .grid-lines{
          position:absolute;inset:0;
          background-image:
            linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),
            linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);
          background-size:50px 50px;
        }

        /* floating pills */
        .float-icon{
          position:absolute;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);
          border-radius:16px;display:flex;align-items:center;justify-content:center;
          color:rgba(255,255,255,.7);backdrop-filter:blur(4px);
          animation:float 6s ease-in-out infinite;
        }
        .fi-1{width:56px;height:56px;font-size:1.4rem;top:12%;left:8%;animation-delay:0s}
        .fi-2{width:46px;height:46px;font-size:1.1rem;top:22%;right:14%;animation-delay:1.5s}
        .fi-3{width:52px;height:52px;font-size:1.3rem;bottom:28%;left:10%;animation-delay:3s}
        .fi-4{width:42px;height:42px;font-size:1rem;bottom:18%;right:10%;animation-delay:.8s}
        .fi-5{width:38px;height:38px;font-size:.9rem;top:60%;left:20%;animation-delay:2.2s}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}

        .left-content{position:relative;z-index:2;text-align:center;max-width:460px}

        .brand-badge{
          display:inline-flex;align-items:center;gap:.6rem;
          background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);
          border-radius:50px;padding:.45rem 1.1rem;margin-bottom:2rem;
          font-size:.78rem;font-weight:600;color:rgba(255,255,255,.9);letter-spacing:.04em;text-transform:uppercase;
          backdrop-filter:blur(8px);animation:fadeDown .7s ease both;
        }
        .brand-badge i{color:#7dd3fc}

        .brand-logo{
          width:90px;height:90px;border-radius:28px;
          background:rgba(255,255,255,.15);border:2px solid rgba(255,255,255,.25);
          display:flex;align-items:center;justify-content:center;
          font-size:2.4rem;color:white;margin:0 auto 1.6rem;
          box-shadow:0 20px 60px rgba(0,0,0,.2),inset 0 1px 0 rgba(255,255,255,.3);
          animation:fadeDown .7s .1s ease both;backdrop-filter:blur(10px);
        }

        .left-title{font-size:clamp(2rem,3.5vw,2.8rem);font-weight:900;color:white;line-height:1.15;margin-bottom:1rem;animation:fadeDown .7s .2s ease both}
        .left-title span{color:#7dd3fc}
        .left-sub{font-size:1rem;color:rgba(255,255,255,.7);line-height:1.7;margin-bottom:2.5rem;animation:fadeDown .7s .3s ease both}

        .features{display:flex;flex-direction:column;gap:.85rem;animation:fadeDown .7s .4s ease both}
        .feat{display:flex;align-items:center;gap:.9rem;text-align:left}
        .feat-icon{width:40px;height:40px;border-radius:12px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;font-size:.95rem;color:#7dd3fc;flex-shrink:0}
        .feat-text{font-size:.88rem;color:rgba(255,255,255,.85);font-weight:500}

        /* ── RIGHT PANEL ── */
        .panel-right{
          background:#f8faff;display:flex;align-items:center;justify-content:center;
          padding:2.5rem;position:relative;
        }
        .panel-right::before{
          content:'';position:absolute;left:0;top:0;bottom:0;width:1px;
          background:linear-gradient(to bottom,transparent,rgba(0,174,239,.2),transparent);
        }

        .form-card{width:100%;max-width:400px;animation:fadeUp .6s .1s ease both}

        .form-header{margin-bottom:2.2rem}
        .welcome-tag{font-size:.75rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#00AEEF;margin-bottom:.5rem}
        .form-title{font-size:1.9rem;font-weight:800;color:#0f172a;line-height:1.2}
        .form-title span{color:#00AEEF}
        .form-sub{font-size:.875rem;color:#64748b;margin-top:.5rem}

        /* inputs */
        .field{margin-bottom:1.4rem}
        .field label{display:block;font-size:.82rem;font-weight:700;color:#1e293b;margin-bottom:.5rem;letter-spacing:.01em}
        .input-box{
          position:relative;background:white;border:2px solid #e2e8f0;border-radius:14px;
          display:flex;align-items:center;gap:.75rem;padding:.8rem 1rem;
          transition:border .2s,box-shadow .2s;
        }
        .input-box:focus-within{border-color:#00AEEF;box-shadow:0 0 0 4px rgba(0,174,239,.1)}
        .input-box .icon{color:#94a3b8;font-size:.95rem;flex-shrink:0;width:18px;text-align:center}
        .input-box input{flex:1;border:none;outline:none;font-family:'Poppins',sans-serif;font-size:.92rem;color:#0f172a;background:transparent}
        .input-box input::placeholder{color:#cbd5e1}
        .input-box .toggle{background:none;border:none;cursor:pointer;color:#94a3b8;padding:.1rem;font-size:.9rem;transition:color .15s}
        .input-box .toggle:hover{color:#00AEEF}

        /* error */
        .error-box{
          background:#fff1f2;border:1.5px solid #fecdd3;border-radius:12px;
          padding:.8rem 1rem;display:flex;align-items:center;gap:.6rem;
          margin-bottom:1.3rem;animation:shake .4s ease;
        }
        .error-box i{color:#f43f5e;font-size:.9rem;flex-shrink:0}
        .error-box span{font-size:.83rem;color:#be123c;font-weight:500}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}

        /* submit */
        .btn-submit{
          width:100%;padding:.95rem;border:none;border-radius:14px;
          background:linear-gradient(135deg,#00AEEF,#0077b6);
          color:white;font-family:'Poppins',sans-serif;font-size:1rem;font-weight:700;
          cursor:pointer;transition:all .2s;margin-top:.3rem;
          box-shadow:0 8px 24px rgba(0,119,182,.35);
          display:flex;align-items:center;justify-content:center;gap:.6rem;
          position:relative;overflow:hidden;
        }
        .btn-submit::before{
          content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,.15),transparent);
        }
        .btn-submit:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,119,182,.45)}
        .btn-submit:active:not(:disabled){transform:translateY(0)}
        .btn-submit:disabled{opacity:.65;cursor:not-allowed;transform:none}
        .spin{animation:spin .8s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}

        /* divider */
        .divider{text-align:center;margin:1.5rem 0;position:relative}
        .divider::before{content:'';position:absolute;top:50%;left:0;right:0;height:1px;background:#e2e8f0}
        .divider span{background:#f8faff;position:relative;padding:0 1rem;font-size:.78rem;color:#94a3b8;font-weight:500}

        .back-link{
          display:flex;align-items:center;justify-content:center;gap:.5rem;
          color:#64748b;font-size:.83rem;text-decoration:none;
          transition:color .15s;font-weight:500;
        }
        .back-link:hover{color:#00AEEF}

        /* animations */
        @keyframes fadeDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}

        /* footer left */
        .left-footer{
          position:absolute;bottom:1.8rem;left:0;right:0;text-align:center;
          font-size:.75rem;color:rgba(255,255,255,.45);
        }

        /* ── MOBILE ── */
        @media(max-width:860px){
          body{overflow:auto}
          .login-wrapper{grid-template-columns:1fr;grid-template-rows:auto 1fr}
          .panel-left{padding:2.5rem 2rem;min-height:auto}
          .bg-blur-1,.bg-blur-2,.bg-blur-3{display:none}
          .fi-3,.fi-4,.fi-5{display:none}
          .left-title{font-size:1.8rem}
          .features{display:none}
          .left-sub{display:none}
          .left-footer{display:none}
          .brand-logo{width:68px;height:68px;font-size:1.8rem;margin-bottom:1rem}
          .panel-left::before{display:none}
          .panel-right::before{display:none}
          .panel-right{padding:2rem 1.5rem}
        }
        @media(max-width:480px){
          input,select{font-size:16px}
          .form-title{font-size:1.6rem}
        }
      `}</style>

      <div className="login-wrapper">

        {/* ── PANNEAU GAUCHE ── */}
        <div className="panel-left">
          <div className="bg-blur-1"></div>
          <div className="bg-blur-2"></div>
          <div className="bg-blur-3"></div>
          <div className="grid-lines"></div>

          {/* icônes flottantes */}
          <div className="float-icon fi-1"><i className="fas fa-pills"></i></div>
          <div className="float-icon fi-2"><i className="fas fa-moon"></i></div>
          <div className="float-icon fi-3"><i className="fas fa-stethoscope"></i></div>
          <div className="float-icon fi-4"><i className="fas fa-map-marker-alt"></i></div>
          <div className="float-icon fi-5"><i className="fas fa-clock"></i></div>

          <div className="left-content">
            <div className="brand-badge">
              <i className="fas fa-shield-alt"></i>
              Espace Administration
            </div>
            <div className="brand-logo">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h1 className="left-title">
              Pharma<span>Guard</span><br />Dakar
            </h1>
            <p className="left-sub">
              Gestion centralisée des pharmacies de garde<br />
              à travers toutes les communes de Dakar.
            </p>
            <div className="features">
              <div className="feat">
                <div className="feat-icon"><i className="fas fa-map"></i></div>
                <div className="feat-text">26 communes couvertes dans la région de Dakar</div>
              </div>
              <div className="feat">
                <div className="feat-icon"><i className="fas fa-moon"></i></div>
                <div className="feat-text">Plannings de garde nuit & dimanche en temps réel</div>
              </div>
              <div className="feat">
                <div className="feat-icon"><i className="fas fa-users-cog"></i></div>
                <div className="feat-text">Administration multi-niveaux : super admin & admins locaux</div>
              </div>
              <div className="feat">
                <div className="feat-icon"><i className="fas fa-mobile-alt"></i></div>
                <div className="feat-text">Accessible sur mobile, tablette et desktop</div>
              </div>
            </div>
          </div>

          <div className="left-footer">© 2025 PharmaGuard Dakar — Tous droits réservés</div>
        </div>

        {/* ── PANNEAU DROIT ── */}
        <div className="panel-right">
          <div className="form-card">
            <div className="form-header">
              <div className="welcome-tag">Bienvenue</div>
              <div className="form-title">Connectez-vous à<br /><span>votre espace</span></div>
              <div className="form-sub">Entrez vos identifiants pour accéder au tableau de bord.</div>
            </div>

            {error && (
              <div className="error-box">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Nom d&apos;utilisateur</label>
                <div className="input-box">
                  <i className="fas fa-user icon"></i>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="ex: dr.khady"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="field">
                <label>Mot de passe</label>
                <div className="input-box">
                  <i className="fas fa-lock icon"></i>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" className="toggle" onClick={() => setShowPw(p => !p)} tabIndex={-1}>
                    <i className={`fas ${showPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              <button className="btn-submit" type="submit" disabled={loading}>
                {loading
                  ? <><i className="fas fa-circle-notch spin"></i> Connexion en cours…</>
                  : <><i className="fas fa-sign-in-alt"></i> Se connecter</>
                }
              </button>
            </form>

            <div className="divider"><span>ou</span></div>

            <a href="/" className="back-link">
              <i className="fas fa-arrow-left"></i> Retour au site public
            </a>
          </div>
        </div>

      </div>
    </>
  )
}
