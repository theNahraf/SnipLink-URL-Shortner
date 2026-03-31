const knex = require('knex');
const knexConfig = require('../../knexfile');
const env = require('./env');

const db = knex(knexConfig[env.NODE_ENV] || knexConfig.development);

// Test connection on startup
db.raw('SELECT 1')
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch((err) => {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1);
  });

module.exports = db;
