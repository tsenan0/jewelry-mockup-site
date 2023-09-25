const mysql = require('mysql2/promise');

const connectionConfig = {
  host: '/cloudsql/csc-648-848-team-05:us-central1:artisan-aura-mysql-instance',
  user: 'root',
  password: 'jnrscZTyvbdC1YG/',
  database: 'artisanAura',
};

async function main() {
  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log('database connected');
    //
    const [rows, fields] = await connection.execute('to be done');
    console.log('Result:', rows);
    console.log('disconnecting from db');
    connection.end();
    console.log('Disconnected');
  } catch (error) {
    console.error('Error:', error);
    if (connection) {
      console.log('Error, closing connection');
      connection.end();
    }
  }
} 

main();
