// server/testDB.js
const MySQL = require('./utilsMySQL');
const db = new MySQL();

db.init({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '@Gost0610',
  database: 'sakila'
});

// Ver todas las tablas
db.query('SHOW TABLES')
  .then(rows => {
    console.log('Tablas en Sakila:');
    rows.forEach(r => console.log(Object.values(r)[0]));
  })
  .catch(err => console.error(err))
  .finally(() => db.end());

// Probar consulta simple
db.query('SELECT film_id, title FROM film LIMIT 5')
  .then(rows => {
    console.log('\nPrimeras 5 películas:');
    console.table(rows);
  })
  .catch(err => console.error(err))
  .finally(() => db.end());