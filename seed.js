const path = require('path');
const knex = require('knex');

// Initialize database connection
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, 'college-fines.sqlite'),
  },
  useNullAsDefault: true,
});

async function seedDatabase() {
  try {
    // Clear existing data
    await db('fines').truncate();

    // Sample data
    const demoData = [
      { studentName: 'John Doe', studentClass: '10A', rollNumber: '12345', description: 'Library fine', amount: 50, fine_date: new Date() },
      { studentName: 'Jane Smith', studentClass: '10B', rollNumber: '12346', description: 'Late submission', amount: 30, fine_date: new Date() },
      { studentName: 'Sam Wilson', studentClass: '9A', rollNumber: '12347', description: 'Uniform violation', amount: 20, fine_date: new Date() },
      { studentName: 'Emily Davis', studentClass: '11A', rollNumber: '12348', description: 'Damaged property', amount: 40, fine_date: new Date() },
      { studentName: 'Michael Brown', studentClass: '12B', rollNumber: '12349', description: 'Class disruption', amount: 60, fine_date: new Date() }
    ];

    // Insert demo data into the database
    for (const data of demoData) {
      // Insert student record if not exists
      const [student_id] = await db('students').insert({
        name: data.studentName,
        class: data.studentClass,
        roll_number: data.rollNumber,
      }).onConflict('roll_number').ignore(); // Avoid duplicate entries

      // Insert fine record
      await db('fines').insert({
        student_id,
        description: data.description,
        amount: data.amount,
        fine_date: data.fine_date,
      });
    }

    console.log('Demo data inserted successfully!');
  } catch (error) {
    console.error('Error inserting demo data:', error);
  } finally {
    // Close the database connection
    db.destroy();
  }
}

seedDatabase();
