/*
  Contraseñas con scrypt (incluido en Node, sin dependencias).
  Formato guardado: scrypt$<sal>$<hash>
  Las contraseñas viejas en texto plano se aceptan una vez y se convierten al iniciar sesión.
*/
const crypto = require('crypto');

const PREFIJO = 'scrypt$';
const esHash = (v) => typeof v === 'string' && v.startsWith(PREFIJO);

function hash(password) {
  const sal = crypto.randomBytes(16).toString('base64url');
  const h = crypto.scryptSync(String(password), sal, 32).toString('base64url');
  return `${PREFIJO}${sal}$${h}`;
}

function iguales(a, b) {
  const x = Buffer.from(String(a)); const y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** Devuelve { ok, actualizar } — actualizar=true si estaba en texto plano y conviene guardarla con hash. */
function verificar(guardada, password) {
  if (!guardada) return { ok: false, actualizar: false };
  if (esHash(guardada)) {
    const [, sal, h] = guardada.split('$');
    const calc = crypto.scryptSync(String(password), sal, 32).toString('base64url');
    return { ok: iguales(calc, h), actualizar: false };
  }
  const ok = iguales(guardada, password);
  return { ok, actualizar: ok };
}

module.exports = { hash, verificar, esHash };
