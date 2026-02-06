const db = require('../db/sqlite');

db.run(`
    CREATE TABLE IF NOT EXISTS markers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      marker_id INTEGER UNIQUE,
      marker_name TEXT NOT NULL
    )
  `);

function createArMarker({ marker_id, marker_name}, callback) {
  const sql = `
    INSERT INTO markers (marker_id, marker_name)
    VALUES (?, ?)
  `;
  db.run(sql, [marker_id, marker_name], callback);
}

function getAllArMarkers(callback) {
  const sql = `SELECT * FROM markers`;
  db.all(sql, [], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
}

function getAllFrontMarkers(callback) {
  const sql = `
    SELECT *
    FROM markers
    WHERE marker_name LIKE '%-F'
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows);
  });
}

function updateArMarker(id, { marker_id, marker_name}, callback) {
  const sql = `
    UPDATE markers
    SET marker_id = ?, marker_name = ?
    WHERE id = ?
  `;
  db.run(sql, [marker_id, marker_name, id], callback);
}

function getArMarkerById(id, callback) {
  const sql = `SELECT * FROM markers WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) return callback(err);
    callback(null, row);
  });
}

function getArMarkerByMarkerId(marker_id, callback) {
  const sql = `SELECT * FROM markers WHERE marker_id = ?`;
  db.get(sql, [marker_id], (err, row) => {
    if (err) return callback(err);
    callback(null, row);
  });
}

function deleteArMarker(id, callback) {
  const sql = `DELETE FROM markers WHERE id = ?`;
  db.run(sql, [id], callback);
}

module.exports = {
  createArMarker,
  getAllArMarkers,
  getAllFrontMarkers,
  updateArMarker,
  getArMarkerById,
  getArMarkerByMarkerId,
  deleteArMarker
};