const demo = require('./adapters/qcasaDemoRepository');

// Punto único de selección de persistencia de QCASA.
function current(){ return demo; }
module.exports = new Proxy({}, {
  get(_target, prop){ return current()[prop]; },
  set(_target, prop, value){ current()[prop] = value; return true; }
});
