// Comprehensive test script for the result system
const http = require('http');

// Test 1: Check result with valid data
function testValidResult() {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      classId: "4",
      sessionId: "1", 
      termId: "1",
      studentId: "DPS2024001"
    });

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
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log('✅ Test 1 - Valid Result Check:');
        console.log(`Status: ${res.statusCode}`);
        const result = JSON.parse(responseData);
        console.log(`Student: ${result.student?.firstName} ${result.student?.lastName}`);
        console.log(`Subjects: ${result.grades?.length}`);
        console.log(`Average: ${result.result?.average}`);
        console.log('');
        resolve(true);
      });
    });

    req.on('error', (e) => {
      console.log('❌ Test 1 Failed:', e.message);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

// Test 2: Check result with invalid student ID
function testInvalidStudent() {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      classId: "4",
      sessionId: "1", 
      termId: "1",
      studentId: "INVALID123"
    });

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
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log('✅ Test 2 - Invalid Student ID:');
        console.log(`Status: ${res.statusCode} (should be 404)`);
        console.log(`Response: ${responseData}`);
        console.log('');
        resolve(res.statusCode === 404);
      });
    });

    req.on('error', (e) => {
      console.log('❌ Test 2 Failed:', e.message);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

// Test 3: Check result with missing fields
function testMissingFields() {
  return new Promise((resolve) => {
    const data = JSON.stringify({
      classId: "4",
      sessionId: "1"
      // Missing termId and studentId
    });

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
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log('✅ Test 3 - Missing Fields:');
        console.log(`Status: ${res.statusCode} (should be 400)`);
        console.log(`Response: ${responseData}`);
        console.log('');
        resolve(res.statusCode === 400);
      });
    });

    req.on('error', (e) => {
      console.log('❌ Test 3 Failed:', e.message);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
}

// Test 4: Test dropdown data endpoints
function testDropdownEndpoints() {
  return new Promise((resolve) => {
    console.log('✅ Test 4 - Dropdown Endpoints:');
    
    const endpoints = [
      '/api/academics/classes',
      '/api/academics/sessions', 
      '/api/academics/terms',
      '/api/academics/students?classId=4&sessionId=1',
      '/api/academics/subjects?classId=4'
    ];

    let completed = 0;
    let results = [];

    endpoints.forEach(endpoint => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: endpoint,
        method: 'GET'
      };

      const req = http.request(options, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          const data = JSON.parse(responseData);
          results.push({
            endpoint,
            status: res.statusCode,
            count: Array.isArray(data) ? data.length : 'N/A'
          });
          
          completed++;
          if (completed === endpoints.length) {
            results.forEach(r => {
              console.log(`  ${r.endpoint}: Status ${r.status}, Count: ${r.count}`);
            });
            console.log('');
            resolve(results.every(r => r.status === 200));
          }
        });
      });

      req.on('error', () => {
        completed++;
        if (completed === endpoints.length) resolve(false);
      });

      req.end();
    });
  });
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Result System Tests\n');
  
  const results = [];
  results.push(await testValidResult());
  results.push(await testInvalidStudent());
  results.push(await testMissingFields());
  results.push(await testDropdownEndpoints());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`📊 Test Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! The result system is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please review the issues above.');
  }
}

runAllTests().catch(console.error);
