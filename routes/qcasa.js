const router=require('express').Router();
const qcasa=require('../controllers/qcasaController');
const enhancements=require('../controllers/qcasaEnhancementsController');
const upload=require('../middleware/qcasaUpload');
const seo=require('../controllers/seoController');
const{authLimiter,publicFormLimiter}=require('../middleware/commercialSecurity');

// Público
router.get('/',qcasa.home);
router.get('/buscar',qcasa.search);
router.get('/mapa',qcasa.map);
router.get('/propiedad/:slug',enhancements.detail);
router.post('/propiedad/:slug/consulta',enhancements.inquiry);
router.post('/contacto',enhancements.contact);
router.post('/moneda',qcasa.currencyPreference);

// Acceso QCASA
router.get('/ingresar',qcasa.loginForm);
router.post('/ingresar',qcasa.login);
router.get('/registro',qcasa.registerForm);
router.post('/registro',qcasa.register);
router.post('/salir',qcasa.logout);

// Mi QCASA
router.get('/mi-qcasa',qcasa.requireUser,enhancements.userDashboard);
router.get('/mi-qcasa/publicar',qcasa.requireUser,qcasa.userNewPropertyForm);
router.post('/mi-qcasa/propiedades',qcasa.requireUser,upload.array('photos',8),enhancements.userCreate);
router.get('/mi-qcasa/propiedades/:id/editar',qcasa.requireUser,qcasa.userEditPropertyForm);
router.post('/mi-qcasa/propiedades/:id',qcasa.requireUser,upload.array('photos',8),enhancements.userUpdate);
router.post('/mi-qcasa/propiedades/:id/reenviar',qcasa.requireUser,qcasa.userResubmitProperty);
router.post('/mi-qcasa/propiedades/:id/cambios',qcasa.requireUser,upload.array('photos',8),enhancements.userPublishedChanges);
router.post('/mi-qcasa/notificaciones/leer',qcasa.requireUser,qcasa.userMarkNotificationsRead);

// Administración QCASA
router.get('/admin',qcasa.requireAdmin,enhancements.adminDashboard);
router.get('/admin/propiedades',qcasa.requireAdmin,enhancements.adminProperties);
router.get('/admin/consultas',qcasa.requireAdmin,qcasa.adminInquiries);
router.post('/admin/consultas/:id/estado',qcasa.requireAdmin,qcasa.adminInquiryStatus);
router.post('/admin/consultas/:id/responder',qcasa.requireAdmin,enhancements.adminReplyInquiry);
router.get('/admin/configuracion',qcasa.requireAdmin,qcasa.adminSettings);
router.post('/admin/configuracion',qcasa.requireAdmin,qcasa.adminSettingsUpdate);
router.post('/admin/comunicaciones',qcasa.requireAdmin,qcasa.adminBroadcast);

// Usuarios QCASA
router.get('/admin/usuarios',qcasa.requireAdmin,qcasa.adminUsers);
router.get('/admin/usuarios/nuevo',qcasa.requireAdmin,qcasa.adminUserNewForm);
router.post('/admin/usuarios',qcasa.requireAdmin,qcasa.adminUserCreate);
router.get('/admin/usuarios/:id/editar',qcasa.requireAdmin,qcasa.adminUserEditForm);
router.post('/admin/usuarios/:id',qcasa.requireAdmin,qcasa.adminUserUpdate);
router.post('/admin/usuarios/:id/toggle',qcasa.requireAdmin,qcasa.adminUserToggle);
router.post('/admin/usuarios/:id/eliminar',qcasa.requireAdmin,qcasa.adminUserDelete);

// Propiedades QCASA
router.get('/admin/propiedades/nueva',qcasa.requireAdmin,qcasa.adminNewForm);
router.post('/admin/propiedades',qcasa.requireAdmin,upload.array('photos',8),enhancements.adminCreate);
router.get('/admin/propiedades/:id/editar',qcasa.requireAdmin,qcasa.adminEditForm);
router.post('/admin/propiedades/:id',qcasa.requireAdmin,upload.array('photos',8),enhancements.adminUpdate);
router.post('/admin/propiedades/:id/estado',qcasa.requireAdmin,enhancements.adminSetStatus);
router.post('/admin/propiedades/:id/publicar',qcasa.requireAdmin,qcasa.adminTogglePublish);
router.post('/admin/propiedades/:id/aprobar',qcasa.requireAdmin,qcasa.adminApprove);
router.post('/admin/propiedades/:id/rechazar',qcasa.requireAdmin,qcasa.adminReject);
router.post('/admin/propiedades/:id/cambios/aprobar',qcasa.requireAdmin,qcasa.adminApproveChanges);
router.post('/admin/propiedades/:id/cambios/rechazar',qcasa.requireAdmin,qcasa.adminRejectChanges);
router.post('/admin/propiedades/:id/eliminar',qcasa.requireAdmin,qcasa.adminDelete);

module.exports=router;
