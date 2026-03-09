// Test API endpoints to debug the grades system
const tests = [
  '/api/academics/classes',
  '/api/academics/sessions', 
  '/api/academics/terms',
  '/api/academics/students',
  '/api/academics/subjects',
  '/api/academics/departments'
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results = {};
  
  for (const endpoint of tests) {
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${endpoint}`);
      const data = await response.json();
      
      results[endpoint] = {
        status: response.status,
        ok: response.ok,
        data: response.ok ? data : data.error,
        count: Array.isArray(data) ? data.length : 'N/A'
      };
    } catch (error) {
      results[endpoint] = {
        status: 'ERROR',
        ok: false,
        data: error.message,
        count: 'N/A'
      };
    }
  }

  res.status(200).json({
    success: true,
    results,
    summary: {
      totalEndpoints: tests.length,
      workingEndpoints: Object.values(results).filter(r => r.ok).length,
      failedEndpoints: Object.values(results).filter(r => !r.ok).length
    }
  });
}
