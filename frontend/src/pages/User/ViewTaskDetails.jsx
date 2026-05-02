import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { TASKS } from '../../utils/apiPaths'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { formatDate, normalizeStatusLabel, statusBadge, priorityBadge, taskStatusOptions } from '../../utils/helper'
import toast from 'react-hot-toast'

const ViewTaskDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const loadTask = async () => {
      try {
        const response = await axiosInstance.get(`${TASKS.base}/${id}`)
        setTask(response.data)
        setStatus(response.data.status === 'In-Progress' ? 'In Progress' : response.data.status)
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Unable to load task details.')
      } finally {
        setLoading(false)
      }
    }

    loadTask()
  }, [id])

  const handleStatusUpdate = async () => {
    if (!task) return
    try {
      setUpdating(true)
      await axiosInstance.put(`${TASKS.base}/${task._id}/status`, { status })
      toast.success('Task status updated.')
      setTask((prev) => prev ? { ...prev, status } : prev)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update status.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Task Details" subtitle="Loading task information...">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">Loading task details...</div>
      </DashboardLayout>
    )
  }

  if (!task) {
    return (
      <DashboardLayout title="Task Details" subtitle="Unable to find task details.">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-rose-700 shadow-sm">Task not found.</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Task Details" subtitle="Review progress, checklist, and task information.">
      <div className="space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-pink-600">Task overview</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">{task.title}</h3>
              <p className="mt-2 text-slate-600">{task.description || 'No description provided for this task.'}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className={`rounded-3xl px-4 py-3 text-sm font-semibold ${statusBadge(task.status)}`}>
                {normalizeStatusLabel(task.status)}
              </div>
              <div className={`rounded-3xl px-4 py-3 text-sm font-semibold ${priorityBadge(task.priority)}`}>
                {task.priority}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Due date</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{formatDate(task.dueDate)}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Assigned</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{task.assignedTo?.map((member) => member.name).join(', ') || 'Unassigned'}</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Progress</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{task.progress ?? 0}%</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-6">
              <h4 className="text-sm font-semibold text-slate-900">Checklist</h4>
              <div className="mt-4 space-y-3">
                {task.todoChecklist?.length ? (
                  task.todoChecklist.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3">
                      <span className={`${item.completed ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {item.completed ? '✓' : '○'}
                      </span>
                      <span className={item.completed ? 'text-slate-700 line-through' : 'text-slate-700'}>{item.text}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No checklist items have been added.</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-6">
              <h4 className="text-sm font-semibold text-slate-900">Attachments</h4>
              <div className="mt-4 space-y-3">
                {task.attachments?.length ? (
                  task.attachments.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-pink-600 hover:bg-slate-100"
                    >
                      {link}
                    </a>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No attachments available.</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="rounded-3xl bg-white p-4 text-sm text-slate-700 shadow-sm">
              Created at {formatDate(task.createdAt)}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              >
                {taskStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="rounded-3xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {updating ? 'Updating...' : 'Update status'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-3xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ViewTaskDetails
