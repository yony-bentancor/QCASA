const store=require('../repositories/qcasaRepository');
function base(req){return `${req.protocol}://${req.get('host')}`}
exports.robots=(req,res)=>res.type('text/plain').send(`User-agent: *\nAllow: /qcasa\nDisallow: /qcasa/admin\nDisallow: /qcasa/mi-qcasa\nSitemap: ${base(req)}/qcasa/sitemap.xml\n`);
exports.sitemap=(req,res)=>{
 const root=base(req); const urls=[`${root}/qcasa`,`${root}/qcasa/buscar`,`${root}/qcasa/mapa`,...store.properties.filter(p=>p.status==='Publicada').map(p=>`${root}/qcasa/propiedad/${encodeURIComponent(p.slug)}`)];
 const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${u.replace(/&/g,'&amp;')}</loc></url>`).join('')}</urlset>`;
 res.type('application/xml').send(xml);
};
