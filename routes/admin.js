const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { nanoid } = require('nanoid');
const db = require('../db/database');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// Configuración de multer: guarda las imágenes en public/uploads/<codigo_album>/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const album = db.getAlbumById(req.params.id);
    if (!album) return cb(new Error('Álbum no encontrado'));
    const dir = path.join(__dirname, '..', 'public', 'uploads', album.code);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB por imagen
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Solo se permiten imágenes (jpg, png, webp, gif)'), ok);
  }
});

// Listado de álbumes
router.get('/', (req, res) => {
  const albums = db.getAllAlbums();
  res.render('admin_dashboard', { albums, baseUrl: process.env.BASE_URL });
});

// Crear nuevo álbum
router.post('/albums', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) return res.redirect('/admin');
  const code = nanoid(8);
  db.createAlbum(name.trim(), code);
  res.redirect('/admin');
});

// Eliminar álbum (borra fotos del disco y de la BD)
router.post('/albums/:id/delete', (req, res) => {
  const album = db.getAlbumById(req.params.id);
  if (album) {
    const dir = path.join(__dirname, '..', 'public', 'uploads', album.code);
    fs.rmSync(dir, { recursive: true, force: true });
    db.deleteAlbum(album.id);
  }
  res.redirect('/admin');
});

// Ver un álbum concreto (para subir fotos)
router.get('/albums/:id', (req, res) => {
  const album = db.getAlbumById(req.params.id);
  if (!album) return res.redirect('/admin');
  const images = db.getImagesByAlbum(album.id);
  res.render('admin_album', { album, images, baseUrl: process.env.BASE_URL });
});

// Subir fotos a un álbum
router.post('/albums/:id/upload', upload.array('photos', 50), (req, res) => {
  const files = req.files || [];
  for (const file of files) {
    db.addImage(req.params.id, file.filename, file.originalname);
  }
  res.redirect(`/admin/albums/${req.params.id}`);
});

// Eliminar una foto concreta
router.post('/albums/:id/images/:imageId/delete', (req, res) => {
  const album = db.getAlbumById(req.params.id);
  const image = db.getImageById(req.params.imageId);
  if (album && image) {
    const filePath = path.join(__dirname, '..', 'public', 'uploads', album.code, image.filename);
    fs.rm(filePath, { force: true }, () => {});
    db.deleteImage(image.id);
  }
  res.redirect(`/admin/albums/${req.params.id}`);
});

module.exports = router;
