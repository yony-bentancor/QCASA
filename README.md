# QCASA · Inmobiliaria

Marketplace de propiedades en venta y alquiler: búsqueda, mapa, ficha de propiedad, consultas, registro de usuarios, publicación con revisión y panel de administración.

Separado del repo unificado `INMOBILIARIA`. Funciona solo, con sus propios archivos.

## Rutas

Todo sigue bajo `/qcasa`, igual que antes, para no romper enlaces publicados. La raíz `/` redirige a `/qcasa`.

- `/qcasa`, `/qcasa/buscar`, `/qcasa/mapa`, `/qcasa/propiedad/:slug`
- `/qcasa/ingresar`, `/qcasa/registro`
- `/qcasa/mi-qcasa` (usuario: publicar y editar propiedades, notificaciones)
- `/qcasa/admin` (propiedades, aprobaciones, consultas, usuarios, configuración, comunicaciones)
- `/robots.txt` y `/qcasa/sitemap.xml` (ahora conectados)

## Ejecutar

```bash
npm install
cp .env.example .env      # en Windows: copy .env.example .env
npm run dev               # o npm start
```

Abrí http://localhost:3002/qcasa

## Usuarios demo

| Rol | Email | Clave |
|---|---|---|
| Administrador | admin@qcasa.uy | qcasa123 |
| Usuario | martin.demo@qcasa.uy | demo123 |

## Variables

| Variable | Para qué |
|---|---|
| `PORT` | Puerto local (3002 por defecto) |
| `SESSION_SECRET` | **Obligatoria en producción** |
| `ESTUDIOQR_URL` | Enlace «Estudio QR» del pie |
| `DEMO_MODE` | `true` mantiene los usuarios demo |
| `USE_MONGO`, `MONGO_URI` | Conexión MongoDB (preparada) |
| `QCASA_NOTIFY_EMAIL`, `SMTP_*`, `MAIL_FROM` | Aviso por email de nuevas consultas (opcional) |

## Estructura

```
app.js
routes/qcasa.js
controllers/   qcasaController, qcasaEnhancementsController, seoController
middleware/    auth, qcasaUpload, commercialSecurity
services/      emailService
repositories/  qcasaRepository + adapters/qcasaDemoRepository
models/        User, Listing, Inquiry, Notification, Setting
data/          qcasaMarketplaceStore.js
views/         qcasa/*, errors, layouts/base
public/        css (qcasa-*), js (qcasa-*), img/qcasa
referencia/    maqueta de la home
scripts/       seedMongo.js
```

## Datos reales (MongoDB Atlas + Cloudflare R2)

- `USE_MONGO=true` + `MONGO_URI`: todos los datos (propiedades, usuarios, consultas, notificaciones, configuración y administrador) se cargan de MongoDB al arrancar y se guardan después de cada cambio. La primera vez se guardan los datos de muestra.
- **Contraseñas**: se guardan con hash (scrypt). Las viejas en texto plano se convierten solas en el primer inicio de sesión.
- `QCASA_ADMIN_PASSWORD`: contraseña del administrador; con datos reales es obligatoria (sin ella queda la de demostración y se avisa en el log).
- Con datos reales **no** se muestran las credenciales de demostración en la pantalla de ingreso.
- Fotos: con las variables `R2_*` se suben a Cloudflare R2 (carpeta `qcasa/propiedades/`) y se sirven por `/qcasa/archivo/<clave>`. En el navegador se achican antes de subir.
