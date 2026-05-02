import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'
import Dashboard from './pages/Admin/Dashboard'
import PrivateRoute from './routes/PrivateRoute'
import ManageTasks from './pages/Admin/ManageTasks'
import CreateTask from './pages/Admin/CreateTask'
import ManageUsers from './pages/Admin/ManageUsers'
import UserDashboard from './pages/User/UserDashboard'
import MyTask from './pages/User/MyTask'
import ViewTaskDetails from './pages/User/ViewTaskDetails'

const App = () => {
  const { user, initialized } = useAuth()

  if (!initialized) {
    return null
  }

  const defaultRoute = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Router>
        <Routes>
          <Route path="/" element={user ? <Navigate to={defaultRoute} replace /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/tasks" element={<ManageTasks />} />
            <Route path="/admin/create-task" element={<CreateTask />} />
            <Route path="/admin/users" element={<ManageUsers />} />
          </Route>

          <Route element={<PrivateRoute allowedRoles={['admin', 'member']} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/tasks" element={<MyTask />} />
            <Route path="/user/task-details/:id" element={<ViewTaskDetails />} />
          </Route>

          <Route path="*" element={<Navigate to={user ? defaultRoute : '/login'} replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </div>
  )
}

export default App
