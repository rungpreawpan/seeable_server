const axios = require('axios');
const Fingerprint = require('../models/localize.model');

function localize(req, res) {
  const rssiMap = req.body.rssi_map;

  if (!rssiMap || typeof rssiMap !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid rssi_map' });
  }

  Fingerprint.getAllFingerprints(async (err, fingerprints) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'ดึงข้อมูล fingerprint ไม่สำเร็จ' });
    }

    try {
      const response = await axios.post('http://localhost:5001/process', {
        rssi_map: rssiMap,
        fingerprints: fingerprints,
      });

      res.status(200).json(response.data);
    } catch (error) {
      console.error('Flask server error:', error.message);
      res
        .status(500)
        .json({ error: 'ไม่สามารถคำนวณตำแหน่งได้จากเซิร์ฟเวอร์ Python' });
    }
  });
}

function getAllFingerprints(req, res) {
  Fingerprint.getAllFingerprints((err, data) => {
    if (err) {
      console.error('Get all fingerprints error:', err);
      return res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
    }
    res.status(200).json(data);
  });
}

function getFingerprintById(req, res) {
  const { id } = req.params;

  Fingerprint.getFingerprintById(id, (err, fingerprint) => {
    if (err) {
      console.error('Get fingerprint by ID error:', err);
      return res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
    }

    if (!fingerprint) {
      return res.status(404).json({ error: 'ไม่พบข้อมูล fingerprint' });
    }

    res.status(200).json(fingerprint);
  });
}

function createFingerprint(req, res) {
  const payload = req.body;

  const fingerprints = Array.isArray(payload) ? payload : [payload];

  const invalid = fingerprints.find(
    (fp) =>
      typeof fp.x !== 'number' ||
      typeof fp.y !== 'number' ||
      typeof fp.beacon_id !== 'string' ||
      !Array.isArray(fp.rssi_values),
  );

  if (invalid) {
    return res.status(400).json({
      error: 'รายการหนึ่งหรือมากกว่ามีข้อมูลไม่ครบถ้วนหรือรูปแบบไม่ถูกต้อง',
    });
  }

  const insertPromises = fingerprints.map((fp) => {
    return new Promise((resolve, reject) => {
      Fingerprint.createFingerprint(fp, (err) => {
        if (err) {
          console.error('Insert fingerprint error:', err);
          return reject(err);
        }
        resolve();
      });
    });
  });

  Promise.all(insertPromises)
    .then(() => {
      res.status(201).json({
        message: `เพิ่ม fingerprint ${fingerprints.length} รายการสำเร็จ`,
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ error: 'เกิดข้อผิดพลาดบางรายการระหว่างเพิ่มข้อมูล' });
    });
}

function updateFingerprint(req, res) {
  const { id } = req.params;
  const { x, y, beacon_id, rssi_values } = req.body;

  if (!x || !y || !beacon_id || !Array.isArray(rssi_values)) {
    return res
      .status(400)
      .json({ error: 'ข้อมูลไม่ครบถ้วนหรือรูปแบบไม่ถูกต้อง' });
  }

  Fingerprint.updateFingerprint(id, { x, y, beacon_id, rssi_values }, (err) => {
    if (err) {
      console.error('Update fingerprint error:', err);
      return res.status(500).json({ error: 'แก้ไขข้อมูลไม่สำเร็จ' });
    }

    res.status(200).json({ message: 'แก้ไข fingerprint สำเร็จ' });
  });
}

function deleteFingerprint(req, res) {
  const { id } = req.params;

  Fingerprint.deleteFingerprint(id, (err) => {
    if (err) {
      console.error('Delete fingerprint error:', err);
      return res.status(500).json({ error: 'ลบข้อมูลไม่สำเร็จ' });
    }

    res.status(200).json({ message: 'ลบ fingerprint สำเร็จ' });
  });
}

module.exports = {
  localize,
  getAllFingerprints,
  getFingerprintById,
  createFingerprint,
  updateFingerprint,
  deleteFingerprint,
};
