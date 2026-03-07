const fetch = globalThis.fetch;
const urls = [
  'http://localhost:3000/',
  'http://localhost:3000/admin/dashboard',
  'http://localhost:3000/api/academics/classes',
  'http://localhost:3000/api/academics/terms',
  'http://localhost:3000/api/auth/session'
];

async function wait(ms){return new Promise(r=>setTimeout(r,ms));}

(async ()=>{
  // wait for server
  for(let attempt=1; attempt<=12; attempt++){
    try{
      const r = await fetch('http://localhost:3000');
      if(r.ok){break}
    }catch(e){
      if(attempt===12){console.error('Server did not start in time'); process.exit(2)}
      await wait(1000);
    }
  }

  for(const u of urls){
    try{
      const res = await fetch(u, { redirect: 'manual' });
      console.log(u, '=>', res.status, res.statusText);
      const text = await res.text();
      console.log('Preview:', text.replace(/\s+/g,' ').slice(0,260));
    }catch(err){
      console.error(u, 'ERROR', err.message);
    }
    console.log('---');
  }
})();
