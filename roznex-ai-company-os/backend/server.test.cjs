'use strict';
const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const ORIGIN='https://november-line.example';
process.env.NL_ALLOWED_ORIGIN=ORIGIN;
const {server}=require('./server.cjs');
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

test('valid origin receives CORS preflight headers',async()=>{
 const r=await fetch((await endpoint())+'/api/chat',{method:'OPTIONS',headers:{origin:ORIGIN}});
 assert.equal(r.status,204);assert.equal(r.headers.get('access-control-allow-origin'),ORIGIN);
});
test('without a server-side API key chat is unavailable',async()=>{
 if(process.env.OPENAI_API_KEY)return;
 const r=await fetch((await endpoint())+'/api/chat',{method:'POST',headers:{origin:ORIGIN,'content-type':'application/json'},body:JSON.stringify({agent:'NEX',message:'test'})});
 assert.equal(r.status,503);
 assert.equal((await r.json()).error,'not_configured');
});

test('malformed JSON returns 400 instead of a server error when configured',async()=>{
 if(!process.env.OPENAI_API_KEY)return;
 const r=await fetch((await endpoint())+'/api/chat',{method:'POST',headers:{origin:ORIGIN,'content-type':'application/json'},body:'{bad-json'});
 assert.equal(r.status,400);assert.equal((await r.json()).error,'invalid_json');
});
test('unsupported method never reaches provider',async()=>{
 const r=await fetch((await endpoint())+'/api/chat',{method:'PUT',headers:{origin:ORIGIN}});
 assert.equal(r.status,405);
});

test('requires JSON content-type before accepting chat',async()=>{
 const r=await fetch((await endpoint())+'/api/chat',{method:'POST',headers:{origin:ORIGIN,'content-type':'text/plain'},body:'hello'});
 assert.equal(r.status,415);
 assert.equal((await r.json()).error,'content_type_required');
});
test('health includes numeric uptime',async()=>{
 const r=await fetch((await endpoint())+'/health');
 const data=await r.json();
 assert.equal(typeof data.uptimeSeconds,'number');
 assert.ok(data.uptimeSeconds>=0);
});
