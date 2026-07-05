const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

function loadData() {
  if (!fs.existsSync(DB_FILE)) {
    const initial = { albums: [], images: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw || '{"albums":[],"images":[]}');
}

function saveData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

function nextId(items) {
  return items.length === 0 ? 1 : Math.max(...items.map((i) => i.id)) + 1;
}

// ---------- Álbumes ----------

function getAllAlbums() {
  const data = loadData();
  return data.albums
    .map((a) => ({
      ...a,
      image_count: data.images.filter((i) => i.album_id === a.id).length
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getAlbumById(id) {
  const data = loadData();
  return data.albums.find((a) => a.id === Number(id)) || null;
}

function getAlbumByCode(code) {
  const data = loadData();
  return data.albums.find((a) => a.code === code) || null;
}

function createAlbum(name, code) {
  const data = loadData();
  const album = {
    id: nextId(data.albums),
    name,
    code,
    created_at: new Date().toISOString()
  };
  data.albums.push(album);
  saveData(data);
  return album;
}

function deleteAlbum(id) {
  const data = loadData();
  data.albums = data.albums.filter((a) => a.id !== Number(id));
  data.images = data.images.filter((i) => i.album_id !== Number(id));
  saveData(data);
}

// ---------- Imágenes ----------

function getImagesByAlbum(albumId) {
  const data = loadData();
  return data.images
    .filter((i) => i.album_id === Number(albumId))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

function getImageById(id) {
  const data = loadData();
  return data.images.find((i) => i.id === Number(id)) || null;
}

function addImage(albumId, filename, originalName) {
  const data = loadData();
  const image = {
    id: nextId(data.images),
    album_id: Number(albumId),
    filename,
    original_name: originalName,
    created_at: new Date().toISOString()
  };
  data.images.push(image);
  saveData(data);
  return image;
}

function deleteImage(id) {
  const data = loadData();
  data.images = data.images.filter((i) => i.id !== Number(id));
  saveData(data);
}

module.exports = {
  getAllAlbums,
  getAlbumById,
  getAlbumByCode,
  createAlbum,
  deleteAlbum,
  getImagesByAlbum,
  getImageById,
  addImage,
  deleteImage
};
