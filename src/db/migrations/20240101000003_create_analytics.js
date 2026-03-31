/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('analytics', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('url_id').references('id').inTable('urls').onDelete('CASCADE').notNullable();
    table.specificType('ip_address', 'inet');
    table.string('country', 100);
    table.string('city', 100);
    table.string('device', 50);
    table.string('browser', 50);
    table.string('os', 50);
    table.text('referer');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index('url_id');
    table.index('created_at');
    table.index(['url_id', 'created_at'], 'idx_analytics_url_time');
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('analytics');
};
