const API = "http://localhost:4000/api";

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  const el=document.getElementById(id);
  if(el) el.classList.add("active");
  if(id==="land") renderLands();
  if(id==="tools") renderEquipment();
  if(id==="soil") getRecommendations();
  window.scrollTo({top:0,behavior:"smooth"});
}
function toast(message){
  const t=document.getElementById("toast");t.textContent=message;t.classList.add("show");
  clearTimeout(window.__toast);window.__toast=setTimeout(()=>t.classList.remove("show"),2800);
}
function toggleEasyMode(){document.body.classList.toggle("easy-mode");toast(document.body.classList.contains("easy-mode")?"Easy Mode enabled":"Easy Mode disabled")}
function setLanguage(lang){toast(`Language set to ${lang} — voice architecture is integration-ready.`)}
function startVoice(){
  if("webkitSpeechRecognition" in window || "SpeechRecognition" in window){
    const R=window.SpeechRecognition||window.webkitSpeechRecognition;const r=new R();r.lang="en-IN";r.start();
    r.onresult=e=>{const text=e.results[0][0].transcript;toast(`Heard: “${text}”`);};
    r.onerror=()=>toast("Voice input needs microphone permission.");
  }else toast("Voice demo: “ମୋ ଫସଲର payment status କଣ?”");
}
function demoLogin(method){toast(`${method} demo authentication successful`);setTimeout(()=>showPage("dashboard"),500)}
async function renderLands(){
  const q=document.getElementById("landSearch")?.value||"";
  let data;
  try{const r=await fetch(`${API}/lands?q=${encodeURIComponent(q)}`);data=await r.json()}catch{data=[
    {id:"LAND-001",title:"Verified 2.4-acre loamy field",location:"Ganjam, Odisha",area:2.4,price:18000,irrigation:"Available",soil:"Loamy",ph:6.7,verified:true},
    {id:"LAND-002",title:"1.8-acre irrigated farmland",location:"Berhampur, Odisha",area:1.8,price:15000,irrigation:"Available",soil:"Sandy loam",ph:6.4,verified:true}
  ]}
  document.getElementById("landList").innerHTML=data.map(l=>`
    <article class="listing-card"><div class="listing-top"><span class="listing-icon">🏞️</span><span class="verified-pill">${l.verified?"✓ Verified":"Pending"}</span></div>
    <h3>${l.title}</h3><p>📍 ${l.location}</p><div class="listing-meta"><span>Area<b>${l.area} acres</b></span><span>Rent<b>₹${Number(l.price).toLocaleString()}/lease</b></span><span>Soil<b>${l.soil}</b></span><span>pH<b>${l.ph}</b></span></div>
    <p>💧 Irrigation: ${l.irrigation}</p><button class="primary-btn" style="width:100%" onclick="requestLand('${l.id}')">Request Rental</button></article>`).join("");
}
async function requestLand(id){
  try{await fetch(`${API}/lands/${id}/request`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({farmerId:"DEMO-FARMER-001"})})}catch{}
  toast("Rental request submitted • status: Pending");
}
let equipmentData=[];
async function renderEquipment(){
  try{const r=await fetch(`${API}/equipment`);equipmentData=await r.json()}catch{equipmentData=[
    {id:"EQ-001",name:"Mahindra Tractor",type:"Tractor",pricePerHour:1200,location:"Ganjam",available:true},
    {id:"EQ-002",name:"Rotavator",type:"Rotavator",pricePerHour:650,location:"Berhampur",available:true},
    {id:"EQ-003",name:"Power Sprayer",type:"Sprayer",pricePerHour:300,location:"Ganjam",available:true}
  ]}
  paintEquipment(equipmentData)
}
function filterEquipment(q){paintEquipment(equipmentData.filter(e=>`${e.name} ${e.type} ${e.location}`.toLowerCase().includes(q.toLowerCase())))}
function paintEquipment(data){document.getElementById("equipmentList").innerHTML=data.map(e=>`
<article class="listing-card"><div class="listing-top"><span class="listing-icon">${e.type==="Tractor"?"🚜":e.type==="Rotavator"?"⚙️":"💦"}</span><span class="verified-pill">🟢 Available</span></div>
<h3>${e.name}</h3><p>📍 ${e.location} • ${e.type}</p><div class="listing-meta"><span>Hourly<b>₹${e.pricePerHour}</b></span><span>Booking<b>Flexible</b></span></div>
<button class="primary-btn" style="width:100%" onclick="bookEquipment('${e.id}')">Book for 4 hours</button></article>`).join("")}
async function bookEquipment(id){try{const r=await fetch(`${API}/equipment/${id}/book`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({hours:4,farmerId:"DEMO-FARMER-001"})});const d=await r.json();toast(`Booking ${d.bookingId||"confirmed"} • Total ₹${d.total||4800}`)}catch{toast("Equipment booking confirmed • demo mode")}}
async function getRecommendations(){
  const input={ph:6.7,nitrogen:"Medium",phosphorus:"High",potassium:"Medium",moisture:.65,irrigation:true,season:"Kharif"};
  let d;try{const r=await fetch(`${API}/recommendations`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)});d=await r.json()}catch{d={results:[{crop:"Paddy",score:94,reasons:["pH is suitable.","NPK profile is broadly compatible.","Moisture is suitable.","Irrigation availability matches.","Season is suitable."],limitations:[]},{crop:"Maize",score:87,reasons:["pH is suitable.","NPK profile is broadly compatible.","Moisture is suitable."],limitations:["Needs careful moisture management."]},{crop:"Groundnut",score:81,reasons:["pH is suitable.","NPK profile is broadly compatible."],limitations:["Season and irrigation may require attention."]}]}}
  document.getElementById("recommendations").innerHTML=d.results.map(r=>`<div class="recommendation"><div class="rec-head"><b>🌱 ${r.crop}</b><span class="rec-score">${r.score}%</span></div><progress value="${r.score}" max="100"></progress><ul>${r.reasons.slice(0,4).map(x=>`<li>✓ ${x}</li>`).join("")}</ul>${r.limitations?.[0]?`<small>⚠ ${r.limitations[0]}</small>`:""}</div>`).join("");
}
async function generateToken(){
  try{const r=await fetch(`${API}/tokens/generate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({farmerId:"DEMO-FARMER-001",crop:"Paddy",quantityKg:1850,grade:"A",centre:"Ganjam Centre #04"})});const d=await r.json();document.getElementById("tokenId").textContent=d.tokenId||"ACT-2026-08-004829"}catch{}
  document.getElementById("qrBox").textContent="▦";toast("Digital procurement token generated • demo mode");
}
async function verifyToken(){
  const id=document.getElementById("tokenId").textContent;
  let d;try{const r=await fetch(`${API}/tokens/${encodeURIComponent(id)}/verify`);d=await r.json()}catch{d={valid:true,status:"VERIFIED",crop:"Paddy",quantityKg:1850,grade:"A",centre:"Ganjam Centre #04",paymentStatus:"PROCESSED"}}
  document.getElementById("verifyResult").innerHTML=`<div class="verify-ok">✓ ${d.status} • ${d.crop} • ${d.quantityKg} kg • Payment ${d.paymentStatus}</div>`;toast("Token verification successful");
}
function runDemo(){
  showPage("dashboard");
  const steps=["Identity verified","Land registered","Soil profile created","Crop recommended","Tractor booked","Harvest recorded","Procurement verified","Token generated","Payment processed"];
  let i=0;const timer=setInterval(()=>{toast(`Demo Simulation: ${steps[i]}`);i++;if(i>=steps.length)clearInterval(timer)},850);
}
document.addEventListener("DOMContentLoaded",()=>{renderLands();renderEquipment();getRecommendations()});
function recordHarvest(){toast("Harvest recorded: Paddy • 1,850 kg • Demo mode");setTimeout(()=>showPage("procurement"),700)}
