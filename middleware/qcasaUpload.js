const path=require('path');
const fs=require('fs');
const multer=require('multer');
const allowed=new Map([['image/jpeg',new Set(['.jpg','.jpeg'])],['image/png',new Set(['.png'])],['image/webp',new Set(['.webp'])]]);

const uploadDir=path.join(__dirname,'..','uploads','qcasa');
if(!fs.existsSync(uploadDir))fs.mkdirSync(uploadDir,{recursive:true});

const storage=multer.diskStorage({
  destination:(req,file,cb)=>cb(null,uploadDir),
  filename:(req,file,cb)=>{
    const safe=String(file.originalname||'foto')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-zA-Z0-9._-]/g,'-');
    cb(null,`${Date.now()}-${Math.random().toString(36).slice(2,7)}-${safe}`);
  }
});

module.exports=multer({
  storage,
  limits:{fileSize:8*1024*1024,files:8},
  fileFilter:(req,file,cb)=>{
    const ext=path.extname(String(file.originalname||'')).toLowerCase();
    const ok=allowed.has(file.mimetype)&&allowed.get(file.mimetype).has(ext);
    cb(ok?null:new Error('Solo se permiten imágenes JPG, PNG o WebP.'),ok);
  }
});
