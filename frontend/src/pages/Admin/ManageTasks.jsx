import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { TASKS, USERS } from '../../utils/apiPaths'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { downloadCsv, priorityBadge, statusBadge, normalizeStatusLabel, taskPriorityOptions, taskStatusOptions, formatDate } from '../../utils/helper'
import toast from 'react-hot-toast'

const ManageTasks = () => {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState(null)
  const [editValues, setEditValues] = useState({ title: '', description: '', priority: 'Medium', dueDate: '', assignedTo: [], attachments: '', todoChecklist: '' })
  const [selectedAssignee, setSelectedAssignee] = useState('')

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const query = statusFilter ? `?status=${statusFilter}` : ''
      const response = await axiosInstance.get(`${TASKS.base}${query}`)
      setTasks(response.data.tasks || [])
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to load tasks.')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get(USERS.base)
      setUsers(response.data || [])
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to load users.')
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchUsers()
  }, [statusFilter])

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return
    }
    try {
      await axiosInstance.delete(`${TASKS.base}/${taskId}`)
      toast.success('Task deleted successfully.')
      fetchTasks()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to delete task.')
    }
  }

  const handleStatusUpdate = async (taskId, selectedStatus) => {
    try {
      await axiosInstance.put(`${TASKS.base}/${taskId}/status`, { status: selectedStatus })
      toast.success('Status updated.')
      fetchTasks()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update task status.')
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setSelectedAssignee('')
    setEditValues({
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'Medium',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo?.map((user) => user._id) || [],
      attachments: task.attachments?.join(', ') || '',
      todoChecklist: task.todoChecklist?.map((item) => item.text).join('\n') || '',
    })
  }

  const handleAssigneeSelect = (event) => {
    setSelectedAssignee(event.target.value)
  }

  const addAssignee = () => {
    if (!selectedAssignee) {
      toast.error('Please select a team member to assign.')
      return
    }
    if (editValues.assignedTo.includes(selectedAssignee)) {
      toast.error('This member is already assigned.')
      return
    }
    setEditValues((prev) => ({ ...prev, assignedTo: [...prev.assignedTo, selectedAssignee] }))
    setSelectedAssignee('')
  }

  const removeAssignee = (userId) => {
    setEditValues((prev) => ({ ...prev, assignedTo: prev.assignedTo.filter((id) => id !== userId) }))
  }

  const handleEditChange = (event) => {
    const { name, value, options } = event.target
    if (name === 'assignedTo') {
      const selected = Array.from(options).filter((option) => option.selected).map((option) => option.value)
      setEditValues((prev) => ({ ...prev, assignedTo: selected }))
      return
    }
    setEditValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveEdit = async () => {
    if (!editingTask) return
    if (!editValues.title || !editValues.dueDate || !editValues.assignedTo.length) {
      toast.error('Title, due date, and assigned users are required.')
      return
    }
    try {
      const payload = {
        title: editValues.title,
        description: editValues.description,
        priority: editValues.priority,
        dueDate: editValues.dueDate,
        assignedTo: editValues.assignedTo,
        attachments: editValues.attachments ? editValues.attachments.split(',').map((item) => item.trim()).filter(Boolean) : [],
        todoChecklist: editValues.todoChecklist
          .split('\n')
          .map((text) => text.trim())
          .filter(Boolean)
          .map((text) => ({ text, completed: false })),
      }
      await axiosInstance.put(`${TASKS.base}/${editingTask._id}`, payload)
      toast.success('Task updated successfully.')
      setEditingTask(null)
      fetchTasks()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to save task changes.')
    }
  }

  const statusOptions = useMemo(() => ['Pending', 'In Progress', 'Completed'], [])

  return (
    <DashboardLayout title="Manage Tasks" subtitle="Track open work, update status, and keep your team on the same page.">
      <div className="space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Browse tasks</h3>
            <p className="mt-1 text-sm text-slate-500">Filter by status or jump straight to editing.</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
            >
              <option value="">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <button
              onClick={() => navigate('/admin/create-task')}
              className="rounded-3xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
            >
              Create new task
            </button>
            <button
              onClick={() => {
                const exportRows = tasks.map((task) => ({
                  Title: task.title,
                  Assigned: task.assignedTo?.map((user) => user.name).join('; ') || 'Unassigned',
                  Priority: task.priority,
                  Status: normalizeStatusLabel(task.status),
                  DueDate: formatDate(task.dueDate),
                  Progress: `${task.progress ?? 0}%`,
                }))
                downloadCsv('task-manager-tasks.csv', exportRows)
              }}
              className="rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Download Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-4">Title</th>
                <th className="px-4 py-4">Assigned</th>
                <th className="px-4 py-4">Priority</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Due</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tasks.map((task) => (
                <tr key={task._id} className="hover:bg-slate-50">
                  <td className="px-4 py-4 text-slate-800">{task.title}</td>
                  <td className="px-4 py-4 text-slate-600">
                    {task.assignedTo?.map((user) => user.name).join(', ') || 'Unassigned'}
                  </td>
                  <td className={`px-4 py-4 text-sm font-semibold ${priorityBadge(task.priority)}`}>{task.priority}</td>
                  <td className={`px-4 py-4 text-sm font-semibold ${statusBadge(task.status)}`}>{normalizeStatusLabel(task.status)}</td>
                  <td className="px-4 py-4 text-slate-600">{formatDate(task.dueDate)}</td>
                  <td className="px-4 py-4 space-x-2">
                    <button
                      onClick={() => handleEdit(task)}
                      className="rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 transition hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!tasks.length && (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-slate-500">
                    {loading ? 'Loading tasks...' : 'No tasks available for this filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {editingTask && (
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Edit task</h3>
                <p className="text-sm text-slate-500">Update task details and save changes for your team.</p>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="rounded-3xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input
                  name="title"
                  value={editValues.title}
                  onChange={handleEditChange}
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />

                <label className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  value={editValues.description}
                  onChange={handleEditChange}
                  rows={5}
                  className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Priority</label>
                  <select
                    name="priority"
                    value={editValues.priority}
                    onChange={handleEditChange}
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  >
                    {taskPriorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Due date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={editValues.dueDate}
                    onChange={handleEditChange}
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Assign to</label>
                  <div className="mt-2 flex flex-col gap-3">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <select
                        name="selectedAssignee"
                        value={selectedAssignee}
                        onChange={handleAssigneeSelect}
                        className="flex-1 rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                      >
                        <option value="">Select a team member</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>{user.name} — {user.email}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={addAssignee}
                        className="rounded-3xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
                      >
                        Add member
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {editValues.assignedTo.map((userId) => {
                        const user = users.find((item) => item._id === userId)
                        return (
                          <div key={userId} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
                            <span>{user ? `${user.name}` : 'Member'}</span>
                            <button
                              type="button"
                              onClick={() => removeAssignee(userId)}
                              className="rounded-full bg-rose-50 px-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            >
                              ×
                            </button>
                          </div>
                        )
                      })}
                      {!editValues.assignedTo.length && (
                        <p className="text-sm text-slate-500">Select members and click Add member to assign them.</p>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Attachments</label>
                  <input
                    name="attachments"
                    value={editValues.attachments}
                    onChange={handleEditChange}
                    placeholder="Paste URLs separated by commas"
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700">Checklist items</label>
              <textarea
                name="todoChecklist"
                value={editValues.todoChecklist}
                onChange={handleEditChange}
                rows={4}
                placeholder="One item per line"
                className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={handleSaveEdit}
                className="rounded-3xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
              >
                Save update
              </button>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ManageTasks
