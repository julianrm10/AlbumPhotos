# 📸 FotoÁlbum

App para crear álbumes de fotos, compartirlos con tus amigas mediante un enlace o código QR, y que puedan descargarlas individualmente o todas en un ZIP.

## Stack

- Node.js + Express
- EJS (vistas) + Bootstrap 5
- Almacenamiento en JSON plano (`db/data.json`) — cero configuración, sin dependencias nativas que compilar
- Multer (subida de imágenes, guardadas localmente en `public/uploads/`)
- Archiver (generación de ZIP al vuelo)
- QRCode (generación del QR de cada álbum)

## Instalación local

```bash
npm install
cp .env.example .env
```

Edita el `.env` y cambia como mínimo:
- `ADMIN_USER` / `ADMIN_PASS` → tus credenciales para el panel
- `SESSION_SECRET` → cualquier cadena larga aleatoria

Luego:

```bash
npm start
```

Abre `http://localhost:3000`, inicia sesión con tus credenciales del `.env`, crea un álbum, sube fotos, y comparte el QR o el enlace.

## Cómo funciona

1. Entras al panel (`/login`) con tu usuario y contraseña.
2. Creas un álbum → se genera un código único para él.
3. Subes las fotos que quieras (varias a la vez).
4. Se genera automáticamente un QR y un enlace público (`/album/<codigo>`).
5. Compartes el QR o el enlace con tus amigas.
6. Ellas entran sin necesidad de cuenta ni contraseña, ven la galería, y pueden descargar fotos individuales o todo en un ZIP.

## Desplegar en Railway

1. Sube este proyecto a un repositorio de GitHub.
2. En Railway: **New Project → Deploy from GitHub repo**, selecciona el repo.
3. En la pestaña **Variables**, añade las mismas variables que tienes en tu `.env`:
   - `ADMIN_USER`
   - `ADMIN_PASS`
   - `SESSION_SECRET`
   - `BASE_URL` → pon aquí la URL pública que te da Railway (ej: `https://tuapp.up.railway.app`). Esto es importante para que el QR generado apunte a la URL correcta.
4. Railway detecta el `package.json` y ejecuta `npm start` automáticamente.

### ⚠️ Importante sobre el almacenamiento en Railway

Railway usa un sistema de archivos **efímero**: si el contenedor se reinicia o se redepliega, todo lo que esté en `public/uploads/` (tus fotos) y en `db/data.json` (tu base de datos) **se puede borrar**.

Para uso recurrente en producción, te recomiendo una de estas dos opciones cuando el proyecto crezca:

**Opción A (recomendada a medio plazo): usar Cloudinary para las imágenes**
- Capa gratuita de 25GB.
- Solo tendrías que cambiar `routes/admin.js` para usar `multer-storage-cloudinary` en vez de `diskStorage`.
- Así las fotos no dependen del disco de Railway.

**Opción B: añadir un Volume en Railway**
- Railway permite montar un "Volume" persistente en un servicio.
- Montas el volumen en `/app/public/uploads` y en `/app/db`, y así los datos sobreviven a los redeploys.
- Es la opción más rápida de implementar sin tocar código (solo configuración en Railway).

Si quieres, en otra conversación te ayudo a migrar a Cloudinary o a configurar el Volume paso a paso.

## Estructura del proyecto

```
fotoalbum/
├── server.js              # Punto de entrada
├── db/
│   └── database.js        # Conexión SQLite + creación de tablas
├── middleware/
│   └── auth.js            # Protección de rutas de administración
├── routes/
│   ├── auth.js             # Login / logout
│   ├── admin.js            # Panel: crear álbumes, subir/borrar fotos
│   └── album.js             # Galería pública, descarga ZIP, QR
├── views/                  # Plantillas EJS
└── public/
    ├── css/style.css
    └── uploads/            # Fotos subidas (organizadas por álbum)
```

## Próximas mejoras posibles

- Compresión automática de imágenes al subir (server-side con `sharp`)
- PIN opcional por álbum para que no sea 100% público con el código
- Subida directa a Cloudinary/S3 en vez de disco local
- Multi-usuario (varios administradores con sus propios álbumes)
