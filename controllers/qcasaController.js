const store=require('../repositories/qcasaRepository');

const publicProperties=()=>store.properties.filter(p=>p.status==='Publicada');
const cleanEmail=v=>String(v||'').trim().toLowerCase();
const clean=v=>String(v||'').trim();
const sessionUser=req=>req.session?.qcasaUser||null;
const isAdmin=req=>Boolean(req.session?.qcasaAdmin);
const normalizePhone=v=>clean(v).replace(/\D/g,'').replace(/^598/,'').replace(/^0/,'');

function safeVideoUrl(raw){
  const value=clean(raw);
  if(!value)return '';
  let url;try{url=new URL(value);}catch{return '';}
  if(url.protocol!=='https:')return '';
  const host=url.hostname.toLowerCase().replace(/^www\./,'');
  let id='';
  if(host==='youtu.be')id=url.pathname.split('/').filter(Boolean)[0]||'';
  else if(host==='youtube.com'||host==='m.youtube.com'){
    if(url.pathname==='/watch')id=url.searchParams.get('v')||'';
    else if(url.pathname.startsWith('/embed/'))id=url.pathname.split('/')[2]||'';
  }
  if(id&&/^[A-Za-z0-9_-]{6,}$/.test(id))return `https://www.youtube.com/embed/${id}`;
  if(host==='vimeo.com'&&/^\/\d+$/.test(url.pathname))return `https://player.vimeo.com/video/${url.pathname.slice(1)}`;
  return '';
}

function inquiryBelongsToUser(inquiry,user){
  if(inquiry.userId)return inquiry.userId===user.id;
  return (inquiry.email&&cleanEmail(inquiry.email)===cleanEmail(user.email))||
    (inquiry.phone&&normalizePhone(inquiry.phone)===normalizePhone(user.phone));
}

function whatsappPhone(raw){
  let digits=String(raw||'').replace(/\D/g,'');
  if(!digits)return '';
  if(digits.startsWith('598'))return digits;
  if(digits.startsWith('0'))digits=digits.slice(1);
  return `598${digits}`;
}
function whatsappUrl(phone,message){
  const normalized=whatsappPhone(phone);
  if(!normalized)return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message||'')}`;
}

const fmt=n=>Number(n||0).toLocaleString('es-UY',{maximumFractionDigits:0});

function amountIn(currency,amount,target){
  const rate=Number(store.settings.uyuPerUsd||1);
  if(currency===target)return Number(amount||0);
  if(currency==='USD'&&target==='UYU')return Number(amount||0)*rate;
  if(currency==='UYU'&&target==='USD')return Number(amount||0)/rate;
  return Number(amount||0);
}

function moneyFor(req){
  const mode=req.session?.qcasaCurrency||store.settings.currencyDisplay||'USD';
  return p=>{
    const currency=p.currency||'USD';
    const amount=Number(p.price||0);
    const usd=amountIn(currency,amount,'USD');
    const uyu=amountIn(currency,amount,'UYU');
    if(mode==='USD')return `USD ${fmt(usd)}`;
    if(mode==='UYU')return `UYU ${fmt(uyu)}`;
    return `USD ${fmt(usd)}`;
  };
}

function uploadedPhotos(req){
  return (req.files||[]).map(file=>`/uploads/qcasa/${file.filename}`);
}

function userFormPayload(req){
  return{
    title:clean(req.body.title),
    category:clean(req.body.category)||'Casa',
    operation:clean(req.body.operation)||'Venta',
    department:clean(req.body.department)||'Colonia',
    city:clean(req.body.city),
    currency:clean(req.body.currency)||'USD',
    price:Number(req.body.price||0),
    bedrooms:Number(req.body.bedrooms||0),
    bathrooms:Number(req.body.bathrooms||0),
    area:Number(req.body.area||0),
    summary:clean(req.body.summary),
    contact:clean(req.body.contact),
    lat:req.body.lat!==undefined&&req.body.lat!==''?Number(req.body.lat):null,
    lng:req.body.lng!==undefined&&req.body.lng!==''?Number(req.body.lng):null,
    garage:req.body.garage==='on'||req.body.garage==='1',
    furnished:req.body.furnished==='on'||req.body.furnished==='1',
    garden:req.body.garden==='on'||req.body.garden==='1',
    featured:false,
    videoUrl:safeVideoUrl(req.body.videoUrl),
    tone:(clean(req.body.category)||'propiedad').toLowerCase()
  };
}
const adminFormPayload=req=>({...userFormPayload(req),featured:req.body.featured==='on'});

function withPhotos(req,data,property=null){
  const newPhotos=uploadedPhotos(req);
  const existing=property?.images||[];
  const photos=newPhotos.length?[...existing,...newPhotos]:existing;
  if(!photos.length){
    const fallback='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=78';
    return {image:fallback,images:[fallback]};
  }
  return {image:photos[0],images:photos};
}

function dashboardPerformance(){
  return publicProperties().map(p=>{
    const pInquiries=store.inquiries.filter(i=>i.propertyId===p.id);
    const visits=pInquiries.filter(i=>['Visita','Negociación','Cerrada'].includes(i.status)).length;
    return {...p,inquiryCount:pInquiries.length,visitCount:visits};
  }).sort((a,b)=>{
    if(b.inquiryCount!==a.inquiryCount)return b.inquiryCount-a.inquiryCount;
    return b.views-a.views;
  }).slice(0,6);
}

function staleProperties(){
  const days=Number(store.settings.staleDays||30);
  const cutoff=Date.now()-days*86400000;
  return publicProperties().filter(p=>{
    const created=new Date(p.createdAt||0).getTime();
    const count=store.inquiries.filter(i=>i.propertyId===p.id).length;
    return created<cutoff&&count===0;
  });
}

function audienceUsers(audience,department){
  let users=store.users.filter(u=>u.active!==false);
  if(audience==='pending'){
    users=users.filter(u=>store.userProperties(u.id).some(p=>p.status==='Pendiente'));
  }else if(audience==='published'){
    users=users.filter(u=>store.userProperties(u.id).some(p=>p.status==='Publicada'));
  }else if(audience==='rejected'){
    users=users.filter(u=>store.userProperties(u.id).some(p=>p.status==='Rechazada'));
  }
  if(department){
    users=users.filter(u=>store.userProperties(u.id).some(p=>p.department===department));
  }
  return users;
}


function sharePropertyUrl(req,p){
  const base=`${req.protocol}://${req.get('host')}`;
  const text=`Mirá esta propiedad en QCASA: ${p.title} · ${moneyFor(req)(p)} · ${base}/qcasa/propiedad/${p.slug}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
function filterProperties(req){
  const f=req.query||{}, q=clean(f.q).toLowerCase(), category=clean(f.category), operation=clean(f.operation), department=clean(f.department);
  const minPrice=Number(f.minPrice||0),maxPrice=Number(f.maxPrice||0),bedrooms=Number(f.bedrooms||0),bathrooms=Number(f.bathrooms||0),minArea=Number(f.minArea||0),maxArea=Number(f.maxArea||0);
  const target=req.session?.qcasaCurrency==='UYU'?'UYU':'USD';
  return publicProperties().filter(p=>{
    const hay=[p.title,p.summary,p.city,p.department,p.category].join(' ').toLowerCase();
    const price=amountIn(p.currency,p.price,target);
    return (!q||hay.includes(q))&&(!category||p.category===category)&&(!operation||p.operation===operation)&&(!department||p.department===department)
      &&(!minPrice||price>=minPrice)&&(!maxPrice||price<=maxPrice)
      &&(!bedrooms||Number(p.bedrooms)>=bedrooms)&&(!bathrooms||Number(p.bathrooms)>=bathrooms)
      &&(!minArea||Number(p.area)>=minArea)&&(!maxArea||Number(p.area)<=maxArea)
      &&(!f.garage||p.garage)&&(!f.furnished||p.furnished)&&(!f.garden||p.garden);
  });
}

/* Público */
exports.currencyPreference=(req,res)=>{
  const value=clean(req.body.currencyMode);
  if(['USD','UYU'].includes(value))req.session.qcasaCurrency=value;
  res.redirect(req.get('referer')||'/qcasa');
};

exports.home=(req,res)=>{
  const featured=publicProperties().filter(p=>p.featured).slice(0,Number(store.settings.featuredLimit||4));
  const latest=publicProperties().slice(0,6);
  res.render('qcasa/home.njk',{title:'QCASA | Encontrá tu próximo lugar',featured,latest,categories:store.categories,money:moneyFor(req),qcasaUser:sessionUser(req)});
};

exports.search=(req,res)=>{
  const allResults=filterProperties(req).map(p=>({...p,shareWhatsApp:sharePropertyUrl(req,p)}));
  const departments=[...new Set(publicProperties().map(p=>p.department))].sort();
  const advancedKeys=['minPrice','maxPrice','bedrooms','bathrooms','minArea','maxArea','garage','furnished','garden'];
  const advancedActive=advancedKeys.some(k=>req.query[k]);
  const newOnly=Boolean(req.query.qcNewSince);
  const perPage=newOnly?Math.max(allResults.length,1):12;
  const totalPages=Math.max(1,Math.ceil(allResults.length/perPage));
  const page=Math.min(totalPages,Math.max(1,Number.parseInt(req.query.page,10)||1));
  const results=newOnly?allResults:allResults.slice((page-1)*perPage,page*perPage);
  const baseQuery={...req.query}; delete baseQuery.page;
  const queryString=new URLSearchParams(baseQuery).toString();
  const pageHref=n=>`/qcasa/buscar?${new URLSearchParams({...baseQuery,page:String(n)}).toString()}`;
  res.render('qcasa/search.njk',{title:'Buscar | QCASA',results,totalResults:allResults.length,categories:store.categories,departments,filters:req.query,money:moneyFor(req),qcasaUser:sessionUser(req),advancedActive,queryString,pagination:{page,totalPages,prev:page>1?pageHref(page-1):null,next:page<totalPages?pageHref(page+1):null}});
};

exports.map=(req,res)=>{
  const results=filterProperties(req);
  const money=moneyFor(req);
  const mapData=results.filter(p=>Number.isFinite(Number(p.lat))&&Number.isFinite(Number(p.lng))).map(p=>({
    id:p.id,slug:p.slug,title:p.title,category:p.category,operation:p.operation,city:p.city,area:p.area,bedrooms:p.bedrooms,
    lat:Number(p.lat),lng:Number(p.lng),image:p.image,priceLabel:money(p),
    priceShort:(req.session?.qcasaCurrency==='UYU'?'$ ':'USD ')+fmt(amountIn(p.currency,p.price,req.session?.qcasaCurrency==='UYU'?'UYU':'USD')),
    shareWhatsApp:sharePropertyUrl(req,p)
  }));
  const cleanQuery={...req.query};delete cleanQuery.property;
  res.render('qcasa/map.njk',{title:'Mapa | QCASA',results,mapProperties:JSON.stringify(mapData).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026'),focusProperty:clean(req.query.property),queryString:new URLSearchParams(cleanQuery).toString()});
};

exports.detail=(req,res)=>{
  const property=store.findBySlug(req.params.slug);
  if(!property||property.status!=='Publicada')return res.status(404).send('Propiedad no encontrada.');
  property.views=Number(property.views||0)+1;
  const galleryImages=JSON.stringify(property.images?.length?property.images:[property.image]).replace(/</g,'\\u003c');
  const similar=publicProperties().filter(p=>p.id!==property.id).slice(0,3);
  res.render('qcasa/detail.njk',{title:`${property.title} | QCASA`,metaDescription:clean(property.summary)||`${property.category} en ${property.operation.toLowerCase()} en ${property.city}.`,metaImage:property.image,property,money:moneyFor(req),consulted:req.query.consulta==='1',qcasaUser:sessionUser(req),
    galleryImages,similar,
    whatsappQcasa:whatsappUrl(store.settings.contactPhone,`Hola QCASA, me interesa la propiedad ${property.title} (${property.id}).`),
    shareWhatsApp:sharePropertyUrl(req,property)
  });
};

exports.inquiry=(req,res)=>{
  const property=store.findBySlug(req.params.slug);
  if(!property||property.status!=='Publicada')return res.status(404).send('Propiedad no encontrada.');
  store.inquiries.unshift({
    id:`CON-${Date.now()}`,propertyId:property.id,propertyTitle:property.title,
    name:clean(req.body.name),phone:clean(req.body.phone),email:clean(req.body.email),
    message:clean(req.body.message),status:'Nueva',userId:sessionUser(req)?.id||null,replies:[],createdAt:new Date().toISOString()
  });
  res.redirect(`/qcasa/propiedad/${property.slug}?consulta=1`);
};

/* Login / registro */
exports.loginForm=(req,res)=>res.render('qcasa/login.njk',{title:'Ingresar | QCASA',error:null,demoAdmin:store.admin,demoUser:store.users[0]});

exports.login=(req,res)=>{
  const email=cleanEmail(req.body.email),password=String(req.body.password||'');
  if(email===store.admin.email.toLowerCase()&&password===store.admin.password){
    req.session.qcasaAdmin={id:store.admin.id,email:store.admin.email,name:store.admin.name};
    delete req.session.qcasaUser;
    return req.session.save(()=>res.redirect('/qcasa/admin'));
  }
  const user=store.findUserByEmail(email);
  if(user&&user.active!==false&&user.password===password){
    req.session.qcasaUser={id:user.id,email:user.email,name:user.name,phone:user.phone};
    delete req.session.qcasaAdmin;
    return req.session.save(()=>res.redirect('/qcasa/mi-qcasa'));
  }
  return res.status(401).render('qcasa/login.njk',{title:'Ingresar | QCASA',error:'Usuario o contraseña incorrectos.',demoAdmin:store.admin,demoUser:store.users[0]});
};

exports.registerForm=(req,res)=>res.render('qcasa/register.njk',{title:'Crear cuenta | QCASA',error:null,publishNext:req.query.publicar==='1'});
exports.register=(req,res)=>{
  const name=clean(req.body.name),email=cleanEmail(req.body.email),phone=clean(req.body.phone);
  const password=String(req.body.password||''),password2=String(req.body.password2||'');
  if(!name||!email||!phone||password.length<4)return res.status(400).render('qcasa/register.njk',{title:'Crear cuenta | QCASA',error:'Completá nombre, email, teléfono y una contraseña de al menos 4 caracteres.'});
  if(password!==password2)return res.status(400).render('qcasa/register.njk',{title:'Crear cuenta | QCASA',error:'Las contraseñas no coinciden.'});
  if(email===store.admin.email.toLowerCase()||store.findUserByEmail(email))return res.status(409).render('qcasa/register.njk',{title:'Crear cuenta | QCASA',error:'Ya existe una cuenta con ese email.'});
  const user={id:store.nextUserId(),name,email,phone,password,createdAt:new Date().toISOString(),active:true};
  store.users.push(user);
  req.session.qcasaUser={id:user.id,email:user.email,name:user.name,phone:user.phone};
  req.session.save(()=>res.redirect(req.body.next==='publicar'?'/qcasa/mi-qcasa/publicar':'/qcasa/mi-qcasa'));
};

exports.logout=(req,res)=>{
  delete req.session.qcasaAdmin;delete req.session.qcasaUser;
  req.session.save(()=>res.redirect('/qcasa'));
};
exports.requireAdmin=(req,res,next)=>isAdmin(req)?next():res.redirect('/qcasa/ingresar');
exports.requireUser=(req,res,next)=>sessionUser(req)?next():res.redirect('/qcasa/ingresar');

/* Usuario */
exports.userDashboard=(req,res)=>{
  const user=store.findUserById(req.session.qcasaUser.id);
  if(!user||user.active===false){delete req.session.qcasaUser;return res.redirect('/qcasa/ingresar');}
  const properties=store.userProperties(user.id).slice().sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
  const notifications=store.userNotifications(user.id),unread=notifications.filter(n=>!n.read).length;
  const myInquiries=store.inquiries.filter(i=>inquiryBelongsToUser(i,user)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).map(i=>({...i,replies:Array.isArray(i.replies)?i.replies:[]}));
  res.render('qcasa/user/dashboard.njk',{title:'Mi QCASA',user,properties,notifications:notifications.slice(0,12),unread,myInquiries,money:moneyFor(req),
    whatsappQcasa:whatsappUrl(store.settings.contactPhone,`Hola QCASA, soy ${user.name}. Quiero hacer una consulta sobre mis publicaciones.`)
  });
};

exports.userNewPropertyForm=(req,res)=>{
  const user=store.findUserById(req.session.qcasaUser.id);
  res.render('qcasa/user/property-form.njk',{title:'Publicar mi propiedad | QCASA',user,property:null,mode:'create',categories:store.categories,departments:store.settings.activeDepartments,error:null});
};

exports.userCreateProperty=(req,res)=>{
  const user=store.findUserById(req.session.qcasaUser.id);if(!user)return res.redirect('/qcasa/ingresar');
  const data=userFormPayload(req);
  if(!data.title||!data.city||!data.price||!data.area||!data.summary)return res.status(400).render('qcasa/user/property-form.njk',{title:'Publicar mi propiedad | QCASA',user,property:null,mode:'create',categories:store.categories,departments:store.settings.activeDepartments,error:'Completá todos los datos obligatorios.'});
  if(!store.settings.activeDepartments.includes(data.department))return res.status(400).render('qcasa/user/property-form.njk',{title:'Publicar mi propiedad | QCASA',user,property:null,mode:'create',categories:store.categories,departments:store.settings.activeDepartments,error:'Este departamento todavía no está habilitado para publicaciones.'});
  const id=store.nextId(),slug=`${store.slugify(data.title)}-${id.toLowerCase()}`,photoData=withPhotos(req,data);
  store.properties.unshift({id,slug,status:'Pendiente',ownerUserId:user.id,ownerName:user.name,ownerEmail:user.email,ownerPhone:user.phone,submittedAt:new Date().toISOString(),createdAt:new Date().toISOString(),reviewedAt:null,reviewNote:'',views:0,...photoData,...data});
  store.addNotification(user.id,{type:'info',title:'Propiedad enviada',message:`Recibimos "${data.title}". El equipo de QCASA la revisará antes de publicarla.`,propertyId:id});
  res.redirect('/qcasa/mi-qcasa?enviada=1');
};

exports.userEditPropertyForm=(req,res)=>{
  const user=store.findUserById(req.session.qcasaUser.id),property=store.findById(req.params.id);
  if(!property||property.ownerUserId!==user?.id)return res.status(404).send('Propiedad no encontrada.');
  if(!['Rechazada','Pendiente','Borrador','Publicada'].includes(property.status))return res.status(409).send('Esta publicación no se puede editar en su estado actual.');
  res.render('qcasa/user/property-form.njk',{title:'Editar publicación | QCASA',user,property,mode:property.status==='Publicada'?'published-edit':'edit',categories:store.categories,departments:store.settings.activeDepartments,error:null});
};

exports.userUpdateProperty=(req,res)=>{
  const user=store.findUserById(req.session.qcasaUser.id),property=store.findById(req.params.id);
  if(!property||property.ownerUserId!==user?.id)return res.status(404).send('Propiedad no encontrada.');
  if(!['Rechazada','Pendiente','Borrador','Publicada'].includes(property.status))return res.status(409).send('Esta publicación no se puede editar en su estado actual.');
  const data=userFormPayload(req),photoData=withPhotos(req,data,property);

  if(property.status==='Publicada'){
    const pending={...data};
    if(req.body.lat===undefined||req.body.lat==='')pending.lat=property.lat;
    if(req.body.lng===undefined||req.body.lng==='')pending.lng=property.lng;
    pending.featured=property.featured;
    property.pendingChanges={...pending,updatedAt:new Date().toISOString()};
    property.pendingChangePhotos=uploadedPhotos(req);
    property.changeStatus='Pendiente';
    store.addAdminNotification({
      type:'property-change',
      title:'Cambio de publicación pendiente',
      message:`${user.name} solicitó cambios en "${property.title}".`,
      propertyId:property.id
    });
    store.addNotification(user.id,{
      type:'info',
      title:'Cambios enviados a revisión',
      message:`Los cambios de "${property.title}" fueron enviados al administrador. La publicación actual seguirá visible hasta que sean aprobados.`,
      propertyId:property.id
    });
    return res.redirect('/qcasa/mi-qcasa');
  }

  Object.assign(property,data,photoData,{updatedAt:new Date().toISOString()});
  if(property.status==='Rechazada')property.status='Borrador';
  res.redirect('/qcasa/mi-qcasa');
};

exports.userSubmitPublishedChanges=(req,res)=>{
  const user=store.findUserById(req.session.qcasaUser.id);
  const property=store.findById(req.params.id);
  if(!property||property.ownerUserId!==user?.id)return res.status(404).send('Propiedad no encontrada.');
  if(property.status!=='Publicada')return res.status(409).send('Esta ruta es sólo para publicaciones activas.');

  const data=userFormPayload(req);
  if(req.body.lat===undefined||req.body.lat==='')data.lat=property.lat;
  if(req.body.lng===undefined||req.body.lng==='')data.lng=property.lng;
  data.featured=property.featured;
  property.pendingChanges={...data,updatedAt:new Date().toISOString()};
  property.pendingChangePhotos=uploadedPhotos(req);
  property.changeStatus='Pendiente';

  store.addAdminNotification({
    type:'property-change',
    title:'Cambio de publicación pendiente',
    message:`${user.name} solicitó cambios en "${property.title}".`,
    propertyId:property.id
  });
  store.addNotification(user.id,{
    type:'info',
    title:'Cambios enviados a revisión',
    message:`Los cambios de "${property.title}" fueron enviados al administrador. La publicación actual seguirá visible hasta que sean aprobados.`,
    propertyId:property.id
  });

  res.redirect('/qcasa/mi-qcasa');
};

exports.userResubmitProperty=(req,res)=>{
  const user=store.findUserById(req.session.qcasaUser.id),property=store.findById(req.params.id);
  if(!property||property.ownerUserId!==user?.id)return res.status(404).send('Propiedad no encontrada.');
  if(!['Rechazada','Borrador'].includes(property.status))return res.status(409).send('No se puede reenviar esta propiedad.');
  property.status='Pendiente';property.submittedAt=new Date().toISOString();property.reviewedAt=null;property.reviewNote='';
  store.addNotification(user.id,{type:'info',title:'Propiedad reenviada',message:`"${property.title}" volvió a revisión.`,propertyId:property.id});
  res.redirect('/qcasa/mi-qcasa');
};

exports.userMarkNotificationsRead=(req,res)=>{
  const userId=req.session.qcasaUser.id;
  store.notifications.filter(n=>n.userId===userId).forEach(n=>{n.read=true;});
  res.redirect('/qcasa/mi-qcasa');
};

/* Admin dashboard */
exports.adminDashboard=(req,res)=>{
  const published=publicProperties(),pending=store.properties.filter(p=>p.status==='Pendiente');
  const newInquiries=store.inquiries.filter(i=>i.status==='Nueva');
  const contacted=store.inquiries.filter(i=>['Contactado','Visita','Negociación','Cerrada'].includes(i.status)).length;
  const visits=store.inquiries.filter(i=>['Visita','Negociación','Cerrada'].includes(i.status)).length;
  const negotiations=store.inquiries.filter(i=>['Negociación','Cerrada'].includes(i.status)).length;
  const closed=store.inquiries.filter(i=>i.status==='Cerrada').length;
  const totalInquiries=store.inquiries.length;
  const stale=staleProperties();
  const rejected=store.properties.filter(p=>p.status==='Rechazada');
  const pendingChanges=store.properties.filter(p=>p.changeStatus==='Pendiente'&&p.pendingChanges);
  const stats={total:store.properties.length,rejected:rejected.length,drafts:store.properties.filter(p=>p.status==='Borrador').length};
  const opportunities={
    noVideo:published.filter(p=>!p.videoUrl).length,
    lowPhotos:published.filter(p=>!p.images||p.images.length<5).length,
    noInquiries:published.filter(p=>!store.inquiries.some(i=>i.propertyId===p.id)).length,
    highInterest:published.slice().sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,3)
  };

  res.render('qcasa/admin/dashboard.njk',{
    title:'Administración | QCASA',stats,opportunities,
    pending:pending.slice(0,4),
    pendingChanges:pendingChanges.slice(0,4),
    adminNotifications:store.adminNotifications.slice(0,8),
    attention:{
      pendingCount:pending.length,
      newInquiryCount:newInquiries.length,
      rejectedCount:rejected.length,
      changeCount:pendingChanges.length,
      staleCount:stale.length,
      oldestNew:newInquiries.slice().sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt))[0]||null
    },
    activity:{
      total:totalInquiries,contacted,visits,negotiations,closed,
      responsePct:totalInquiries?Math.round(contacted/totalInquiries*100):0,
      visitPct:totalInquiries?Math.round(visits/totalInquiries*100):0,
      closePct:totalInquiries?Math.round(closed/totalInquiries*100):0
    },
    performance:dashboardPerformance(),
    stats:{
      published:published.length,pending:pending.length,users:store.users.length,
      sale:published.filter(p=>p.operation==='Venta').length,
      rent:published.filter(p=>p.operation==='Alquiler').length,
      inquiries:totalInquiries
    },
    money:moneyFor(req),
    admin:req.session.qcasaAdmin
  });
};

/* Admin consultas */
exports.adminInquiries=(req,res)=>{
  const selected=clean(req.query.status)||'Pendientes';
  const pendingStatuses=['Nueva','Contactado','Visita','Negociación'];
  const all=store.inquiries.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  const counts={
    Pendientes:all.filter(i=>pendingStatuses.includes(i.status)).length,
    Nueva:all.filter(i=>i.status==='Nueva').length,Contactado:all.filter(i=>i.status==='Contactado').length,
    Visita:all.filter(i=>i.status==='Visita').length,Negociación:all.filter(i=>i.status==='Negociación').length,
    Cerrada:all.filter(i=>i.status==='Cerrada').length,Perdida:all.filter(i=>i.status==='Perdida').length,Todos:all.length
  };
  const filtered=selected==='Todos'?all:selected==='Pendientes'?all.filter(i=>pendingStatuses.includes(i.status)):all.filter(i=>i.status===selected);
  const inquiries=filtered.map(i=>{
    const property=store.findById(i.propertyId),owner=property?.ownerUserId?store.findUserById(property.ownerUserId):null;
    return {...i,property,owner,whatsappInterested:whatsappUrl(i.phone,`Hola ${i.name}, te contactamos desde QCASA por tu consulta sobre ${i.propertyTitle}.`),whatsappOwner:owner?whatsappUrl(owner.phone,`Hola ${owner.name}, desde QCASA te avisamos que recibimos una consulta por ${i.propertyTitle}.`):null};
  });
  res.render('qcasa/admin/inquiries.njk',{title:'Consultas | QCASA',inquiries,statuses:['Nueva','Contactado','Visita','Negociación','Cerrada','Perdida'],selected,counts});
};
exports.adminInquiryStatus=(req,res)=>{
  const inquiry=store.findInquiry(req.params.id);
  if(!inquiry)return res.status(404).send('Consulta no encontrada.');
  const status=clean(req.body.status);
  if(['Nueva','Contactado','Visita','Negociación','Cerrada','Perdida'].includes(status))inquiry.status=status;
  res.redirect(req.get('referer')||'/qcasa/admin/consultas');
};

/* Admin configuración + comunicaciones */
exports.adminSettings=(req,res)=>res.render('qcasa/admin/settings.njk',{
  title:'Configuración | QCASA',
  settings:store.settings,
  departments:store.allDepartments,
  communications:store.communications.slice(0,10)
});

exports.adminSettingsUpdate=(req,res)=>{
  const deps=Array.isArray(req.body.activeDepartments)?req.body.activeDepartments:[req.body.activeDepartments].filter(Boolean);
  store.settings.activeDepartments=deps.length?deps:['Colonia'];
  store.settings.maxPhotos=Math.max(1,Math.min(20,Number(req.body.maxPhotos||8)));
  store.settings.staleDays=Math.max(1,Number(req.body.staleDays||30));
  store.settings.uyuPerUsd=Math.max(1,Number(req.body.uyuPerUsd||41.5));
  store.settings.currencyDisplay=['USD','UYU'].includes(req.body.currencyDisplay)?req.body.currencyDisplay:'USD';
  store.settings.featuredLimit=Math.max(1,Math.min(12,Number(req.body.featuredLimit||4)));
  store.settings.contactEmail=clean(req.body.contactEmail);
  store.settings.contactPhone=clean(req.body.contactPhone);
  store.settings.footerText=clean(req.body.footerText)||'QCASA';
  res.redirect('/qcasa/admin/configuracion?guardado=1');
};

exports.adminBroadcast=(req,res)=>{
  const title=clean(req.body.title),message=clean(req.body.message),audience=clean(req.body.audience)||'all',department=clean(req.body.department);
  if(!title||!message)return res.status(400).send('Título y mensaje son obligatorios.');
  const recipients=audienceUsers(audience,department);
  recipients.forEach(u=>store.addNotification(u.id,{type:'info',title,message}));
  store.communications.unshift({
    id:store.nextCommunicationId(),title,message,audience,department:department||null,
    recipientCount:recipients.length,createdAt:new Date().toISOString()
  });
  res.redirect('/qcasa/admin/configuracion?enviado=1');
};

/* Admin usuarios */
exports.adminUsers=(req,res)=>{
  const users=store.users.map(u=>({...u,propertyCount:store.userProperties(u.id).length,pendingCount:store.userProperties(u.id).filter(p=>p.status==='Pendiente').length}));
  res.render('qcasa/admin/users.njk',{title:'Usuarios | QCASA',users});
};
exports.adminUserNewForm=(req,res)=>res.render('qcasa/admin/user-form.njk',{title:'Nuevo usuario | QCASA',user:null,mode:'create'});
exports.adminUserCreate=(req,res)=>{
  const email=cleanEmail(req.body.email);
  if(!clean(req.body.name)||!email||!clean(req.body.phone)||!req.body.password)return res.status(400).send('Faltan datos obligatorios.');
  if(email===store.admin.email.toLowerCase()||store.findUserByEmail(email))return res.status(409).send('Ya existe un usuario con ese email.');
  store.users.push({id:store.nextUserId(),name:clean(req.body.name),email,phone:clean(req.body.phone),password:String(req.body.password),active:true,createdAt:new Date().toISOString()});
  res.redirect('/qcasa/admin/usuarios');
};
exports.adminUserEditForm=(req,res)=>{
  const user=store.findUserById(req.params.id);if(!user)return res.status(404).send('Usuario no encontrado.');
  res.render('qcasa/admin/user-form.njk',{title:`Editar ${user.name} | QCASA`,user,mode:'edit'});
};
exports.adminUserUpdate=(req,res)=>{
  const user=store.findUserById(req.params.id);if(!user)return res.status(404).send('Usuario no encontrado.');
  const email=cleanEmail(req.body.email),duplicate=store.users.find(u=>u.id!==user.id&&u.email.toLowerCase()===email);
  if(duplicate||email===store.admin.email.toLowerCase())return res.status(409).send('Email ya utilizado.');
  user.name=clean(req.body.name);user.email=email;user.phone=clean(req.body.phone);if(req.body.password)user.password=String(req.body.password);user.updatedAt=new Date().toISOString();
  store.userProperties(user.id).forEach(p=>{p.ownerName=user.name;p.ownerEmail=user.email;p.ownerPhone=user.phone;});
  res.redirect('/qcasa/admin/usuarios');
};
exports.adminUserToggle=(req,res)=>{
  const user=store.findUserById(req.params.id);if(user)user.active=!user.active;
  res.redirect('/qcasa/admin/usuarios');
};
exports.adminUserDelete=(req,res)=>{
  const user=store.findUserById(req.params.id);if(!user)return res.status(404).send('Usuario no encontrado.');
  const count=store.userProperties(user.id).length;if(count)return res.status(409).send(`No se puede eliminar: el usuario tiene ${count} propiedad(es).`);
  const i=store.users.findIndex(u=>u.id===user.id);if(i>=0)store.users.splice(i,1);
  res.redirect('/qcasa/admin/usuarios');
};

/* Admin propiedades */
exports.adminNewForm=(req,res)=>res.render('qcasa/admin/form.njk',{title:'Nueva propiedad | QCASA',property:null,categories:store.categories,departments:store.allDepartments});
exports.adminCreate=(req,res)=>{
  const data=adminFormPayload(req),id=store.nextId(),slug=`${store.slugify(data.title)}-${id.toLowerCase()}`,photoData=withPhotos(req,data);
  store.properties.unshift({id,slug,status:'Publicada',ownerUserId:null,createdAt:new Date().toISOString(),views:0,...photoData,...data});
  res.redirect('/qcasa/admin');
};
exports.adminEditForm=(req,res)=>{
  const property=store.findById(req.params.id);if(!property)return res.status(404).send('Propiedad no encontrada.');
  res.render('qcasa/admin/form.njk',{title:'Editar propiedad | QCASA',property,categories:store.categories,departments:store.allDepartments});
};
exports.adminUpdate=(req,res)=>{
  const property=store.findById(req.params.id);if(!property)return res.status(404).send('Propiedad no encontrada.');
  const data=adminFormPayload(req),photoData=withPhotos(req,data,property);
  Object.assign(property,data,photoData,{updatedAt:new Date().toISOString()});
  res.redirect('/qcasa/admin');
};
exports.adminTogglePublish=(req,res)=>{
  const property=store.findById(req.params.id);if(property)property.status=property.status==='Publicada'?'Borrador':'Publicada';
  res.redirect('/qcasa/admin');
};
exports.adminApprove=(req,res)=>{
  const property=store.findById(req.params.id);if(!property)return res.status(404).send('Propiedad no encontrada.');
  property.status='Publicada';property.reviewedAt=new Date().toISOString();property.reviewNote='Aprobada por administración.';
  if(property.ownerUserId)store.addNotification(property.ownerUserId,{type:'success',title:'¡Tu propiedad fue aceptada!',message:`"${property.title}" fue aprobada por QCASA y ya está publicada.`,propertyId:property.id});
  res.redirect('/qcasa/admin#pendientes');
};
exports.adminReject=(req,res)=>{
  const property=store.findById(req.params.id);if(!property)return res.status(404).send('Propiedad no encontrada.');
  const reason=clean(req.body.reason)||'La publicación necesita ajustes antes de poder aprobarse.';
  property.status='Rechazada';property.reviewedAt=new Date().toISOString();property.reviewNote=reason;
  if(property.ownerUserId)store.addNotification(property.ownerUserId,{type:'danger',title:'Tu publicación necesita cambios',message:`"${property.title}" no fue aprobada. Motivo: ${reason}`,propertyId:property.id});
  res.redirect('/qcasa/admin#pendientes');
};
exports.adminApproveChanges=(req,res)=>{
  const property=store.findById(req.params.id);
  if(!property||!property.pendingChanges)return res.status(404).send('No hay cambios pendientes.');

  const owner=property.ownerUserId?store.findUserById(property.ownerUserId):null;
  const photos=property.pendingChangePhotos||[];

  Object.assign(property,property.pendingChanges,{
    updatedAt:new Date().toISOString()
  });

  if(photos.length){
    property.images=[...(property.images||[]),...photos];
    property.image=property.images[0];
  }

  property.pendingChanges=null;
  property.pendingChangePhotos=[];
  property.changeStatus='Aprobado';
  property.changeReviewNote='Cambios aprobados por administración.';

  if(owner){
    store.addNotification(owner.id,{
      type:'success',
      title:'Cambios aprobados',
      message:`Los cambios de "${property.title}" fueron aprobados y ya están visibles.`,
      propertyId:property.id
    });
  }

  res.redirect('/qcasa/admin#cambios');
};

exports.adminRejectChanges=(req,res)=>{
  const property=store.findById(req.params.id);
  if(!property||!property.pendingChanges)return res.status(404).send('No hay cambios pendientes.');

  const owner=property.ownerUserId?store.findUserById(property.ownerUserId):null;
  const reason=clean(req.body.reason)||'Los cambios necesitan ajustes antes de aprobarse.';

  property.changeStatus='Rechazado';
  property.changeReviewNote=reason;

  if(owner){
    store.addNotification(owner.id,{
      type:'danger',
      title:'Cambios no aprobados',
      message:`Los cambios de "${property.title}" no fueron aprobados. Motivo: ${reason}`,
      propertyId:property.id
    });
  }

  res.redirect('/qcasa/admin#cambios');
};

exports.adminDelete=(req,res)=>{
  const index=store.properties.findIndex(p=>p.id===req.params.id);if(index>=0)store.properties.splice(index,1);
  res.redirect('/qcasa/admin');
};
