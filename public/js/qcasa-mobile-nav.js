(()=>{
const t=document.querySelector('[data-qc-mobile-menu]'),n=document.querySelector('[data-qc-main-nav]'),c=document.querySelector('[data-qc-mobile-close]'),b=document.querySelector('[data-qc-mobile-backdrop]');
if(t&&n){const o=v=>{n.classList.toggle('is-mobile-open',v);b?.classList.toggle('is-open',v);t.setAttribute('aria-expanded',String(v));document.body.classList.toggle('qc-mobile-nav-open',v)};t.addEventListener('click',()=>o(!n.classList.contains('is-mobile-open')));c?.addEventListener('click',()=>o(false));b?.addEventListener('click',()=>o(false));n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>o(false)));document.addEventListener('keydown',e=>{if(e.key==='Escape')o(false)})}
document.querySelectorAll('[data-admin-dropdown-toggle]').forEach(btn=>{btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const box=btn.closest('[data-admin-dropdown]');const open=!box.classList.contains('is-open');document.querySelectorAll('[data-admin-dropdown].is-open').forEach(x=>x.classList.remove('is-open'));box.classList.toggle('is-open',open);btn.setAttribute('aria-expanded',String(open))})});
document.addEventListener('click',e=>{if(!e.target.closest('[data-admin-dropdown]'))document.querySelectorAll('[data-admin-dropdown].is-open').forEach(x=>{x.classList.remove('is-open');x.querySelector('[data-admin-dropdown-toggle]')?.setAttribute('aria-expanded','false')})});
document.querySelector('[data-qc-back-top]')?.addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'})});

/* PARCHE 5.4 — QCASA
   1) Contacto con la misma escala visual del menú móvil.
   2) Recupera video demo en QC-1001, QC-3001 y QC-4001.
   No modifica QRestudio. */
const patchStyle=document.createElement('style');
patchStyle.textContent=`
@media(max-width:760px){
  .qc-nav-unified .qc-main-nav>.qc-contact-nav{
    display:flex!important;
    align-items:center!important;
    width:100%!important;
    min-height:50px!important;
    margin:0!important;
    padding:0 4px!important;
    border:0!important;
    border-bottom:1px solid rgba(7,60,53,.12)!important;
    background:transparent!important;
    color:#10231f!important;
    font-family:inherit!important;
    font-size:12px!important;
    line-height:1!important;
    font-weight:720!important;
    letter-spacing:-.01em!important;
    text-align:left!important;
    appearance:none!important;
  }
}
.qc-video-badge.qc-video-badge-54{
  position:absolute;
  z-index:4;
  left:14px;
  bottom:14px;
  padding:8px 10px;
  background:rgba(7,60,53,.92);
  color:#fff;
  font-size:10px;
  font-style:normal;
  font-weight:850;
}
.qc-property-video.qc-property-video-54{
  margin:24px 8vw;
  padding:28px;
  background:#f7f5ef;
  border:1px solid #dce4df;
}
.qc-property-video.qc-property-video-54 h2{margin:5px 0 18px}
.qc-property-video.qc-property-video-54 video{
  display:block;
  width:100%;
  max-height:620px;
  background:#071b18;
}
@media(max-width:760px){
  .qc-property-video.qc-property-video-54{
    margin:18px 20px;
    padding:18px;
  }
}`;

document.head.appendChild(patchStyle);

const demoVideos={
  'QC-1001':'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'QC-3001':'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'QC-4001':'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
};

const idText=document.querySelector('.qc-id')?.textContent||'';
const match=idText.match(/QC-\d{4}/);
const propertyId=match?.[0];
const videoUrl=propertyId&&demoVideos[propertyId];

if(videoUrl&&!document.querySelector('.qc-property-video')){
  const gallery=document.querySelector('.qc-gallery-main');
  if(gallery&&!gallery.querySelector('.qc-video-badge')){
    const badge=document.createElement('em');
    badge.className='qc-video-badge qc-video-badge-54';
    badge.textContent='▶ Video disponible';
    gallery.appendChild(badge);
  }

  const detail=document.querySelector('.qc-detail-grid');
  if(detail){
    const section=document.createElement('section');
    section.className='qc-property-video qc-property-video-54';
    section.innerHTML=`
      <div>
        <span class="qc-kicker">RECORRIDO</span>
        <h2>Conocé la propiedad en video</h2>
      </div>
      <video controls preload="metadata">
        <source src="${videoUrl}" type="video/mp4">
        Tu navegador no puede reproducir este video.
      </video>`;
    detail.insertAdjacentElement('afterend',section);
  }
}
})();
