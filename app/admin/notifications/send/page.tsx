"use client"

import { useState, useEffect } from 'react'

export default function SendNotificationPage() {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    recipientType: "ALL_PARENTS",
    classId: "",
    priority: "NORMAL"
  })

  const [classes, setClasses] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/academics/classes').then(r => r.json()).then(setClasses).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (response.ok) {
      alert('Notification sent successfully!')
      setFormData({ title: "", message: "", recipientType: "ALL_PARENTS", classId: "", priority: "NORMAL" })
    } else {
      alert('Failed to send notification')
    }
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg p-6 shadow max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-3xl font-bold">Send Notification</h1>

      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <input
          required
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Message</label>
        <textarea
          required
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          className="w-full border rounded-lg px-4 py-2 h-32"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Recipients</label>
        <select
          value={formData.recipientType}
          onChange={(e) => setFormData({...formData, recipientType: e.target.value})}
          className="w-full border rounded-lg px-4 py-2"
        >
          <option value="ALL_PARENTS">All Parents</option>
          <option value="CLASS_PARENTS">Specific Class</option>
          <option value="DEPARTMENT_PARENTS">Department Parents</option>
        </select>
      </div>

      {formData.recipientType === "CLASS_PARENTS" && (
        <div>
          <label className="block text-sm font-medium mb-2">Select Class</label>
          <select
            required
            value={formData.classId}
            onChange={(e) => setFormData({...formData, classId: e.target.value})}
            className="w-full border rounded-lg px-4 py-2"
          >
            <option value="">Select Class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Send Notification
          </button>
        </form>
      </div>
    </div>
  )
}
