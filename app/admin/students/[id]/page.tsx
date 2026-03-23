"use client";

import React from 'react';
import Link from 'next/link';
import { useState } from 'react';

type Props = { params: Promise<{ id: string }> };

export default function StudentView({ params }: Props) {
  const [student, setStudent] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    termId: '',
    comment: ''
  });
  const [message, setMessage] = useState('');

  // Fetch data on mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params;
        
        // Fetch student data
        const studentRes = await fetch(`/api/academics/students/${id}`);
        if (studentRes.ok) {
          const studentData = await studentRes.json();
          setStudent(studentData);
        }

        // Fetch reports
        const reportsRes = await fetch(`/api/reports?studentId=${id}`);
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setReports(reportsData);
        }

        // Fetch terms
        const termsRes = await fetch('/api/academics/terms');
        if (termsRes.ok) {
          const termsData = await termsRes.json();
          setTerms(termsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/results/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          classId: student.classId,
          sessionId: student.sessionId,
          termId: commentForm.termId,
          comment: commentForm.comment
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Comment saved successfully!');
        setCommentForm({ termId: '', comment: '' });
      } else {
        setMessage(`Error: ${data.error || 'Failed to save comment'}`);
        if (data.details) {
          console.error('Error details:', data.details);
        }
      }
    } catch (error) {
      setMessage('Error: Failed to save comment');
      console.error('Submit error:', error);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!student) {
    return <div className="p-6">Student not found</div>;
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{student.lastName} {student.firstName}</h1>
          <div className="space-x-2">
            <Link href={`/admin/students/${student.id}/reports/new`} className="px-3 py-1 bg-blue-600 text-white rounded">New Report</Link>
          </div>
        </div>

        <section className="mb-6">
          <h2 className="font-semibold">Details</h2>
          <div>Email: N/A</div>
          <div>Class: {student.classId}</div>
        </section>

        {/* Quick Comment Section */}
        <section className="mb-6">
          <h2 className="font-semibold mb-2">Add Result Comment</h2>
          {message && (
            <div className={`p-3 rounded mb-3 ${
              message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Term</label>
              <select 
                name="termId" 
                required 
                className="w-full border rounded px-3 py-2"
                value={commentForm.termId}
                onChange={(e) => setCommentForm({...commentForm, termId: e.target.value})}
              >
                <option value="">Select Term</option>
                {terms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Teacher Comment</label>
              <textarea 
                name="comment" 
                rows={3} 
                className="w-full border rounded px-3 py-2"
                placeholder="Enter your comment about the student's performance..."
                value={commentForm.comment}
                onChange={(e) => setCommentForm({...commentForm, comment: e.target.value})}
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Comment
            </button>
          </form>
        </section>

        <section>
          <h2 className="font-semibold mb-2">Reports</h2>
          <div className="space-y-3">
            {reports.length === 0 && <div className="text-sm text-gray-500">No reports yet</div>}
            {reports.map((r: any) => (
              <div key={r.id} className={`p-3 rounded shadow border ${r.status === 'PUBLISHED' ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">{new Date(r.createdAt).toLocaleString()}</div>
                    <div className="font-medium">{r.subjectId ? `Subject ${r.subjectId}` : 'General'}</div>
                    <div>Grade: {r.grade}</div>
                    <div className="mt-2 text-sm">{r.comment}</div>
                  </div>
                  <div className="ml-4">
                    <form action={`/api/reports/${r.id}/publish`} method="POST">
                      <button
                        type="submit"
                        className={`px-3 py-1 text-xs rounded ${
                          r.status === 'PUBLISHED'
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {r.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
