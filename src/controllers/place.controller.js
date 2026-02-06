const Place = require('../models/place.model');

// GET /places
function getPlaces(req, res) {
  Place.getAllPlaces((err, places) => {
    if (err) {
      console.error('Get places error:', err);
      return res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
    }
    res.status(200).json(places);
  });
}

// POST /places 
function addPlace(req, res) {
  const { name, gateway, ble_count, ble_names } = req.body;

  if (!name || !gateway || ble_count == null || !Array.isArray(ble_names)) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }

  Place.createPlace(
    {
      name,
      gateway,
      bleCount: ble_count,
      bleNames: ble_names,
    },
    function (err) {
      if (err) {
        console.error('Add place error:', err);
        return res.status(500).json({ error: 'เพิ่มข้อมูลไม่สำเร็จ' });
      }

      res.status(201).json({ message: 'เพิ่มสถานที่สำเร็จ' });
    },
  );
}

function updatePlace(req, res) {
  const { id } = req.params;
  const { name, gateway, ble_count, ble_names } = req.body;

  if (!name || !gateway || ble_count == null || !Array.isArray(ble_names)) {
    return res.status(400).json({ error: 'ข้อมูลไม่ครบถ้วน' });
  }

  Place.updatePlace(
    id,
    {
      name,
      gateway,
      bleCount: ble_count,
      bleNames: ble_names,
    },
    function (err) {
      if (err) {
        console.error('Update place error:', err);
        return res.status(500).json({ error: 'แก้ไขข้อมูลไม่สำเร็จ' });
      }

      res.status(200).json({ message: 'แก้ไขสถานที่สำเร็จ' });
    },
  );
}

function getPlaceById(req, res) {
  const { id } = req.params;

  Place.getPlaceById(id, (err, place) => {
    if (err) {
      console.error('Get place by ID error:', err);
      return res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
    }

    if (!place) {
      return res.status(404).json({ error: 'ไม่พบสถานที่' });
    }

    res.status(200).json(place);
  });
}

function deletePlace(req, res) {
  const { id } = req.params;

  Place.deletePlace(id, (err) => {
    if (err) {
      console.error('Delete place error:', err);
      return res.status(500).json({ error: 'ลบข้อมูลไม่สำเร็จ' });
    }

    res.status(200).json({ message: 'ลบสถานที่เรียบร้อย' });
  });
}

function setFavorite(req, res) {
  const { id } = req.params;
  const { is_favorite } = req.body;

  if (typeof is_favorite !== 'boolean') {
    return res
      .status(400)
      .json({ error: 'กรุณาระบุ is_favorite เป็น true หรือ false' });
  }

  Place.toggleFavorite(id, is_favorite, (err) => {
    if (err) {
      console.error('Toggle favorite error:', err);
      return res.status(500).json({ error: 'เปลี่ยนสถานะ favorite ไม่สำเร็จ' });
    }

    res.status(200).json({ message: 'เปลี่ยนสถานะ favorite สำเร็จ' });
  });
}

module.exports = {
  getPlaces,
  addPlace,
  updatePlace,
  getPlaceById,
  deletePlace,
  setFavorite,
};
