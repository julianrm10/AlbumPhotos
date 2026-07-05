require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const albumRoutes = require('./routes/album');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'cambia_esto',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 días
}));

app.get('/', (req, res) => {
  res.redirect(req.session.loggedIn ? '/admin' : '/login');
});

app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/album', albumRoutes);

app.use((req, res) => {
  res.status(404).render('not_found');
});

app.listen(PORT, () => {
  console.log(`✅ FotoÁlbum corriendo en http://localhost:${PORT}`);
});
