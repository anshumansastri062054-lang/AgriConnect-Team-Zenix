import http from 'node:http';
import crypto from 'node:crypto';

const port = 4000;
const lands = [
  { id:'LAND-001', title:'Verified 2.4-acre loamy field', location:'Ganjam, Odisha', area:2.4, price:18000, irrigation:'Available', soil:'Loamy', ph:6.7, verified:true },
  { id:'LAND-002', title:'1.8-acre irrigated farmland', location:'Berhampur, Odisha', area:1.8, price:15000, irrigation:'Available', soil:'Sandy loam', ph:6.4, verified:true },
  { id:'LAND-003', title:'3.1-acre field near canal', location:'Khordha, Odisha', area:3.1, price:22500, irrigation:'Canal', soil:'Clay loam', ph:6.2, verified:true }
];
const equipment = [
  { id:'EQ-001', name:'Mahindra Tractor', type:'Tractor', pricePerHour:1200, location:'Ganjam', available:true },
  { id:'EQ-002', name:'Rotavator', type:'Rotavator', pricePerHour:650, location:'Berhampur', available:true },
  { id:'EQ-003', name:'Power Sprayer', type:'Sprayer', pricePerHour:300, location:'Ganjam', available:true },
  { id:'EQ-004', name:'Power Tiller', type:'Power Tiller', pricePerHour:800, location:'Khordha', available:true }
];
const bookings=[];
const requests=[];
const tokens=new Map([['ACT-2026-08-004829',{valid:true,status:'VERIFIED',tokenId:'ACT-2026-08-004829',crop:'Paddy',quantityKg:1850,grade:'A',centre:'Ganjam Centre #04',paymentStatus:'PROCESSED'}]]);

function send(res,status,data){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'GET,POST,PUT,DELETE,OPTIONS'});res.end(JSON.stringify(data));}
function body(req){return new Promise((resolve,reject)=>{let b='';req.on('data',c=>b+=c);req.on('end',()=>{try{resolve(b?JSON.parse(b):{})}catch(e){reject(e)}})})}
function cropScore(input,crop){const ranges={Paddy:[5.5,7.5,.9,true,['Kharif']],Maize:[5.8,7,.65,true,['Kharif','Rabi']],Groundnut:[6,7,.55,false,['Kharif']]};const [lo,hi,moist,irr,seasons]=ranges[crop];let score=0,reasons=[],limitations=[];if(input.ph>=lo&&input.ph<=hi){score+=25;reasons.push('pH is suitable.')}else limitations.push('Soil pH is outside the preferred range.');if(input.nitrogen!=='Low'&&input.phosphorus!=='Low'&&input.potassium!=='Low'){score+=25;reasons.push('NPK profile is broadly compatible.')}else limitations.push('Nutrient profile needs attention.');if(Math.abs(input.moisture-moist)<=.25){score+=15;reasons.push('Moisture is suitable.')}else limitations.push('Moisture needs management.');if(input.irrigation===irr||(!irr&&input.irrigation)){score+=10;reasons.push('Irrigation availability matches.')}else limitations.push('Irrigation availability may constrain cultivation.');if(seasons.includes(input.season)){score+=15;reasons.push('Season is suitable.')}else limitations.push('Season is not the preferred window.');score+=10;reasons.push('Previous-crop rotation is acceptable for this demo.');return {crop,score,reasons,limitations};}

const server=http.createServer(async(req,res)=>{
  if(req.method==='OPTIONS') return send(res,204,{});
  try{
    const u=new URL(req.url,`http://${req.headers.host}`); const path=u.pathname;
    if(req.method==='GET'&&path==='/api/health') return send(res,200,{status:'ok',service:'AgriConnect Local API',mode:'demo'});
    if(req.method==='POST'&&path==='/api/auth/mobile/send-otp') return send(res,200,{success:true,message:'Demo OTP sent.',demoOnly:true});
    if(req.method==='POST'&&path==='/api/auth/mobile/verify-otp'){const b=await body(req);if(String(b.otp)!=='123456')return send(res,401,{error:'Invalid demo OTP'});return send(res,200,{success:true,farmerId:'DEMO-FARMER-001',message:'Demo authentication successful.'});}
    if(req.method==='GET'&&path==='/api/lands'){const q=(u.searchParams.get('q')||'').toLowerCase();return send(res,200,lands.filter(l=>!q||`${l.title} ${l.location} ${l.soil}`.toLowerCase().includes(q)));}
    if(req.method==='POST'&&/^\/api\/lands\/[^/]+\/request$/.test(path)){const id=path.split('/')[3];const item={id:`RR-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,landId:id,status:'PENDING',createdAt:new Date().toISOString()};requests.push(item);return send(res,201,item);}
    if(req.method==='GET'&&path==='/api/equipment') return send(res,200,equipment);
    if(req.method==='POST'&&/^\/api\/equipment\/[^/]+\/book$/.test(path)){const id=path.split('/')[3];const e=equipment.find(x=>x.id===id);if(!e)return send(res,404,{error:'Equipment not found'});const b=await body(req);const hours=Math.max(1,Number(b.hours||1));const item={bookingId:`BK-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,equipmentId:id,equipment:e.name,hours,total:hours*e.pricePerHour,status:'CONFIRMED'};bookings.push(item);return send(res,201,item);}
    if(req.method==='POST'&&path==='/api/recommendations'){const b=await body(req);const results=['Paddy','Maize','Groundnut'].map(c=>cropScore(b,c)).sort((a,z)=>z.score-a.score);return send(res,200,{informational:true,results});}
    if(req.method==='POST'&&path==='/api/tokens/generate'){const b=await body(req);const tokenId=`ACT-2026-08-${Math.floor(100000+Math.random()*899999)}`;const payload=`${tokenId}|${b.farmerId}|${b.crop}|${b.quantityKg}|${b.grade}|${b.centre}`;const hash=crypto.createHash('sha256').update(payload).digest('hex');const t={valid:true,status:'VERIFIED',tokenId,verificationHash:hash,crop:b.crop,quantityKg:b.quantityKg,grade:b.grade,centre:b.centre,paymentStatus:'PROCESSED',demoOnly:true};tokens.set(tokenId,t);return send(res,201,t);}
    if(req.method==='GET'&&/^\/api\/tokens\/[^/]+\/verify$/.test(path)){const id=decodeURIComponent(path.split('/')[3]);return send(res,200,tokens.get(id)||{valid:false,status:'INVALID',tokenId:id});}
    return send(res,404,{error:'Route not found'});
  }catch(e){return send(res,500,{error:'Internal demo API error'});}
});
server.listen(port,()=>console.log(`AgriConnect Local API: http://localhost:${port}`));
