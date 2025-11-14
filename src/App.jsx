import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function LoginButton() {
  const [authUrl, setAuthUrl] = useState('')
  useEffect(() => {
    fetch(`${BACKEND}/auth/github/start`).then(r => r.json()).then(d => setAuthUrl(d.url)).catch(() => {})
  }, [])
  return (
    <a href={authUrl} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-black text-white shadow-lg shadow-black/20 hover:shadow-black/30 transition">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.485 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.464-1.11-1.464-.908-.62.069-.607.069-.607 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.833.091-.647.35-1.088.636-1.338-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844a9.56 9.56 0 012.504.337c1.909-1.296 2.748-1.026 2.748-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.748 0 .267.18.577.688.48A10.019 10.019 0 0022 12.017C22 6.485 17.523 2 12 2z"/></svg>
      Sign in with GitHub
    </a>
  )
}

function Hero() {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/qQUip0dJPqrrPryE/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 h-full flex items-center justify-center text-center">
        <div className="max-w-3xl px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-sm text-white backdrop-blur pointer-events-none">Holographic identity • Verified</span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold tracking-tight text-white drop-shadow">Build a stunning portfolio from your GitHub in minutes</h1>
          <p className="mt-4 text-white/80 text-lg">Connect GitHub, we’ll auto-generate a personal site at your unique URL. Keep it synced with your latest activity.</p>
          <div className="mt-8 flex items-center justify-center">
            <LoginButton />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"/>
    </section>
  )
}

function Dashboard({ token }) {
  const [me, setMe] = useState(null)
  const [headline, setHeadline] = useState('')
  const [sub, setSub] = useState('')
  useEffect(() => {
    fetch(`${BACKEND}/me`, { headers: { 'x-session-token': token } })
      .then(r => r.json())
      .then(d => setMe(d.user))
  }, [token])

  const save = async () => {
    await fetch(`${BACKEND}/portfolio`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-session-token': token }, body: JSON.stringify({ headline, subheadline: sub }) })
    alert('Saved!')
  }

  if (!me) return <div className="py-20 text-center">Loading...</div>
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4">
        <img src={me.avatar_url} alt="" className="w-16 h-16 rounded-full"/>
        <div>
          <h2 className="text-2xl font-bold">{me.name || me.username}</h2>
          <p className="text-gray-500">@{me.username}</p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Headline</label>
          <input value={headline} onChange={e=>setHeadline(e.target.value)} className="w-full rounded-lg border px-3 py-2" placeholder="Craft your hero message"/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subheadline</label>
          <input value={sub} onChange={e=>setSub(e.target.value)} className="w-full rounded-lg border px-3 py-2" placeholder="Add a supporting line"/>
        </div>
        <button onClick={save} className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white">Save</button>
      </div>
    </div>
  )
}

function App() {
  const params = new URLSearchParams(window.location.search)
  const initialToken = params.get('token') || localStorage.getItem('token') || ''
  const [token, setToken] = useState(initialToken)
  useEffect(() => {
    if (initialToken) {
      localStorage.setItem('token', initialToken)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-blue-900 text-white">
      {!token ? (
        <>
          <nav className="flex items-center justify-between px-6 py-4">
            <div className="font-bold tracking-tight">HoloPort</div>
            <div className="opacity-80">Portfolio SaaS</div>
          </nav>
          <Hero />
        </>
      ) : (
        <>
          <nav className="flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur">
            <div className="font-bold tracking-tight">HoloPort</div>
            <button className="text-sm opacity-80" onClick={()=>{localStorage.removeItem('token'); setToken('')}}>Log out</button>
          </nav>
          <Dashboard token={token} />
        </>
      )}
    </div>
  )
}

export default App
