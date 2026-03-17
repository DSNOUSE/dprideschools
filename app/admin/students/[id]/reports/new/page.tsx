"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default async function NewReportPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = await params
  const [formData, setFormData] = useState({
    subjectId: "",
    termId: "",
    grade: "",
    comment: "",
    attendance: "",
    conduct: ""
  })

  const [subjects, setSubjects] = useState<any[]>([])
  const [terms, setTerms] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/academics/subjects').then(r => r.json()).then(setSubjects).catch(() => {})
    fetch('/api/academics/terms').then(r => r.json()).then(setTerms).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        studentId: id
      })
    })

    if (response.ok) {
      router.push(`/admin/students/${id}`)
    } else {
      alert('Failed to save report')
    }
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg p-6 shadow max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h1 className="text-3xl font-bold">Create Student Report</h1>

      <div>
        <label className="block text-sm font-medium mb-2">Subject</label>
        <select
          value={formData.subjectId}
          onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
          className="w-full border rounded-lg px-4 py-2"
        >
          <option value="">Select Subject</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Term</label>
        <select
          required
          value={formData.termId}
          onChange={(e) => setFormData({...formData, termId: e.target.value})}
          className="w-full border rounded-lg px-4 py-2"
        >
          <option value="">Select Term</option>
          {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Grade</label>
        <select
          required
          value={formData.grade}
          onChange={(e) => setFormData({...formData, grade: e.target.value})}
          className="w-full border rounded-lg px-4 py-2"
        >
          <option value="">Select Grade</option>
          <option value="A+">A+</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="F">F</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Comment</label>
        <textarea
          required
          value={formData.comment}
          onChange={(e) => setFormData({...formData, comment: e.target.value})}
          className="w-full border rounded-lg px-4 py-2 h-32"
          placeholder="Enter report comment..."
        />
      </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Report
            </button>
            <button
              type="button"
              onClick={() => history.back()}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
