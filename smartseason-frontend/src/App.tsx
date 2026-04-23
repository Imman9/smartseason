import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminFields from './pages/AdminFields'
import AdminAgents from './pages/AdminAgents'
import AgentDashboard from './pages/AgentDashboard'

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'ADMIN') return <Navigate to="/my-fields" replace />
  return <>{children}</>
}

function AgentRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (user?.role !== 'AGENT') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function RootRedirect() {
  const { user, token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return <Navigate to={user?.role === 'ADMIN' ? '/dashboard' : '/my-fields'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin */}
          <Route path="/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/fields" element={<AdminRoute><AdminFields /></AdminRoute>} />
          <Route path="/agents" element={<AdminRoute><AdminAgents /></AdminRoute>} />

          {/* Agent */}
          <Route path="/my-fields" element={<AgentRoute><AgentDashboard /></AgentRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
