import { useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, Navigate, useLocation } from 'react-router-dom'
import { Scissors, ArrowRight, CheckCircle } from 'lucide-react'
import axios from 'axios'
import AdminDashboard from './pages/AdminDashboard'
import BookingPage from './pages/BookingPage'

// 1. GLOBAL UTILS
const API_URL = 'http://localhost:8000'
const api = axios.create({ baseURL: API_URL })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 2. AUTH SYSTEM
export const AuthContext = createContext<any>(null)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch (e) { localStorage.clear() }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, pass: string) => {
    const res = await api.post('/auth/login', { email, password: pass })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }

  const register = async (name: string, email: string, pass: string) => {
    const res = await api.post('/auth/register', { name, email, password: pass })
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('user', JSON.stringify(res.data.user))
    setUser(res.data.user)
  }

  const logout = () => { localStorage.clear(); setUser(null) }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useContext(AuthContext)
  if (loading) return null
  if (!user || user.role !== 'ADMIN') return <Navigate to="/login" />
  return <>{children}</>
}

// 3. COMPONENTS
import Navbar from './components/Navbar'

const Home = () => {
    return (
      <div className="hero" style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.15), transparent 40%)' 
      }}>
        
        <div className="hero-grid">
          
          {/* Left Content */}
          <div className="hero-content">
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', 
              padding: '8px 16px', borderRadius: '30px', marginBottom: '24px',
              color: '#818cf8', fontWeight: '600', fontSize: '0.9rem'
            }}>
              <span style={{ position: 'relative', display: 'flex', height: '10px', width: '10px' }}>
                <span style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite', position: 'absolute', height: '100%', width: '100%', borderRadius: '50%', background: '#818cf8', opacity: 0.75 }}></span>
                <span style={{ position: 'relative', height: '10px', width: '10px', borderRadius: '50%', background: '#6366f1' }}></span>
              </span>
              #1 Barber Studio in Jakarta
            </div>
  
            <h1 style={{ fontSize: '4.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem', letterSpacing: '-2px' }}>
              Refine Your <br/>
              <span style={{ 
                background: 'linear-gradient(to right, #818cf8, #c084fc, #f472b6)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 20px rgba(192, 132, 252, 0.3))'
              }}>
                Signature Look
              </span>
            </h1>
            
            <p style={{ color: '#94a3b8', fontSize: '1.25rem', lineHeight: '1.6', marginBottom: '3rem', maxWidth: '500px' }}>
              Experience premium grooming where precision meets style. Expert barbers, modern atmosphere, and a look that defines you.
            </p>
            
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/booking" className="btn btn-primary" style={{ 
                padding: '16px 40px', fontSize: '1.1rem', borderRadius: '12px',
                background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
                border: 'none', display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                Book Appointment <ArrowRight size={20} />
              </Link>
              <Link to="/register" className="btn btn-secondary" style={{ 
                padding: '16px 32px', fontSize: '1.1rem', borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)'
              }}>
                Join Member
              </Link>
            </div>
  
            <div style={{ marginTop: '60px', display: 'flex', gap: '40px', justifyContent: 'center' }}>
               <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>5k+</div>
                  <div style={{ color: '#64748b' }}>Happy Clients</div>
               </div>
               <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>15+</div>
                  <div style={{ color: '#64748b' }}>Expert Barbers</div>
               </div>
               <div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>4.9</div>
                  <div style={{ color: '#64748b' }}>Average Rating</div>
               </div>
            </div>
          </div>
  
          {/* Right Content - Visuals */}
          <div className="hero-visuals" style={{ position: 'relative', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ 
                position: 'absolute', width: '500px', height: '500px', 
                background: 'conic-gradient(from 180deg at 50% 50%, #4F46E5 0deg, #C026D3 180deg, #4F46E5 360deg)',
                filter: 'blur(100px)', opacity: 0.3, borderRadius: '50%', zIndex: 0 
             }}></div>
             
             {/* Floating Cards Mockup */}
             <div style={{ 
                position: 'relative', zIndex: 1, 
                background: 'rgba(30, 41, 59, 0.6)', 
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '24px',
                padding: '30px',
                width: '400px',
                transform: 'rotate(-5deg)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
             }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                   <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#333', overflow: 'hidden' }}>
                      <img src="/style_fade.png" alt="Cut" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                   </div>
                   <div>
                      <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Classic Fade</div>
                      <div style={{ color: '#94a3b8' }}>45 mins • Rp 85.000</div>
                   </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                   <span style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>Precision</span>
                   <span style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: '20px', background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6' }}>Style</span>
                </div>
  
                 {/* Floating Badge */}
                <div style={{ 
                    position: 'absolute', top: '-20px', right: '-20px',
                    background: '#10b981', color: '#fff', padding: '12px',
                    borderRadius: '16px', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)',
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <CheckCircle size={20} />
                    <span style={{ fontWeight: 'bold' }}>Booked!</span>
                </div>
             </div>
  
             {/* Second Card Underneath */}
             <div style={{ 
                position: 'absolute', zIndex: 0, bottom: '50px', right: '0px',
                background: 'rgba(30, 41, 59, 0.4)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '24px',
                width: '350px', height: '200px',
                transform: 'rotate(10deg)'
             }}></div>
  
          </div>
        </div>
      </div>
    )
  }

import { AlertProvider, useAlert } from './context/AlertContext'

// ... (other imports)

// Login Component
function Login() {
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  // const [err, setErr] = useState('') // Removed local error state to use Alert
  const { login } = useContext(AuthContext)
  const { showAlert } = useAlert()
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const user = await login(email, pass)
      if (user.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/booking')
      }
      showAlert('Welcome Back!', `Successfully logged in as ${user.name}`, 'success')
    } catch (error: any) {
      // setErr(error.response?.data?.error || 'Login Gagal')
      showAlert('Login Failed', error.response?.data?.error || 'Invalid email or password', 'error')
    }
  }

  return (
    <div className="auth-container">
      <form className="card auth-card" onSubmit={onSubmit}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Login Ke Akun</h2>
        <input className="input-field" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        <input className="input-field" type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} required />
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>MASUK SEKARANG</button>
        <p style={{ marginTop: '20px', textAlign: 'center', color: '#94a3b8' }}>
          Belum punya akun? <Link to="/register" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 'bold' }}>Daftar</Link>
        </p>
      </form>
    </div>
  )
}

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const { register } = useContext(AuthContext)
  const { showAlert } = useAlert()
  const navigate = useNavigate()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await register(name, email, pass)
      showAlert('Registration Success', 'Your account has been created successfully!', 'success')
      navigate('/booking')
    } catch (error: any) {
      showAlert('Registration Failed', error.response?.data?.error || 'Failed to create account', 'error')
    }
  }

  return (
    <div className="auth-container">
      <form className="card auth-card" onSubmit={onSubmit}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Daftar Akun Baru</h2>
        <input className="input-field" type="text" placeholder="Nama Lengkap" value={name} onChange={e => setName(e.target.value)} required autoFocus />
        <input className="input-field" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="input-field" type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} required />
        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px' }}>DAFTAR SEKARANG</button>
        <p style={{ marginTop: '20px', textAlign: 'center', color: '#94a3b8' }}>
          Sudah punya akun? <Link to="/login" style={{ color: '#6366f1', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
        </p>
      </form>
    </div>
  )
}

function Appointments() {
  const [list, setList] = useState<any[]>([])
  const { showConfirm, showAlert } = useAlert()

  useEffect(() => { api.get('/appointments/my').then(r => setList(r.data)) }, [])
  
  const cancelBooking = async (id: string) => {
    const confirmed = await showConfirm('Cancel Booking', 'Are you sure you want to cancel this booking? This action cannot be undone.')
    if (!confirmed) return
    
    try {
      await api.patch(`/appointments/${id}/cancel`)
      setList(list.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a))
      showAlert('Cancelled', 'Booking has been cancelled successfully.', 'success')
    } catch (e: any) { 
        showAlert('Error', e.response?.data?.error || 'Failed to cancel', 'error')
    }
  }

  // ... (render remains same)
  return (
    <div className="app-container">
      <h1>Riwayat Booking</h1>
      {list.length === 0 ? <p style={{ color: '#94a3b8' }}>Belum ada riwayat booking.</p> : null}
      
      {list.map(a => (
        <div key={a.id} className="card" style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
             <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{a.service.name}</div>
             <div style={{ color: '#94a3b8' }}>{a.barber.name} • {new Date(a.startTime).toLocaleString()}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
             <div style={{ 
               color: a.status === 'CONFIRMED' ? '#10b981' : a.status === 'PENDING' ? '#f59e0b' : '#ef4444',
               fontWeight: 'bold', fontSize: '0.9rem'
             }}>
               {a.status}
             </div>
             {a.status === 'PENDING' && (
               <button 
                 onClick={() => cancelBooking(a.id)} 
                 className="btn" 
                 style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
               >
                 Cancel Booking
               </button>
             )}
          </div>
        </div>
      ))}
    </div>
  )
}

// 4. MAIN APP
function MainLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdminPage && <Navbar />}
      {children}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AlertProvider>
            <MainLayout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            </Routes>
            </MainLayout>
        </AlertProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
