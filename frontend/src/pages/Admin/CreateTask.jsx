import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { TASKS, USERS } from '../../utils/apiPaths'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { taskPriorityOptions } from '../../utils/helper'
import toast from 'react-hot-toast'

const CreateTask = () => {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [selectedAssignee, setSelectedAssignee] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
    assignedTo: [],
    attachments: '',
    todoChecklist: [''],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await axiosInstance.get(USERS.base)
        setUsers(response.data || [])
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Unable to load users.')
      }
    }

    loadUsers()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAssigneeSelect = (event) => {
    setSelectedAssignee(event.target.value)
  }

  const addAssignee = () => {
    if (!selectedAssignee) {
      toast.error('Please select a team member to assign.')
      return
    }
    if (formData.assignedTo.includes(selectedAssignee)) {
      toast.error('This member is already assigned.')
      return
    }
    setFormData((prev) => ({ ...prev, assignedTo: [...prev.assignedTo, selectedAssignee] }))
    setSelectedAssignee('')
  }

  const removeAssignee = (userId) => {
    setFormData((prev) => ({ ...prev, assignedTo: prev.assignedTo.filter((id) => id !== userId) }))
  }

  const handleChecklistChange = (index, value) => {
    const updated = [...formData.todoChecklist]
    updated[index] = value
    setFormData((prev) => ({ ...prev, todoChecklist: updated }))
  }

  const addChecklistItem = () => {
    setFormData((prev) => ({ ...prev, todoChecklist: [...prev.todoChecklist, ''] }))
  }

  const removeChecklistItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      todoChecklist: prev.todoChecklist.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.title || !formData.dueDate || !formData.assignedTo.length) {
      toast.error('Please provide title, due date, and assignees.')
      return
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      dueDate: formData.dueDate,
      assignedTo: formData.assignedTo,
      attachments: formData.attachments
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      todoChecklist: formData.todoChecklist
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text) => ({ text, completed: false })),
    }

    try {
      setLoading(true)
      await axiosInstance.post(TASKS.base, payload)
      toast.success('Task created successfully.')
      navigate('/admin/tasks')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to create task.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Create Task" subtitle="Create a new task and assign it to one or more team members.">
      <form onSubmit={handleSubmit} className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Task title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
              placeholder="Enter the task title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
            >
              {taskPriorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Due date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
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
                  className="flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                >
                  <option value="">Select a team member</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} — {user.email}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addAssignee}
                  className="inline-flex items-center justify-center rounded-3xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
                >
                  Add member
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.assignedTo.map((userId) => {
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
                {!formData.assignedTo.length && (
                  <p className="text-sm text-slate-500">Select members and click Add member to assign them.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Description</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
            placeholder="Add a short description for the task"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Attachments</label>
          <input
            type="text"
            name="attachments"
            value={formData.attachments}
            onChange={handleChange}
            placeholder="Add file links separated by commas"
            className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
          />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Task checklist</h3>
            <button
              type="button"
              onClick={addChecklistItem}
              className="rounded-full bg-pink-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-pink-700"
            >
              Add item
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {formData.todoChecklist.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <input
                  type="text"
                  value={item}
                  onChange={(event) => handleChecklistChange(index, event.target.value)}
                  placeholder="Checklist item"
                  className="flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100"
                />
                <button
                  type="button"
                  onClick={() => removeChecklistItem(index)}
                  className="rounded-3xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-3xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Creating task...' : 'Create task'}
        </button>
      </form>
    </DashboardLayout>
  )
}

export default CreateTask
