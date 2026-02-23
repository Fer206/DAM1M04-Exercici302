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
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'sakila' // canvi a Sakila
  });
  // TEST DE CONEXIÓN
  db.query('SHOW TABLES')
    .then(rows => {
        console.log('Conectado a la base de datos Sakila. Tablas disponibles:');
        console.log(rows.map(r => Object.values(r)[0])); // imprime solo los nombres de las tablas
    })
    .catch(err => {
        console.error('Error conectando a la base de datos:', err);
    });
} else {
  db.init({
    host: '127.0.0.1',
    port: 3306,
    user: 'super',
    password: '1234',
    database: 'sakila' // canvi a Sakila
  });
  // TEST DE CONEXIÓN
  db.query('SHOW TABLES')
    .then(rows => {
        console.log('Conectado a la base de datos Sakila. Tablas disponibles:');
        console.log(rows.map(r => Object.values(r)[0])); // imprime solo los nombres de las tablas
    })
    .catch(err => {
        console.error('Error conectando a la base de datos:', err);
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
      LIMIT 5
    `);

    // 5 categories
    const categoriesRows = await db.query(`SELECT * FROM category LIMIT 5`);

    res.render('index', {
      movies: db.table_to_json(moviesRows, { film_id:'number', title:'string', release_year:'number', rating:'string', description:'string', actors:'string' }),
      categories: db.table_to_json(categoriesRows, { category_id:'number', name:'string' }),
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
      LIMIT 15
    `);

    res.render('movies', {
      movies: db.table_to_json(moviesRows, { film_id:'number', title:'string', release_year:'number', rating:'string', description:'string', actors:'string' }),
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
    // 25 primers clients amb 5 lloguers per client
    const customersRows = await db.query(`
      SELECT c.customer_id, c.first_name, c.last_name, c.email,
             (SELECT GROUP_CONCAT(CONCAT(f.title,' (',r.rental_date,')') SEPARATOR ', ')
              FROM rental r
              JOIN inventory i ON r.inventory_id = i.inventory_id
              JOIN film f ON i.film_id = f.film_id
              WHERE r.customer_id = c.customer_id
              ORDER BY r.rental_date
              LIMIT 5
             ) AS rentals
      FROM customer c
      LIMIT 25
    `);

    res.render('customers', {
      customers: db.table_to_json(customersRows, { customer_id:'number', first_name:'string', last_name:'string', email:'string', rentals:'string' }),
      common: commonData
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error consultant la base de dades');
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