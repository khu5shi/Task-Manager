export const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const normalizeStatusLabel = (status) => {
  if (!status) return 'Pending'
  if (status === 'In-Progress' || status === 'In Progress') return 'In Progress'
  return status
}

export const priorityBadge = (priority) => {
  switch (priority) {
    case 'High':
      return 'bg-rose-100 text-rose-700'
    case 'Medium':
      return 'bg-amber-100 text-amber-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export const statusBadge = (status) => {
  const normalized = normalizeStatusLabel(status)
  switch (normalized) {
    case 'Completed':
      return 'bg-emerald-100 text-emerald-700'
    case 'In Progress':
      return 'bg-sky-100 text-sky-700'
    default:
      return 'bg-amber-100 text-amber-700'
  }
}

export const taskStatusOptions = [
  { label: 'Pending', value: 'Pending' },
  { label: 'In Progress', value: 'In-Progress' },
  { label: 'Completed', value: 'Completed' },
]

export const downloadCsv = (filename, rows) => {
  if (!rows || !rows.length) return

  const headers = Object.keys(rows[0])
  const csvContent = [headers.join(',')]

  rows.forEach((row) => {
    const values = headers.map((header) => {
      const value = row[header] ?? ''
      const formatted = typeof value === 'string' ? value.replace(/"/g, '""') : String(value)
      return `"${formatted}"`
    })
    csvContent.push(values.join(','))
  })

  const blob = new Blob([csvContent.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

export const taskPriorityOptions = [
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
]
