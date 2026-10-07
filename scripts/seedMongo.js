require('dotenv').config();
const mongoose=require('mongoose');
const {connectDatabase,disconnectDatabase}=require('../config/database');
const qc=require('../data/qcasaMarketplaceStore');
const User=require('../models/User'); const Listing=require('../models/Listing'); const Inquiry=require('../models/Inquiry'); const Notification=require('../models/Notification'); const Setting=require('../models/Setting');
const asDate=v=>v?new Date(v):undefined;
const clean=o=>JSON.parse(JSON.stringify(o));
async function replace(Model,docs){ if(!docs.length)return; await Model.insertMany(docs,{ordered:false}); }
async function run(){
  if(String(process.env.ALLOW_MONGO_SEED||'').toLowerCase()!=='true') throw new Error('Semilla bloqueada. Usá ALLOW_MONGO_SEED=true únicamente contra una base de pruebas vacía.');
  if(String(process.env.USE_MONGO||'').toLowerCase()!=='true') throw new Error('La semilla requiere USE_MONGO=true.');
  await connectDatabase();
  const dbName=mongoose.connection.name;
  if(!/demo|test|dev/i.test(dbName) && String(process.env.ALLOW_NONTEST_SEED||'').toLowerCase()!=='true') throw new Error(`Base "${dbName}" no parece de pruebas. Semilla cancelada.`);
  const collections=[User,Listing,Inquiry,Notification,Setting];
  for(const M of collections) await M.deleteMany({});
  await replace(User,qc.users.map(u=>({legacyId:u.id,scope:'qcasa',role:'user',name:u.name,email:u.email,phone:u.phone,password:u.password,active:u.active!==false})));
  await User.create({legacyId:qc.admin.id,scope:'qcasa',role:'admin',name:qc.admin.name,email:qc.admin.email,password:qc.admin.password,active:true});
  await replace(Listing,qc.properties.map(p=>({...clean(p),listingId:p.id,_id:undefined,submittedAt:asDate(p.submittedAt),reviewedAt:asDate(p.reviewedAt),createdAt:asDate(p.createdAt)})));
  await replace(Inquiry,(qc.inquiries||[]).map(i=>({...clean(i),legacyId:i.id,_id:undefined,createdAt:asDate(i.createdAt)})));
  const notes=[...(qc.notifications||[]).map(n=>({...n,audience:'user'})),...(qc.adminNotifications||[]).map(n=>({...n,audience:'admin'}))];
  await replace(Notification,notes.map(n=>({...clean(n),legacyId:n.id,_id:undefined,createdAt:asDate(n.createdAt)})));
  await Setting.create({scope:'qcasa',values:clean(qc.settings)});
  console.log(`Semilla QCASA completada en ${dbName}: ${qc.properties.length} publicaciones.`);
  await disconnectDatabase();
}
run().catch(async err=>{console.error(err.message);try{await disconnectDatabase();}catch{}process.exitCode=1;});
