import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface NavbarProps {
  links: { label: string; to: string }[]
}

export default function Navbar({ links }: NavbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-50">
      {/* Logo + links */}
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.707.707m12.02 12.02.708.708M1 12h1m20 0h1M4.22 19.78l.707-.707M18.95 5.05l.708-.708M12 7a5 5 0 100 10A5 5 0 0012 7z" />
            </svg>
          </div>
          <span className="font-semibold text-sm text-gray-900">SmartSeason</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* User info + logout */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-900">{user?.name}</div>
          <div className="text-xs text-gray-400">{user?.role === 'ADMIN' ? 'Admin' : 'Agent'}</div>
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
          title="Sign out"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
        </button>
      </div>
    </nav>
  )
}
