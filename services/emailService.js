const nodemailer=require('nodemailer');
let transporter=null;
function configured(){return Boolean(process.env.SMTP_HOST&&process.env.SMTP_USER&&process.env.SMTP_PASS)}
function getTransport(){
  if(!configured())return null;
  if(!transporter)transporter=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:String(process.env.SMTP_SECURE||'false')==='true',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
  return transporter;
}
async function send({to,subject,text}){
  const t=getTransport(); if(!t||!to)return {sent:false,reason:'smtp-not-configured'};
  await t.sendMail({from:process.env.MAIL_FROM||process.env.SMTP_USER,to,subject,text}); return {sent:true};
}
function notifyNewInquiry(i){
  const to=process.env.QCASA_NOTIFY_EMAIL;
  return send({to,subject:`QCASA · Nueva consulta · ${i.propertyTitle||'Contacto'}`,text:`Nombre: ${i.name||'-'}\nTeléfono: ${i.phone||'-'}\nEmail: ${i.email||'-'}\nPropiedad: ${i.propertyTitle||'-'}\n\n${i.message||''}`});
}
module.exports={configured,send,notifyNewInquiry};
