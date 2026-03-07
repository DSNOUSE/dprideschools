// Test teacher grade management functionality
const http = require('http');

// Test authentication and grade saving
function testGradeManagement() {
  return new Promise((resolve) => {
    console.log('🔧 Testing Teacher Grade Management');
    
    // First try to access grades endpoint without authentication (should fail)
    const data = JSON.stringify({
      classId: 4,
      sessionId: 1,
      termId: 1,
      grades: [
        {
          studentId: "cml7z8pj2000bqg7kudk03sy0",
          subjectId: 16, // Mathematics
          firstScore: 85,
          secondScore: 88,
          fourthScore: 90
        }
      ]
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/academics/grades',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log('✅ Grade Management - Authentication Test:');
        console.log(`Status: ${res.statusCode} (should be 401/403 without auth)`);
        console.log(`Response: ${responseData}`);
        console.log('');
        
        // Test GET endpoint without authentication
        testGetGrades().then(resolve);
      });
    });

    req.on('error', (e) => {
      console.log('❌ Grade Management Test Failed:', e.message);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

function testGetGrades() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/academics/grades?classId=4&sessionId=1&termId=1&subjectId=16',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log('✅ Get Grades - Authentication Test:');
        console.log(`Status: ${res.statusCode} (should be 401/403 without auth)`);
        console.log(`Response: ${responseData}`);
        console.log('');
        resolve(res.statusCode === 401 || res.statusCode === 403);
      });
    });

    req.on('error', (e) => {
      console.log('❌ Get Grades Test Failed:', e.message);
      resolve(false);
    });

    req.end();
  });
}

// Test rate limiting on results check
function testRateLimiting() {
  return new Promise((resolve) => {
    console.log('🚦 Testing Rate Limiting');
    
    const data = JSON.stringify({
      classId: "4",
      sessionId: "1", 
      termId: "1",
      studentId: "DPS2024001"
    });

    let requestCount = 0;
    let successCount = 0;
    let rateLimitHit = false;

    const makeRequest = () => {
      if (requestCount >= 15) { // Make 15 requests to test rate limiting
        console.log(`✅ Rate Limiting Test: ${successCount}/15 requests successful, rate limit hit: ${rateLimitHit}`);
        console.log('');
        resolve(rateLimitHit);
        return;
      }

      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/results/check',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };

      const req = http.request(options, (res) => {
        requestCount++;
        if (res.statusCode === 200) successCount++;
        if (res.statusCode === 429) rateLimitHit = true;
        
        // Consume response data
        res.on('data', () => {});
        res.on('end', () => {
          // Make next request quickly
          setTimeout(makeRequest, 10);
        });
      });

      req.on('error', () => {
        requestCount++;
        setTimeout(makeRequest, 10);
      });

      req.write(data);
      req.end();
    };

    makeRequest();
  });
}

// Test edge cases
function testEdgeCases() {
  return new Promise((resolve) => {
    console.log('🔍 Testing Edge Cases');
    
    const testCases = [
      {
        name: 'Empty JSON body',
        data: '{}',
        expectedStatus: 400
      },
      {
        name: 'Invalid JSON',
        data: 'invalid json',
        expectedStatus: 400
      },
      {
        name: 'Null values',
        data: JSON.stringify({
          classId: null,
          sessionId: "1", 
          termId: "1",
          studentId: "DPS2024001"
        }),
        expectedStatus: 400
      }
    ];

    let completed = 0;
    let results = [];

    testCases.forEach(testCase => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/results/check',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(testCase.data)
        }
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          const passed = res.statusCode === testCase.expectedStatus;
          results.push({
            name: testCase.name,
            expected: testCase.expectedStatus,
            actual: res.statusCode,
            passed
          });
          
          completed++;
          if (completed === testCases.length) {
            console.log('Edge Cases Results:');
            results.forEach(r => {
              console.log(`  ${r.name}: ${r.passed ? '✅' : '❌'} (Expected: ${r.expected}, Got: ${r.actual})`);
            });
            console.log('');
            resolve(results.every(r => r.passed));
          }
        });
      });

      req.on('error', () => {
        completed++;
        results.push({
          name: testCase.name,
          expected: testCase.expectedStatus,
          actual: 'ERROR',
          passed: false
        });
        
        if (completed === testCases.length) {
          resolve(false);
        }
      });

      req.write(testCase.data);
      req.end();
    });
  });
}

// Run all teacher functionality tests
async function runTeacherTests() {
  console.log('👨‍🏫 Starting Teacher Functionality Tests\n');
  
  const results = [];
  results.push(await testGradeManagement());
  results.push(await testRateLimiting());
  results.push(await testEdgeCases());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`📊 Teacher Tests Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All teacher functionality tests passed!');
  } else {
    console.log('⚠️ Some teacher tests failed. Please review the issues above.');
  }
}

runTeacherTests().catch(console.error);
