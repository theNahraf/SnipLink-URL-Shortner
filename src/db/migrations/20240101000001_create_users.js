/**
 * @param { import("knex").Knex } knex
 */
exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email', 255).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('display_name', 100);
    table.enum('plan_type', ['free', 'pro', 'business']).defaultTo('free');
    table.string('razorpay_customer_id', 100);
    table.string('razorpay_subscription_id', 100);
    table.integer('links_created_this_month').defaultTo(0);
    table.timestamp('billing_cycle_start').defaultTo(knex.fn.now());
    table.timestamps(true, true);

    table.index('email');
  });
};

/**
 * @param { import("knex").Knex } knex
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
