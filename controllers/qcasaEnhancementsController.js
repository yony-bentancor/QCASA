const store=require('../repositories/qcasaRepository');
const base=require('./qcasaController');
const emailService=require('../services/emailService');

const clean=v=>String(v||'').trim();
const email=v=>clean(v).toLowerCase();
const phone=v=>clean(v).replace(/\D/g,'').replace(/^598/,'').replace(/^0/,'');

/*
  Este controlador conserva únicamente acciones adicionales de QCASA.
  Las acciones base ya no se envuelven ni interceptan res.render.
  Eso evita depender de efectos secundarios síncronos y prepara el flujo
  para repositorios/Mongo asíncronos en las siguientes etapas.
*/
exports.userCreate=base.userCreateProperty;
exports.userUpdate=base.userUpdateProperty;
exports.userPublishedChanges=base.userSubmitPublishedChanges;
exports.adminCreate=base.adminCreate;
exports.adminUpdate=base.adminUpdate;
exports.adminDashboard=base.adminDashboard;
exports.detail=base.detail;
exports.inquiry=(req,res,next)=>{
  const before=new Set(store.inquiries.map(i=>i.id));
  base.inquiry(req,res,next);
  const inquiry=store.inquiries.find(i=>!before.has(i.id));
  if(inquiry)emailService.notifyNewInquiry(inquiry).catch(err=>console.error('Email QCASA:',err.message));
};
exports.userDashboard=base.userDashboard;

function qualityFor(p){
  const checks=[
    ['Fotos',p.images&&p.images.length>=5],
    ['Ubicación',p.city&&p.department&&p.lat&&p.lng],
    ['Descripción',clean(p.summary).length>=80],
    ['Video',p.videoUrl],
    ['Características',p.area&&(p.bedrooms||p.bathrooms||p.category)],
    ['Contacto',p.ownerPhone||p.contact]
  ];
  return{
    score:Math.round(checks.filter(x=>x[1]).length/checks.length*100),
    missing:checks.filter(x=>!x[1]).map(x=>x[0]).join(' · ')
  };
}

exports.adminProperties=(req,res)=>{
  const selected=clean(req.query.status)||'Todos';
  const all=store.properties.slice().sort((a,b)=>new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0));
  const counts={
    Todos:all.length,
    Publicada:all.filter(p=>p.status==='Publicada').length,
    Pendiente:all.filter(p=>p.status==='Pendiente').length,
    Rechazada:all.filter(p=>p.status==='Rechazada').length,
    Borrador:all.filter(p=>p.status==='Borrador').length,
    Cambios:all.filter(p=>p.changeStatus==='Pendiente'&&p.pendingChanges).length,
    Videos:all.filter(p=>p.videoUrl||p.pendingChanges?.videoUrl).length
  };
  let properties=all;
  if(selected==='Cambios')properties=all.filter(p=>p.changeStatus==='Pendiente'&&p.pendingChanges);
  else if(selected==='Videos')properties=all.filter(p=>p.videoUrl||p.pendingChanges?.videoUrl);
  else if(selected!=='Todos')properties=all.filter(p=>p.status===selected);

  res.render('qcasa/admin/properties.njk',{
    title:'Propiedades | Administración QCASA',
    properties:properties.map(p=>({...p,quality:qualityFor(p)})),
    selected,
    counts
  });
};

exports.adminSetStatus=(req,res)=>{
  const property=store.findById(req.params.id);
  if(!property)return res.status(404).send('Propiedad no encontrada.');
  const status=clean(req.body.status);
  if(!['Borrador','Pendiente','Publicada','Rechazada'].includes(status))return res.status(400).send('Estado inválido.');
  const oldStatus=property.status;
  property.status=status;
  property.updatedAt=new Date().toISOString();
  if(status==='Publicada'){
    property.reviewedAt=new Date().toISOString();
    property.reviewNote='Publicada por administración.';
  }
  if(property.ownerUserId&&oldStatus!==status){
    store.addNotification(property.ownerUserId,{
      type:status==='Publicada'?'success':'info',
      title:`Estado actualizado: ${status}`,
      message:`"${property.title}" ahora está ${status.toLowerCase()}.`,
      propertyId:property.id
    });
  }
  res.redirect(req.get('referer')||'/qcasa/admin/propiedades');
};

function userFor(inquiry){
  if(inquiry.userId){
    const user=store.findUserById(inquiry.userId);
    if(user)return user;
  }
  return store.users.find(user=>(inquiry.email&&email(inquiry.email)===email(user.email))||(inquiry.phone&&phone(inquiry.phone)===phone(user.phone)))||null;
}

exports.contact=(req,res)=>{
  const reason=clean(req.body.reason)||'Consulta general';
  const name=clean(req.body.name),ph=clean(req.body.phone),em=clean(req.body.email),message=clean(req.body.message);
  if(!name||!ph||!message)return res.status(400).send('Completá nombre, teléfono y mensaje.');
  const inquiry={
    id:`CON-${Date.now()}`,
    propertyId:null,
    propertyTitle:`Contacto QCASA · ${reason}`,
    name,phone:ph,email:em,message,status:'Nueva',source:'Contacto general',reason,
    userId:req.session?.qcasaUser?.id||null,replies:[],createdAt:new Date().toISOString()
  };
  store.inquiries.unshift(inquiry);
  emailService.notifyNewInquiry(inquiry).catch(err=>console.error('Email QCASA:',err.message));
  res.redirect('/qcasa?contacto=1');
};

exports.adminReplyInquiry=(req,res)=>{
  const inquiry=store.findInquiry(req.params.id);
  if(!inquiry)return res.status(404).send('Consulta no encontrada.');
  const message=clean(req.body.message);
  if(!message)return res.status(400).send('Escribí una respuesta.');
  if(!Array.isArray(inquiry.replies))inquiry.replies=[];
  inquiry.replies.push({id:`R-${Date.now()}`,message,createdAt:new Date().toISOString(),author:'QCASA'});
  inquiry.repliedAt=new Date().toISOString();
  inquiry.lastReply=message;
  if(inquiry.status==='Nueva')inquiry.status='Contactado';
  const user=userFor(inquiry);
  if(user){
    inquiry.userId=user.id;
    store.addNotification(user.id,{type:'info',title:'QCASA respondió tu consulta',message:`Tenés una nueva respuesta sobre "${inquiry.propertyTitle}".`,propertyId:inquiry.propertyId||null});
  }
  res.redirect((req.get('referer')||'/qcasa/admin/consultas')+'#'+inquiry.id);
};
