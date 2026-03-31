/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('urls', (table) => {
    table.bigIncrements('id').primary();
    table.string('short_code', 12).unique().notNullable();
    table.text('long_url').notNullable();
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.boolean('custom_alias').defaultTo(false);
    table.string('password_hash', 255);
    table.timestamp('expires_at');
    table.boolean('one_time').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.integer('click_count').defaultTo(0);
    table.string('title', 255);
    table.timestamps(true, true);

    table.index('short_code');
    table.index('user_id');
    table.index(['created_at'], 'idx_urls_created_at');
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('urls');
};
