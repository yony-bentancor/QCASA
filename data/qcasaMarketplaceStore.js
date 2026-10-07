const categories=['Casa','Local','Apartamento','Chacra','Campo','Industrial'];

const allDepartments=[
  'Artigas','Canelones','Cerro Largo','Colonia','Durazno','Flores','Florida',
  'Lavalleja','Maldonado','Montevideo','Paysandú','Río Negro','Rivera','Rocha',
  'Salto','San José','Soriano','Tacuarembó','Treinta y Tres'
];

/* Configuración editable desde el admin. Continúa en memoria durante la demo. */
const settings={
  activeDepartments:['Colonia'],
  maxPhotos:8,
  staleDays:30,
  uyuPerUsd:41.50,
  currencyDisplay:'USD', // USD | UYU
  featuredLimit:4,
  contactEmail:'hola@qcasa.uy',
  contactPhone:'095789647',
  moderationRequired:true,
  footerText:'QCASA Colonia'
};

const properties=[
  {id:'QC-1001',slug:'casa-barrio-historico-venta',title:'Casa con encanto en Barrio Histórico',category:'Casa',operation:'Venta',department:'Colonia',city:'Barrio Histórico',price:315000,currency:'USD',bedrooms:3,bathrooms:2,area:180,featured:true,status:'Publicada',summary:'Casa de ejemplo con patio, tres dormitorios y espacios luminosos, presentada para la demo de QCASA Colonia.',tone:'casa',contact:'099 700 101',views:126},
  {id:'QC-1002',slug:'casa-real-san-carlos-alquiler',title:'Casa con jardín en Real de San Carlos',category:'Casa',operation:'Alquiler',department:'Colonia',city:'Real de San Carlos',price:1850,currency:'USD',bedrooms:4,bathrooms:3,area:250,featured:false,status:'Publicada',summary:'Casa de ejemplo en entorno residencial, con jardín y buena conexión con la ciudad.',tone:'casa',contact:'099 700 102',views:84},
  {id:'QC-2001',slug:'local-general-flores-venta',title:'Local comercial en General Flores',category:'Local',operation:'Venta',department:'Colonia',city:'Centro',price:168000,currency:'USD',bedrooms:0,bathrooms:1,area:92,featured:false,status:'Publicada',summary:'Local de ejemplo al frente, pensado para comercio, oficina o servicios.',tone:'local',contact:'099 700 201',views:55},
  {id:'QC-2002',slug:'local-centro-colonia-alquiler',title:'Local en el centro de Colonia',category:'Local',operation:'Alquiler',department:'Colonia',city:'Centro',price:48000,currency:'UYU',bedrooms:0,bathrooms:1,area:78,featured:false,status:'Publicada',summary:'Local de ejemplo renovado, próximo a servicios y área comercial.',tone:'local',contact:'099 700 202',views:98},
  {id:'QC-3001',slug:'apartamento-rambla-colonia-venta',title:'Apartamento con terraza sobre la Rambla',category:'Apartamento',operation:'Venta',department:'Colonia',city:'Rambla',price:228000,currency:'USD',bedrooms:2,bathrooms:2,area:88,featured:true,status:'Publicada',summary:'Apartamento de ejemplo con terraza, dos dormitorios y garage.',tone:'apartamento',contact:'099 700 301',views:210},
  {id:'QC-3002',slug:'apartamento-centro-colonia-alquiler',title:'Apartamento luminoso en el centro',category:'Apartamento',operation:'Alquiler',department:'Colonia',city:'Centro',price:36000,currency:'UYU',bedrooms:2,bathrooms:1,area:72,featured:false,status:'Publicada',summary:'Apartamento de ejemplo de dos dormitorios, cómodo y próximo a servicios.',tone:'apartamento',contact:'099 700 302',views:73},
  {id:'QC-4001',slug:'chacra-el-general-venta',title:'Chacra próxima a El General',category:'Chacra',operation:'Venta',department:'Colonia',city:'El General',price:285000,currency:'USD',bedrooms:3,bathrooms:2,area:65000,featured:false,status:'Publicada',summary:'Chacra de ejemplo de 6,5 hectáreas con casa principal y buen acceso.',tone:'chacra',contact:'099 700 401',views:64},
  {id:'QC-4002',slug:'chacra-riachuelo-alquiler',title:'Chacra en Riachuelo',category:'Chacra',operation:'Alquiler',department:'Colonia',city:'Riachuelo',price:1650,currency:'USD',bedrooms:3,bathrooms:2,area:42000,featured:false,status:'Publicada',summary:'Chacra de ejemplo en entorno tranquilo, pensada para vivienda o temporada larga.',tone:'chacra',contact:'099 700 402',views:44},
  {id:'QC-5001',slug:'campo-rosario-venta',title:'Campo de producción en Colonia',category:'Campo',operation:'Venta',department:'Colonia',city:'Rosario',price:690000,currency:'USD',bedrooms:0,bathrooms:0,area:2400000,featured:true,status:'Publicada',summary:'Campo de ejemplo de 240 hectáreas con aguadas y accesos.',tone:'campo',contact:'099 700 501',views:119},
  {id:'QC-5002',slug:'campo-nueva-helvecia-alquiler',title:'Campo para explotación mixta',category:'Campo',operation:'Alquiler',department:'Colonia',city:'Nueva Helvecia',price:4200,currency:'USD',bedrooms:0,bathrooms:0,area:1800000,featured:false,status:'Publicada',summary:'Campo de ejemplo de 180 hectáreas con divisiones, sombra y agua.',tone:'campo',contact:'099 700 502',views:37},
  {id:'QC-6001',slug:'industrial-ruta-1-colonia-venta',title:'Planta industrial sobre corredor Ruta 1',category:'Industrial',operation:'Venta',department:'Colonia',city:'Colonia del Sacramento',price:1250000,currency:'USD',bedrooms:0,bathrooms:4,area:2400,featured:true,status:'Publicada',summary:'Ejemplo de planta logística con oficinas, playa de maniobras y depósitos.',tone:'industrial',contact:'099 700 601',views:31},
  {id:'QC-6002',slug:'deposito-colonia-alquiler',title:'Depósito logístico en Colonia',category:'Industrial',operation:'Alquiler',department:'Colonia',city:'El General',price:6200,currency:'USD',bedrooms:0,bathrooms:3,area:1750,featured:false,status:'Publicada',summary:'Depósito de ejemplo con gran altura, área operativa y acceso para camiones.',tone:'industrial',contact:'099 700 602',views:29}
];

const PHOTO_URLS=[
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=78',
  'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1400&q=78'
];


/* Ubicaciones demo para el mapa. Son puntos de demostración por zona, no domicilios reales. */
const DEMO_GEO={
  'QC-1001':[-34.4718,-57.8512],'QC-1002':[-34.4482,-57.8618],
  'QC-2001':[-34.4650,-57.8404],'QC-2002':[-34.4620,-57.8425],
  'QC-3001':[-34.4692,-57.8468],'QC-3002':[-34.4642,-57.8410],
  'QC-4001':[-34.4315,-57.8045],'QC-4002':[-34.4365,-57.7105],
  'QC-5001':[-34.3165,-57.3505],'QC-5002':[-34.2880,-57.2320],
  'QC-6001':[-34.4320,-57.7560],'QC-6002':[-34.4260,-57.7930],
  'QC-7001':[-34.4555,-57.8445],'QC-7002':[-34.4685,-57.8475],
  'QC-7003':[-34.4385,-57.7130]
};
const DEMO_FEATURES={
  'QC-1001':{garden:true,garage:false,furnished:false},
  'QC-1002':{garden:true,garage:true,furnished:false},
  'QC-3001':{garden:false,garage:true,furnished:false},
  'QC-3002':{garden:false,garage:false,furnished:true},
  'QC-4001':{garden:true,garage:true,furnished:false},
  'QC-4002':{garden:true,garage:false,furnished:true},
  'QC-7001':{garden:true,garage:true,furnished:false},
  'QC-7002':{garden:false,garage:true,furnished:false},
  'QC-7003':{garden:true,garage:true,furnished:false}
};

properties.forEach((property,index)=>{
  property.image=PHOTO_URLS[index%PHOTO_URLS.length];
  property.images=[property.image];
  property.ownerUserId=property.ownerUserId||null;
  property.createdAt=property.createdAt||new Date(Date.now()-(index+2)*86400000*4).toISOString();
  property.views=Number(property.views||0);
  const geo=DEMO_GEO[property.id];
  if(geo){property.lat=geo[0];property.lng=geo[1];}
  Object.assign(property,{garage:false,furnished:false,garden:false},DEMO_FEATURES[property.id]||{});
});

const admin={
  id:'qcasa-admin-1',
  email:'admin@qcasa.uy',
  password:'qcasa123',
  name:'Administrador QCASA Colonia'
};

const users=[
  {
    id:'QCU-0001',
    name:'Martín Demo',
    email:'martin.demo@qcasa.uy',
    phone:'095789647',
    password:'demo123',
    active:true,
    createdAt:'2026-09-14T12:00:00.000Z'
  },
  {
    id:'QCU-0002',
    name:'Laura Propietaria',
    email:'laura@qcasa.demo',
    phone:'095789647',
    password:'demo123',
    active:true,
    createdAt:'2026-09-10T12:00:00.000Z'
  }
];

properties.unshift(
  {
    id:'QC-7001',slug:'casa-demo-colonia-jardin-qc-7001',
    title:'Casa demo en Colonia con jardín',category:'Casa',operation:'Venta',
    department:'Colonia',city:'Colonia del Sacramento',price:245000,currency:'USD',
    bedrooms:3,bathrooms:2,area:165,featured:false,status:'Pendiente',
    summary:'Propiedad demo enviada por Martín Demo para probar el circuito de aprobación del administrador.',
    tone:'casa',contact:'095789647',ownerUserId:'QCU-0001',ownerName:'Martín Demo',
    ownerEmail:'martin.demo@qcasa.uy',ownerPhone:'095789647',
    image:PHOTO_URLS[0],images:[PHOTO_URLS[0],PHOTO_URLS[1],PHOTO_URLS[2]],
    submittedAt:'2026-09-14T12:05:00.000Z',createdAt:'2026-09-14T12:05:00.000Z',
    reviewedAt:null,reviewNote:'',views:18
  },
  {
    id:'QC-7002',slug:'apartamento-demo-rambla-rechazado-qc-7002',
    title:'Apartamento demo sobre la Rambla',category:'Apartamento',operation:'Alquiler',
    department:'Colonia',city:'Rambla',price:39000,currency:'UYU',bedrooms:2,bathrooms:1,
    area:74,featured:false,status:'Rechazada',
    summary:'Apartamento demo para probar edición y reenvío después de un rechazo.',
    tone:'apartamento',contact:'095789647',ownerUserId:'QCU-0001',ownerName:'Martín Demo',
    ownerEmail:'martin.demo@qcasa.uy',ownerPhone:'095789647',
    image:PHOTO_URLS[4],images:[PHOTO_URLS[4],PHOTO_URLS[5]],
    submittedAt:'2026-09-14T11:00:00.000Z',createdAt:'2026-09-14T11:00:00.000Z',
    reviewedAt:'2026-09-14T11:30:00.000Z',
    reviewNote:'Agregar una descripción más completa y revisar el precio.',views:24
  },
  {
    id:'QC-7003',slug:'chacra-demo-riachuelo-publicada-qc-7003',
    title:'Chacra demo en Riachuelo',category:'Chacra',operation:'Venta',
    department:'Colonia',city:'Riachuelo',price:330000,currency:'USD',bedrooms:3,bathrooms:2,
    area:52000,featured:false,status:'Publicada',
    summary:'Chacra demo aprobada para probar la vista de una publicación aceptada.',
    tone:'chacra',contact:'095789647',ownerUserId:'QCU-0001',ownerName:'Martín Demo',
    ownerEmail:'martin.demo@qcasa.uy',ownerPhone:'095789647',
    image:PHOTO_URLS[6],images:[PHOTO_URLS[6],PHOTO_URLS[7]],
    submittedAt:'2026-09-13T16:00:00.000Z',createdAt:'2026-09-13T16:00:00.000Z',
    reviewedAt:'2026-09-13T17:00:00.000Z',reviewNote:'Aprobada por administración.',views:142,
    changeStatus:'Pendiente',
    pendingChanges:{price:345000,summary:'Chacra demo en Riachuelo con mejoras recientes, buen acceso y entorno rural.',updatedAt:'2026-09-14T12:40:00.000Z'},
    pendingChangePhotos:[]
  }
);

properties.forEach(property=>{
  const geo=DEMO_GEO[property.id];
  if(geo&&!property.lat){property.lat=geo[0];property.lng=geo[1];}
  if(property.garage===undefined)Object.assign(property,{garage:false,furnished:false,garden:false},DEMO_FEATURES[property.id]||{});
});

const inquiries=[
  {id:'CON-1001',propertyId:'QC-3001',propertyTitle:'Apartamento con terraza sobre la Rambla',name:'Ana López',phone:'099111111',email:'ana@demo.uy',message:'Quisiera coordinar una visita.',status:'Nueva',createdAt:'2026-09-14T09:15:00.000Z'},
  {id:'CON-1002',propertyId:'QC-1001',propertyTitle:'Casa con encanto en Barrio Histórico',name:'Pablo Díaz',phone:'099222222',email:'pablo@demo.uy',message:'¿Aceptan financiación?',status:'Contactado',createdAt:'2026-09-13T17:40:00.000Z'},
  {id:'CON-1003',propertyId:'QC-7003',propertyTitle:'Chacra demo en Riachuelo',name:'Sofía Pérez',phone:'099333333',email:'sofia@demo.uy',message:'Me interesa verla el fin de semana.',status:'Visita',createdAt:'2026-09-12T15:10:00.000Z'},
  {id:'CON-1004',propertyId:'QC-3001',propertyTitle:'Apartamento con terraza sobre la Rambla',name:'Luciano Silva',phone:'099444444',email:'luciano@demo.uy',message:'Estoy evaluando oferta.',status:'Negociación',createdAt:'2026-09-11T10:00:00.000Z'},
  {id:'CON-1005',propertyId:'QC-1002',propertyTitle:'Casa con jardín en Real de San Carlos',name:'María Costa',phone:'099555555',email:'maria@demo.uy',message:'Consulta por alquiler.',status:'Cerrada',createdAt:'2026-09-07T13:00:00.000Z'},
  {id:'CON-1006',propertyId:'QC-2002',propertyTitle:'Local en el centro de Colonia',name:'Diego Ramos',phone:'099666666',email:'diego@demo.uy',message:'¿Está disponible?',status:'Nueva',createdAt:'2026-09-14T08:10:00.000Z'},
  {id:'CON-1007',propertyId:'QC-5001',propertyTitle:'Campo de producción en Colonia',name:'Esteban Viera',phone:'099777777',email:'esteban@demo.uy',message:'Quiero más información productiva.',status:'Contactado',createdAt:'2026-09-09T12:00:00.000Z'},
  {id:'CON-1008',propertyId:'QC-7003',propertyTitle:'Chacra demo en Riachuelo',name:'Carolina Méndez',phone:'099888888',email:'carolina@demo.uy',message:'¿Tiene financiación?',status:'Visita',createdAt:'2026-09-08T12:00:00.000Z'}
];

const notifications=[
  {id:'QCN-demo-1',userId:'QCU-0001',type:'success',title:'¡Tu propiedad fue aceptada!',message:'"Chacra demo en Riachuelo" fue aprobada por QCASA y ya está publicada.',propertyId:'QC-7003',read:false,createdAt:'2026-09-13T17:00:00.000Z'},
  {id:'QCN-demo-2',userId:'QCU-0001',type:'danger',title:'Tu publicación necesita cambios',message:'"Apartamento demo sobre la Rambla" no fue aprobada. Motivo: Agregar una descripción más completa y revisar el precio.',propertyId:'QC-7002',read:false,createdAt:'2026-09-14T11:30:00.000Z'},
  {id:'QCN-demo-3',userId:'QCU-0001',type:'info',title:'Propiedad enviada',message:'Recibimos "Casa demo en Colonia con jardín". El equipo de QCASA la revisará antes de publicarla.',propertyId:'QC-7001',read:true,createdAt:'2026-09-14T12:05:00.000Z'}
];

const communications=[];
const adminNotifications=[
  {
    id:'QCAN-demo-1',
    type:'property-change',
    title:'Cambio de publicación pendiente',
    message:'Martín Demo solicitó cambios en "Chacra demo en Riachuelo".',
    propertyId:'QC-7003',
    read:false,
    createdAt:'2026-09-14T12:40:00.000Z'
  }
];

const nextId=()=>{
  const nums=properties.map(p=>Number(String(p.id).replace(/\D/g,''))).filter(Boolean);
  return `QC-${String(Math.max(7003,...nums)+1).padStart(4,'0')}`;
};

const nextUserId=()=>{
  const nums=users.map(u=>Number(String(u.id).replace(/\D/g,''))).filter(Boolean);
  return `QCU-${String(Math.max(2,...nums)+1).padStart(4,'0')}`;
};

const nextNotificationId=()=>`QCN-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
const nextCommunicationId=()=>`QCC-${Date.now()}`;
const nextAdminNotificationId=()=>`QCAN-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;

const slugify=v=>String(v||'propiedad').toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

const findBySlug=slug=>properties.find(p=>p.slug===slug);
const findById=id=>properties.find(p=>p.id===id);
const findUserById=id=>users.find(u=>u.id===id);
const findUserByEmail=email=>users.find(u=>u.email.toLowerCase()===String(email||'').trim().toLowerCase());
const findInquiry=id=>inquiries.find(i=>i.id===id);

function addAdminNotification({type='info',title,message,propertyId=null}={}){
  const item={id:nextAdminNotificationId(),type,title,message,propertyId,read:false,createdAt:new Date().toISOString()};
  adminNotifications.unshift(item);
  return item;
}

function addNotification(userId,{type='info',title,message,propertyId=null}={}){
  const item={id:nextNotificationId(),userId,type,title,message,propertyId,read:false,createdAt:new Date().toISOString()};
  notifications.unshift(item);
  return item;
}
const userNotifications=userId=>notifications.filter(n=>n.userId===userId);
const userProperties=userId=>properties.filter(p=>p.ownerUserId===userId);

module.exports={
  categories,allDepartments,settings,
  properties,inquiries,admin,users,notifications,communications,adminNotifications,
  nextId,nextUserId,nextCommunicationId,slugify,
  findBySlug,findById,findUserById,findUserByEmail,findInquiry,
  addNotification,addAdminNotification,userNotifications,userProperties
};
