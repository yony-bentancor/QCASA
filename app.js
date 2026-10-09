require('dotenv').config();
const path=require('path');
const express=require('express');
const compression=require('compression');
const session=require('express-session');
const nunjucks=require('nunjucks');
const{exposeSession}=require('./middleware/auth');
const{money,alertLevel,alertText}=require('./utils/helpers');
const{connectDatabase}=require('./config/database');
const{crearPersistencia}=require('./data/persistencia');
const{helmetMiddleware}=require('./middleware/commercialSecurity');
const seo=require('./controllers/seoController');

/*
  QCASA · Inmobiliaria (marketplace de propiedades en venta y alquiler)
  Las rutas viven bajo /qcasa, igual que en el repo unificado, para no romper
  enlaces ya publicados. La raíz "/" redirige a /qcasa.
*/
const app=express();
const PORT=process.env.PORT||3002;
const DEV_SECRET='qcasa-dev-secret';
app.locals.demoMode=String(process.env.DEMO_MODE||'true').toLowerCase()!=='false';
app.locals.links={
  estudioqr:process.env.ESTUDIOQR_URL||'https://estudioqr.com.uy/'
};

app.set('trust proxy',1);
nunjucks.configure(path.join(__dirname,'views'),{autoescape:true,express:app,noCache:process.env.NODE_ENV!=='production'});
app.set('view engine','njk');
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(compression());
app.use(helmetMiddleware);
app.use((req,res,next)=>{
  res.locals.canonicalUrl=`${req.protocol}://${req.get('host')}${req.originalUrl.split('?')[0]}`;
  res.locals.metaDescription='QCASA · Propiedades en venta y alquiler. Buscar, comparar y publicar propiedades.';
  res.locals.isQCasa=true;
  next();
});

app.use(session({
  name:'qcasa.sid',
  secret:process.env.SESSION_SECRET||DEV_SECRET,
  resave:false,
  saveUninitialized:false,
  cookie:{secure:process.env.NODE_ENV==='production',httpOnly:true,sameSite:'lax',maxAge:1000*60*60*8}
}));
app.use(exposeSession);

const staticOptions={maxAge:process.env.NODE_ENV==='production'?'7d':0,etag:true};
app.use('/css',express.static(path.join(__dirname,'public/css'),staticOptions));
app.use('/js',express.static(path.join(__dirname,'public/js'),staticOptions));
app.use('/img',express.static(path.join(__dirname,'public/img'),staticOptions));
app.use('/uploads',(req,res,next)=>{res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Disposition','inline');next();},express.static(path.join(__dirname,'uploads'),{fallthrough:true}));

app.locals.money=money;
app.locals.alertLevel=alertLevel;
app.locals.alertText=alertText;

app.get('/',(req,res)=>res.redirect('/qcasa'));
app.get('/robots.txt',seo.robots);
app.get('/qcasa/sitemap.xml',seo.sitemap);
// Con USE_MONGO=true, cada cambio se guarda en MongoDB al terminar el pedido.
let persistencia=null;
app.use((req,res,next)=>persistencia?persistencia.middleware(req,res,next):next());
app.use('/qcasa',require('./routes/qcasa'));

app.use((err,req,res,next)=>{
  console.error(err);
  res.status(500).render('errors/500.njk',{title:'Error | QCASA',error:process.env.NODE_ENV==='development'?err.message:null});
});
app.use((req,res)=>res.status(404).render('errors/404.njk',{title:'Página no encontrada | QCASA'}));

async function start(){
  try{
    if(process.env.NODE_ENV==='production'&&(!process.env.SESSION_SECRET||process.env.SESSION_SECRET===DEV_SECRET)) throw new Error('SESSION_SECRET es obligatorio y debe ser propio en producción.');
    const db=await connectDatabase();
    if(db.connected){
      // Los datos pasan a vivir en MongoDB: se cargan antes de aceptar visitas.
      const mongoose=require('mongoose');
      const store=require('./data/qcasaMarketplaceStore');
      persistencia=crearPersistencia(store,mongoose.connection.db);
      await persistencia.cargar();
      app.locals.datosReales=true;
      // Contraseña del administrador: QCASA_ADMIN_PASSWORD manda sobre la guardada.
      const passwords=require('./utils/passwords');
      const claveAdmin=String(process.env.QCASA_ADMIN_PASSWORD||'').trim();
      if(claveAdmin&&!passwords.verificar(store.admin.password,claveAdmin).ok){store.admin.password=passwords.hash(claveAdmin);}
      if(process.env.QCASA_ADMIN_EMAIL)store.admin.email=String(process.env.QCASA_ADMIN_EMAIL).trim().toLowerCase();
      // Usuarios de muestra: su contraseña de demostración está en el código público,
      // así que se reemplaza por una al azar. Los datos quedan, pero nadie puede entrar con ellos.
      const crypto=require('crypto');
      let bloqueados=0;
      (store.users||[]).forEach(u=>{
        if(passwords.verificar(u.password,'demo123').ok){u.password=passwords.hash(crypto.randomBytes(24).toString('base64url'));bloqueados++;}
      });
      if(bloqueados)console.log(`[seguridad] ${bloqueados} usuario(s) de muestra quedaron sin acceso.`);
      await persistencia.guardar();
      if(!claveAdmin)console.warn('AVISO: falta QCASA_ADMIN_PASSWORD; el administrador sigue con la contraseña de demostración.');
      setInterval(()=>persistencia.guardar(),30000).unref();
      process.once('SIGTERM',async()=>{await persistencia.guardar();process.exit(0);});
      console.log('MongoDB conectado: los datos se guardan en la base.');
    }
    app.listen(PORT,()=>console.log(`QCASA activo en http://localhost:${PORT}/qcasa`));
  }catch(err){
    console.error('No se pudo iniciar QCASA:',err.message);
    process.exitCode=1;
  }
}
if(require.main===module) start();
module.exports={app,start};
