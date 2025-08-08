const db = require('../db/sqlite');

db.run(`
  CREATE TABLE IF NOT EXISTS places (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    gateway TEXT NOT NULL,
    ble_count INTEGER NOT NULL,
    ble_names TEXT NOT NULL,
    is_favorite INTEGER DEFAULT 0
  )
`);

function createPlace({ name, gateway, bleCount, bleNames }, callback) {
  const sql = `
    INSERT INTO places (name, gateway, ble_count, ble_names)
    VALUES (?, ?, ?, ?)
  `;
  const bleNamesJson = JSON.stringify(bleNames);
  db.run(sql, [name, gateway, bleCount, bleNamesJson], callback);
}

function getAllPlaces(callback) {
  const sql = `SELECT * FROM places`;
  db.all(sql, [], (err, rows) => {
    if (err) return callback(err);

    const result = rows.map((place) => ({
      id: place.id,
      name: place.name,
      gateway: place.gateway,
      ble_count: place.ble_count,
      ble_names: JSON.parse(place.ble_names),
      is_favorite: place.is_favorite === 1,
    }));

    callback(null, result);
  });
}

function updatePlace(id, { name, gateway, bleCount, bleNames }, callback) {
  const sql = `
    UPDATE places
    SET name = ?, gateway = ?, ble_count = ?, ble_names = ?
    WHERE id = ?
  `;
  const bleNamesJson = JSON.stringify(bleNames);
  db.run(sql, [name, gateway, bleCount, bleNamesJson, id], callback);
}

function getPlaceById(id, callback) {
  const sql = `SELECT * FROM places WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(null, null);

    const place = {
      id: row.id,
      name: row.name,
      gateway: row.gateway,
      ble_count: row.ble_count,
      ble_names: JSON.parse(row.ble_names),
      is_favorite: row.is_favorite === 1,
    };

    callback(null, place);
  });
}

function deletePlace(id, callback) {
  const sql = `DELETE FROM places WHERE id = ?`;
  db.run(sql, [id], callback);
}

function toggleFavorite(id, isFavorite, callback) {
  const sql = `UPDATE places SET is_favorite = ? WHERE id = ?`;
  db.run(sql, [isFavorite ? 1 : 0, id], callback);
}

module.exports = {
  createPlace,
  getAllPlaces,
  updatePlace,
  getPlaceById,
  deletePlace,
  toggleFavorite,
};
