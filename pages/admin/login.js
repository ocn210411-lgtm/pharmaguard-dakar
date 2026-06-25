import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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
    if (!res.ok) { setError(data.error || 'Erreur de connexion'); return }
    if (data.role === 'super_admin') router.push('/admin/super/dashboard')
    else router.push('/admin/local/dashboard')
  }

  return (
    <>
      <Head>
        <title>Connexion Admin – PharmaGuard Dakar</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'Poppins',sans-serif;background:linear-gradient(135deg,#0077b6,#00AEEF);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1rem}
        .card{background:white;border-radius:24px;padding:2.5rem 2rem;width:100%;max-width:420px;box-shadow:0 24px 60px rgba(0,0,0,.18)}
        .logo{text-align:center;margin-bottom:2rem}
        .logo-icon{width:64px;height:64px;border-radius:18px;background:linear-gradient(135deg,#00AEEF,#0077b6);display:inline-flex;align-items:center;justify-content:center;font-size:1.6rem;color:white;margin-bottom:.8rem}
        .logo h1{font-size:1.4rem;font-weight:800;color:#1f2937}
        .logo p{font-size:.85rem;color:#6b7280;margin-top:.2rem}
        label{display:block;font-size:.82rem;font-weight:700;color:#374151;margin-bottom:.4rem}
        .input-wrap{position:relative;margin-bottom:1.1rem}
        .input-wrap i{position:absolute;left:.9rem;top:50%;transform:translateY(-50%);color:#9ca3af;font-size:.9rem}
        input{width:100%;border:2px solid #e5e7eb;border-radius:10px;padding:.7rem .9rem .7rem 2.5rem;font-family:'Poppins',sans-serif;font-size:.9rem;outline:none;transition:border .2s}
        input:focus{border-color:#00AEEF}
        .error{background:#fef2f2;border:1px solid #fecaca;color:#dc2626;border-radius:10px;padding:.7rem 1rem;font-size:.85rem;margin-bottom:1rem;display:flex;align-items:center;gap:.5rem}
        .btn-login{width:100%;background:linear-gradient(135deg,#00AEEF,#0077b6);color:white;border:none;border-radius:12px;padding:.85rem;font-family:'Poppins',sans-serif;font-size:1rem;font-weight:700;cursor:pointer;margin-top:.5rem;transition:opacity .2s}
        .btn-login:hover{opacity:.9}
        .btn-login:disabled{opacity:.6;cursor:not-allowed}
        .back{display:block;text-align:center;margin-top:1.2rem;color:#6b7280;font-size:.85rem;text-decoration:none}
        .back:hover{color:#00AEEF}
      `}</style>

      <div className="card">
        <div className="logo">
          <div className="logo-icon"><i className="fas fa-shield-alt"></i></div>
          <h1>PharmaGuard Dakar</h1>
          <p>Espace administrateur</p>
        </div>

        {error && <div className="error"><i className="fas fa-exclamation-circle"></i>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div>
            <label>Nom d&apos;utilisateur</label>
            <div className="input-wrap">
              <i className="fas fa-user"></i>
              <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="dr.khady" required />
            </div>
          </div>
          <div>
            <label>Mot de passe</label>
            <div className="input-wrap">
              <i className="fas fa-lock"></i>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
          </div>
          <button className="btn-login" type="submit" disabled={loading}>
            {loading ? <><i className="fas fa-spinner fa-spin"></i> Connexion…</> : <><i className="fas fa-sign-in-alt"></i> Se connecter</>}
          </button>
        </form>
        <a href="/" className="back"><i className="fas fa-arrow-left"></i> Retour au site</a>
      </div>
    </>
  )
}
