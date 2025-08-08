const db = require('../db/sqlite');

// create users table
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT NOT NULL,
    lastname TEXT NOT NULL,
    uuid TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
  )
`);

// create new user
function createUser(
  { firstname, lastname, uuid, username, password, email },
  callback,
) {
  const sql = `
    INSERT INTO users (firstname, lastname, uuid, username, password, email)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  db.run(sql, [firstname, lastname, uuid, username, password, email], callback);
}

// find user by using username (login)
function findUserByUsername(username, callback) {
  const sql = `SELECT * FROM users WHERE username = ?`;
  db.get(sql, [username], callback);
}

// find user by using uuid (get user info)
function findUserByUUID(uuid, callback) {
  const sql = `SELECT * FROM users WHERE uuid = ?`;
  db.get(sql, [uuid], callback);
}

// send to controller
module.exports = {
  createUser,
  findUserByUsername,
  findUserByUUID,
};
