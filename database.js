const path = require('path');
const knex = require('knex');

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'college-fines.sqlite'),
  },
  useNullAsDefault: true,
});

// Create tables if they don't exist
db.schema.hasTable('students').then(exists => {
  if (!exists) {
    return db.schema.createTable('students', table => {
      table.increments('student_id').primary();
      table.string('name').notNullable();
      table.string('class').notNullable();
      table.string('roll_number').unique().notNullable();
      table.timestamps(true, true);
    });
  }
});

db.schema.hasTable('fines').then(exists => {
  if (!exists) {
    return db.schema.createTable('fines', table => {
      table.increments('fine_id').primary();
      table.integer('student_id').unsigned().notNullable().references('student_id').inTable('students');
      table.date('fine_date').defaultTo(db.fn.now());
      table.text('description');
      table.decimal('amount', 10, 2).notNullable();
      table.boolean('is_paid').defaultTo(false);
      table.timestamps(true, true);
    });
  }
});

module.exports = db;
