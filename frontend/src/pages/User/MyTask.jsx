import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { TASKS } from '../../utils/apiPaths'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { downloadCsv, priorityBadge, statusBadge, normalizeStatusLabel, taskStatusOptions, formatDate } from '../../utils/helper'
import toast from 'react-hot-toast'

const MyTask = () => {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const query = statusFilter ? `?status=${statusFilter}` : ''
      const response = await axiosInstance.get(`${TASKS.base}${query}`)
      setTasks(response.data.tasks || [])
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to load your tasks.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [statusFilter])

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axiosInstance.put(`${TASKS.base}/${taskId}/status`, { status: newStatus })
      toast.success('Task status updated.')
      fetchTasks()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update task.')
    }
  }

  return (
    <DashboardLayout title="My Tasks" subtitle="Update work progress and open tasks assigned to you.">
      <div className="space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">My tasks</h3>
              <p className="text-sm text-slate-500">Sort, review, and update your current assignments.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full max-w-xs rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              >
                <option value="">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <button
                type="button"
                onClick={() => {
                  const exportRows = tasks.map((task) => ({
                    Title: task.title,
                    Status: normalizeStatusLabel(task.status),
                    Priority: task.priority,
                    DueDate: formatDate(task.dueDate),
                    Progress: `${task.progress ?? 0}%`,
                  }))
                  downloadCsv('my-tasks.csv', exportRows)
                }}
                className="rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Download Excel
              </button>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm text-left">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-4">Task</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Priority</th>
                  <th className="px-4 py-4">Due</th>
                  <th className="px-4 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-800">{task.title}</td>
                    <td className={`px-4 py-4 text-sm font-semibold ${statusBadge(task.status)}`}>{normalizeStatusLabel(task.status)}</td>
                    <td className={`px-4 py-4 text-sm font-semibold ${priorityBadge(task.priority)}`}>{task.priority}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(task.dueDate)}</td>
                    <td className="px-4 py-4 flex flex-col gap-2 sm:flex-row">
                      <button
                        onClick={() => navigate(`/user/task-details/${task._id}`)}
                        className="rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-200"
                      >
                        Details
                      </button>
                      <select
                        value={task.status === 'In-Progress' ? 'In Progress' : task.status}
                        onChange={(event) => handleStatusChange(task._id, event.target.value)}
                        className="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                      >
                        {taskStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {!tasks.length && (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                      {loading ? 'Loading tasks...' : 'No tasks assigned yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default MyTask
