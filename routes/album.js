const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const QRCode = require('qrcode');
const db = require('../db/database');

// Galería pública del álbum
router.get('/:code', (req, res) => {
  const album = db.getAlbumByCode(req.params.code);
  if (!album) return res.status(404).render('not_found');
  const images = db.getImagesByAlbum(album.id);
  res.render('gallery', { album, images });
});

// Descargar todas las fotos del álbum en un ZIP
router.get('/:code/download', (req, res) => {
  const album = db.getAlbumByCode(req.params.code);
  if (!album) return res.status(404).send('Álbum no encontrado');

  const images = db.getImagesByAlbum(album.id);
  const dir = path.join(__dirname, '..', 'public', 'uploads', album.code);

  res.attachment(`${album.name.replace(/[^a-z0-9]/gi, '_')}.zip`);
  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => { throw err; });
  archive.pipe(res);

  for (const img of images) {
    const filePath = path.join(dir, img.filename);
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: img.original_name || img.filename });
    }
  }

  archive.finalize();
});

// Generar imagen QR que apunta al álbum
router.get('/:code/qr', async (req, res) => {
  const album = db.getAlbumByCode(req.params.code);
  if (!album) return res.status(404).send('Álbum no encontrado');
  const url = `${process.env.BASE_URL}/album/${album.code}`;
  try {
    res.type('png');
    QRCode.toFileStream(res, url, { width: 400, margin: 2 });
  } catch (err) {
    res.status(500).send('Error generando QR');
  }
});

module.exports = router;
