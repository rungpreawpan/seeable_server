const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const ArMarker = require('../models/arMarkers.model');

const upload = multer({ dest: 'uploads/' });

function createArMarker(req, res) {
  const { marker_id, marker_name } = req.body;

  if (!marker_id || !marker_name) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }

  ArMarker.createArMarker({ marker_id, marker_name }, (err) => {
    if (err) {
      console.error('Create AR marker error:', err);
      return res.status(500).json({ error: 'เพิ่มข้อมูลไม่สำเร็จ' });
    }

    res.status(201).json({ message: 'เพิ่ม AR Marker สำเร็จ' });
  });
}

function getAllArMarkers(req, res) {
  ArMarker.getAllArMarkers((err, markers) => {
    if (err) {
      console.error('Get AR markers error:', err);
      return res.status(500).json({ error: 'ดึงข้อมูล AR Markers ไม่สำเร็จ' });
    }

    res.status(200).json(markers);
  });
}

function getAllFrontMarkers(req, res) {
  ArMarker.getAllFrontMarkers((err, markers) => {
    if (err) {
      console.error('Get front markers error:', err);
      return res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
    }

    res.status(200).json(markers);
  });
}

function getArMarkerById(req, res) {
  const { id } = req.params;
  console.log(req.params);

  ArMarker.getArMarkerById(id, (err, marker) => {
    if (err) {
      console.error('Get AR marker by ID error:', err);
      return res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
    }

    if (!marker) {
      return res.status(404).json({ error: 'ไม่พบ AR Marker' });
    }

    res.status(200).json(marker);
  });
}

function updateArMarker(req, res) {
  const { id } = req.params;
  const { marker_id, marker_name } = req.body;

  if (!marker_id || !marker_name) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }

  ArMarker.updateArMarker(id, { marker_id, marker_name }, (err) => {
    if (err) {
      console.error('Update AR marker error:', err);
      return res.status(500).json({ error: 'แก้ไขข้อมูลไม่สำเร็จ' });
    }

    res.status(200).json({ message: 'แก้ไข AR Marker สำเร็จ' });
  });
}

function deleteArMarker(req, res) {
  const { id } = req.params;

  ArMarker.deleteArMarker(id, (err) => {
    if (err) {
      console.error('Delete AR marker error:', err);
      return res.status(500).json({ error: 'ลบข้อมูลไม่สำเร็จ' });
    }

    res.status(200).json({ message: 'ลบ AR Marker สำเร็จ' });
  });
}

// ---------- check marker
const checkMarker = [
  upload.single('image'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'ไม่พบไฟล์ภาพที่อัปโหลด' });
    }

    const imagePath = req.file.path;

    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    try {
      const response = await axios.post(
        'http://localhost:5001/ar-marker',
        form,
        {
          headers: form.getHeaders(),
        },
      );

      return res.status(200).json(response.data);
    } catch (err) {
      console.error('Error:', err.message);
      return res.status(500).json({
        error: 'Failed to send to Python',
        detail: err.message,
      });
    } finally {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('ลบไฟล์ไม่สำเร็จ:', err.message);
        }
      });
    }
  },
];

module.exports = {
  getAllFrontMarkers,
  getAllArMarkers,
  getArMarkerById,
  createArMarker,
  updateArMarker,
  deleteArMarker,
  checkMarker,
};
