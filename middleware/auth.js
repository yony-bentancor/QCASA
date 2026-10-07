function exposeSession(req,res,next){
  // Los layouts de QCASA distinguen usuario/admin a partir de la sesión.
  res.locals.sessionUser=req.session.user||null;
  res.locals.session=req.session;
  next();
}
module.exports={exposeSession};
