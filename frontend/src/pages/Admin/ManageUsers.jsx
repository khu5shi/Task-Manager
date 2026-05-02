import { useEffect, useState } from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { USERS } from '../../utils/apiPaths'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import toast from 'react-hot-toast'

const ManageUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadUsers = async () => {
    try {
      const response = await axiosInstance.get(USERS.base)
      setUsers(response.data || [])
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return
    }

    try {
      await axiosInstance.delete(`${USERS.base}/${userId}`)
      toast.success('User deleted successfully')
      // Reload users list
      loadUsers()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete user')
    }
  }

  return (
    <DashboardLayout title="Manage Users" subtitle="Review and monitor team members and their task load.">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Team members</h3>
            <p className="text-sm text-slate-500">Users with tasks assigned in the system.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3">In Progress</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-slate-700">{user.name}</td>
                  <td className="px-4 py-4 text-slate-600">{user.email}</td>
                  <td className="px-4 py-4 text-slate-700">{user.pendingTasks}</td>
                  <td className="px-4 py-4 text-slate-700">{user.inProgressTasks}</td>
                  <td className="px-4 py-4 text-slate-700">{user.completedTasks}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleDeleteUser(user._id, user.name)}
                      className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    {loading ? 'Loading users...' : 'No users found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ManageUsers
