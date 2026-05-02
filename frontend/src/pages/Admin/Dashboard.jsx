import { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid, Legend } from 'recharts'
import axiosInstance from '../../utils/axiosInstance'
import { TASKS } from '../../utils/apiPaths'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { formatDate, normalizeStatusLabel } from '../../utils/helper'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await axiosInstance.get(TASKS.dashboard)
        const { statistics, charts, recentTasks } = response.data
        setStats(statistics)
        setCharts(charts)
        setRecentTasks(recentTasks)
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Unable to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const distributionData = charts
    ? [
        { name: 'Pending', value: charts.taskDistribution.Pending || 0 },
        { name: 'In Progress', value: charts.taskDistribution['In Progress'] || charts.taskDistribution['In-Progress'] || 0 },
        { name: 'Completed', value: charts.taskDistribution.Completed || 0 },
      ]
    : []

  const priorityData = charts
    ? [
        { name: 'Low', value: charts.taskPriorityLevels.Low || 0 },
        { name: 'Medium', value: charts.taskPriorityLevels.Medium || 0 },
        { name: 'High', value: charts.taskPriorityLevels.High || 0 },
      ]
    : []

  const chartColors = ['#f97316', '#2563eb', '#14b8a6']

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Review task performance, user progress, and pending work in one place.">
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-4">
          {['Total tasks', 'Pending tasks', 'Completed tasks', 'Overdue tasks'].map((label, index) => (
            <div key={label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{label}</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">
                {loading ? '...' : [stats?.totalTasks, stats?.pendingTasks, stats?.completedTasks, stats?.overdueTasks][index] ?? 0}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Task distribution</h3>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#ec4899" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Status overview</h3>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distributionData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={4}>
                    {distributionData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}`, 'Tasks']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Recent tasks</h3>
            <p className="text-sm text-slate-500">Updated {formatDate(new Date().toISOString())}</p>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full table-auto text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((task) => (
                  <tr key={task._id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-4 text-slate-700">{task.title}</td>
                    <td className="px-4 py-4 text-slate-600">{normalizeStatusLabel(task.status)}</td>
                    <td className="px-4 py-4 text-slate-600">{task.priority}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDate(task.dueDate)}</td>
                  </tr>
                ))}
                {!recentTasks.length && (
                  <tr>
                    <td colSpan="4" className="px-4 py-6 text-center text-slate-500">
                      No recent tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
