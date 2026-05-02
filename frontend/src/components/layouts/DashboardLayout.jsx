import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const DashboardLayout = ({ title, children, subtitle }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = user?.role === 'admin'
    ? [
      { label: 'Dashboard', to: '/admin/dashboard' },
      { label: 'Tasks', to: '/admin/tasks' },
      { label: 'Create Task', to: '/admin/create-task' },
      { label: 'Users', to: '/admin/users' },
    ]
    : [
      { label: 'Dashboard', to: '/user/dashboard' },
      { label: 'My Tasks', to: '/user/tasks' },
    ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : ''

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex flex-col md:flex-row">
        <aside className="w-full md:w-72 bg-white border-r border-slate-200 shadow-sm">
          <div className="px-6 py-6 border-b border-slate-200">
            <h1 className="text-xl font-semibold text-slate-900">TaskManager</h1>
            <p className="mt-2 text-sm text-slate-500">{user?.role === 'admin' ? 'Admin control panel' : 'My workspace'}</p>
          </div>
          <nav className="px-6 py-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="px-6 py-4 mt-auto border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-pink-600">{user?.role === 'admin' ? 'Admin panel' : 'User panel'}</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-900">{title}</h2>
              {subtitle && <p className="mt-2 text-slate-500 max-w-2xl">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3 rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
            {user?.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt="User avatar"
                className="h-11 w-11 rounded-2xl object-cover"
              />
            ) : (
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-pink-600 text-sm font-semibold text-white">
                {initials || 'U'}
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Logged in as</p>
              <p className="font-medium text-slate-900">{user?.name}</p>
            </div>
          </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
