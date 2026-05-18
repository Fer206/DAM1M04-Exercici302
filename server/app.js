const express = require('express');
const fs = require('fs');
const path = require('path');
const hbs = require('hbs');
const MySQL = require('./utilsMySQL');

const app = express();
const port = 3000;

// Detectar si estem al Proxmox (si és pm2)
const isProxmox = !!process.env.PM2_HOME;

// Iniciar connexió MySQL
const db = new MySQL();
if (!isProxmox) {
  db.init({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: 'root',
    database: 'sakila'
  });
} else {
  db.init({
    host: '127.0.0.1',
    port: 3307,
    user: 'super',
    password: '1234',
    database: 'sakila'
  });
}
// Static files - ONLY ONCE
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Disable cache
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

// Handlebars
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Registrar "Helpers .hbs" aquí
hbs.registerHelper('eq', (a, b) => a == b);
hbs.registerHelper('gt', (a, b) => a > b);

// Partials de Handlebars
hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

// Llegir dades comunes una sola vegada
const commonData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data', 'common.json'), 'utf8')
);

// --- RUTES --- //

// Pàgina principal /
app.get('/', async (req, res) => {
  try {
    // 5 primeres pel·lícules amb actors
    const moviesRows = await db.query(`
      SELECT f.film_id, f.title, f.release_year, f.rating, f.description,
             GROUP_CONCAT(CONCAT(a.first_name,' ',a.last_name) SEPARATOR ', ') AS actors
      FROM film f
      LEFT JOIN film_actor fa ON f.film_id = fa.film_id
      LEFT JOIN actor a ON fa.actor_id = a.actor_id
      GROUP BY f.film_id
      ORDER BY f.film_id DESC
      LIMIT 5
    `);

    // 5 categories
    const categoriesRows = await db.query(`SELECT * FROM category LIMIT 5`);

    res.render('index', {
      movies: db.table_to_json(moviesRows, { film_id: 'number', title: 'string', release_year: 'number', rating: 'string', description: 'string', actors: 'string' }),
      categories: db.table_to_json(categoriesRows, { category_id: 'number', name: 'string' }),
      common: commonData
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error consultant la base de dades');
  }
});

// Pàgina de pel·lícules /movies
app.get('/movies', async (req, res) => {
  try {
    // 15 primeres pel·lícules amb actors
    const moviesRows = await db.query(`
      SELECT f.film_id, f.title, f.release_year, f.rating, f.description,
             GROUP_CONCAT(CONCAT(a.first_name,' ',a.last_name) SEPARATOR ', ') AS actors
      FROM film f
      LEFT JOIN film_actor fa ON f.film_id = fa.film_id
      LEFT JOIN actor a ON fa.actor_id = a.actor_id
      GROUP BY f.film_id
      ORDER BY f.film_id DESC
      LIMIT 15
    `);

    res.render('movies', {
      movies: db.table_to_json(moviesRows, { film_id: 'number', title: 'string', release_year: 'number', rating: 'string', description: 'string', actors: 'string' }),
      common: commonData
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error consultant la base de dades');
  }
});

// Pàgina de clients /customers
app.get('/customers', async (req, res) => {
  try {
    // 25 primers clients amb 5 lloguers per client (els més recents)
    const customersRows = await db.query(`
      SELECT c.customer_id, c.first_name, c.last_name, c.email,
             (SELECT GROUP_CONCAT(CONCAT(f.title,' (',r.rental_date,')') ORDER BY r.rental_date DESC SEPARATOR '|||')
              FROM rental r
              JOIN inventory i ON r.inventory_id = i.inventory_id
              JOIN film f ON i.film_id = f.film_id
              WHERE r.customer_id = c.customer_id
             ) AS rentals
      FROM customer c
      LIMIT 25
    `);

    const customers = db.table_to_json(customersRows, { customer_id: 'number', first_name: 'string', last_name: 'string', email: 'string', rentals: 'string' });

    // Processem la cadena de lloguers per convertir-la en un array compatible amb el loop {{#each rentals}} del template
    customers.forEach(cust => {
      if (cust.rentals) {
        cust.rentals = cust.rentals.split('|||').slice(0, 5).map(item => {
          return { rental_date: item };
        });
      } else {
        cust.rentals = [];
      }
    });

    res.render('customers', {
      customers,
      common: commonData
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error consultant la base de dades');
  }
});

// --- RUTES EXERCICI 303 --- //

// Formulari per afegir pel·lícula
app.get('/movieAdd', async (req, res) => {
  try {
    const languages = await db.query('SELECT * FROM language');
    res.render('movieAdd', {
      languages,
      common: commonData
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error carregant idiomes');
  }
});

// Detalls d'una pel·lícula
app.get('/movie/:id', async (req, res) => {
  try {
    const movieRows = await db.query(`
      SELECT f.*, l.name AS language_name
      FROM film f
      JOIN language l ON f.language_id = l.language_id
      WHERE f.film_id = ?
    `, [req.params.id]);

    if (movieRows.length === 0) return res.status(404).send('Pel·lícula no trobada');

    res.render('movie', {
      movie: db.table_to_json(movieRows, { film_id: 'number', release_year: 'number', length: 'number', replacement_cost: 'number', rental_rate: 'number' })[0],
      common: commonData
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error consultant detalls');
  }
});

// Formulari per editar pel·lícula
app.get('/movieEdit/:id', async (req, res) => {
  try {
    const movieRows = await db.query('SELECT * FROM film WHERE film_id = ?', [req.params.id]);
    const languages = await db.query('SELECT * FROM language');

    if (movieRows.length === 0) return res.status(404).send('Pel·lícula no trobada');

    res.render('movieEdit', {
      movie: db.table_to_json(movieRows, { film_id: 'number', language_id: 'number', release_year: 'number', length: 'number', replacement_cost: 'number', rental_rate: 'number', rental_duration: 'number' })[0],
      languages,
      common: commonData
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error carregant edició');
  }
});

// POST: Afegir pel·lícula
app.post('/afegirPeli', async (req, res) => {
  try {
    const { title, description, release_year, language_id, rental_duration, rental_rate, length, replacement_cost, rating } = req.body;
    await db.query(`
      INSERT INTO film (title, description, release_year, language_id, rental_duration, rental_rate, length, replacement_cost, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, release_year, language_id, rental_duration, rental_rate, length, replacement_cost, rating]);

    res.redirect('/movies');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error afegint pel·lícula');
  }
});

// POST: Editar pel·lícula
app.post('/editarPeli', async (req, res) => {
  try {
    const { film_id, title, description, release_year, language_id, rental_duration, rental_rate, length, replacement_cost, rating } = req.body;
    await db.query(`
      UPDATE film 
      SET title=?, description=?, release_year=?, language_id=?, rental_duration=?, rental_rate=?, length=?, replacement_cost=?, rating=?
      WHERE film_id=?
    `, [title, description, release_year, language_id, rental_duration, rental_rate, length, replacement_cost, rating, film_id]);

    res.redirect('/movie/' + film_id);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error editant pel·lícula');
  }
});

// POST: Esborrar pel·lícula
app.post('/esborrarPeli', async (req, res) => {
  try {
    const { film_id } = req.body;
    // Nota: A Sakila hi ha claus foranes. Esborrar pot fallar si té actors o inventari.
    // Però el requisit demana definir la crida.
    await db.query('DELETE FROM film WHERE film_id = ?', [film_id]);
    res.redirect('/movies');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error esborrant pel·lícula (pot tenir relacions actives)');
  }
});

// Start server
const httpServer = app.listen(port, () => {
  console.log(`http://localhost:${port}`);
  console.log(`http://localhost:${port}/movies`);
  console.log(`http://localhost:${port}/customers`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await db.end();
  httpServer.close();
  process.exit(0);
});