'use strict';
const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const {server}=require('./server.cjs');
const ORIGIN='https://november-line.example';
process.env.NL_ALLOWED_ORIGIN ||= ORIGIN;
let address;
async function endpoint(){
 if(!address){await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));address='http://127.0.0.1:'+server.address().port}
 return address;
}
after(()=>server.close());
test('GET /health reports JSON and no-store',async()=>{
 const r=await fetch((await endpoint())+'/health');
 assert.equal(r.status,200);
 assert.match(r.headers.get('content-type'),/application\/json/);
 assert.equal(r.headers.get('cache-control'),'no-store');
 assert.equal((await r.json()).ok,true);
});
test('unknown route returns 404',async()=>{
 const r=await fetch((await endpoint())+'/missing');assert.equal(r.status,404);
});
test('chat rejects missing origin',async()=>{
 const r=await fetch((await endpoint())+'/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
 assert.equal(r.status,403);
});
test('chat rejects a forged origin',async()=>{
 const r=await fetch((await endpoint())+'/api/chat',{method:'POST',headers:{origin:'https://attacker.example','content-type':'application/json'},body:'{}'});
 assert.equal(r.status,403);
});
test('OPTIONS rejects origins outside allowlist',async()=>{
 const r=await fetch((await endpoint())+'/api/chat',{method:'OPTIONS',headers:{origin:'https://attacker.example'}});
 assert.equal(r.status,403);
});
test('method validation is enforced',async()=>{
 const r=await fetch((await endpoint())+'/api/chat',{method:'GET',headers:{origin:ORIGIN}});
 assert.equal(r.status,405);
});
