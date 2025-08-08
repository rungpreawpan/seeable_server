const db = require('../db/sqlite');

db.run(`
  CREATE TABLE IF NOT EXISTS fingerprints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    x INTEGER NOT NULL,
    y INTEGER NOT NULL,
    beacon_id TEXT NOT NULL,
    rssi_values TEXT NOT NULL -- เก็บเป็น JSON array string
  )
`);

function createFingerprint({ x, y, beacon_id, rssi_values }, callback) {
  const sql = `
    INSERT INTO fingerprints (x, y, beacon_id, rssi_values)
    VALUES (?, ?, ?, ?)
  `;
  const rssiJson = JSON.stringify(rssi_values);
  db.run(sql, [x, y, beacon_id, rssiJson], callback);
}

function getAllFingerprints(callback) {
  const sql = `SELECT * FROM fingerprints`;
  db.all(sql, [], (err, rows) => {
    if (err) return callback(err);

    const result = rows.map((fp) => ({
      id: fp.id,
      x: fp.x,
      y: fp.y,
      beacon_id: fp.beacon_id,
      rssi_values: JSON.parse(fp.rssi_values),
    }));

    callback(null, result);
  });
}

function getFingerprintById(id, callback) {
  const sql = `SELECT * FROM fingerprints WHERE id = ?`;
  db.get(sql, [id], (err, row) => {
    if (err) return callback(err);
    if (!row) return callback(null, null);

    const fingerprint = {
      id: row.id,
      x: row.x,
      y: row.y,
      beacon_id: row.beacon_id,
      rssi_values: JSON.parse(row.rssi_values),
    };

    callback(null, fingerprint);
  });
}

function updateFingerprint(id, { x, y, beacon_id, rssi_values }, callback) {
  const sql = `
    UPDATE fingerprints
    SET x = ?, y = ?, beacon_id = ?, rssi_values = ?
    WHERE id = ?
  `;
  const rssiJson = JSON.stringify(rssi_values);
  db.run(sql, [x, y, beacon_id, rssiJson, id], callback);
}

function deleteFingerprint(id, callback) {
  const sql = `DELETE FROM fingerprints WHERE id = ?`;
  db.run(sql, [id], callback);
}

module.exports = {
  createFingerprint,
  getAllFingerprints,
  getFingerprintById,
  updateFingerprint,
  deleteFingerprint,
};