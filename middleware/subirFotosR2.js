/*
  Después de multer: si Cloudflare R2 está configurado, sube cada foto a R2
  y deja en file.url la dirección pública (/archivo/<clave>). Borra el archivo local.
  Si falla, borra lo que ya había subido y corta el pedido con un mensaje claro.
  Sin R2 no hace nada (las fotos quedan en /uploads/qcasa como antes).
*/
const fs = require('fs');
const r2 = require('../services/r2');

module.exports = async function subirFotosR2(req, res, next) {
  const files = req.files || [];
  if (!files.length || !r2.configurado()) return next();
  const subidas = [];
  try {
    for (const f of files) {
      const key = r2.nuevaClave('propiedades', f.originalname);
      await r2.subir(key, await fs.promises.readFile(f.path), f.mimetype);
      subidas.push(key);
      f.url = `/qcasa/archivo/${key}`;
    }
    next();
  } catch (err) {
    console.error('[fotos] no se pudieron subir a R2:', err.message);
    await Promise.all(subidas.map((k) => r2.borrar(k).catch(() => {})));
    res.status(503).send('No pudimos guardar las fotos en este momento. Volvé atrás y probá de nuevo en unos minutos.');
  } finally {
    await Promise.all(files.map((f) => fs.promises.unlink(f.path).catch(() => {})));
  }
};
