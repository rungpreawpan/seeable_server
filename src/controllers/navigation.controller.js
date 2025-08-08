let isNavigating = false;
let currentUuid = null;
let lastBLEData = null;

const axios = require('axios');

async function startNavigation(req, res) {
  const { uuid, ble_names } = req.body;

  if (!uuid) {
    return res.status(400).json({ error: 'กรุณาส่ง uuid' });
  }

  isNavigating = true;
  currentUuid = uuid;

  try {
    await axios.post('http://localhost:5001/control', {
      flag: 'start',
      uuid: uuid,
      ble_names: ble_names,
    });

    res.status(200).json({ message: 'เริ่มนำทางแล้ว', uuid });
  } catch (err) {
    res.status(500).json({ error: 'แจ้ง Gateway ไม่สำเร็จ' });
  }
}

async function stopNavigation(req, res) {
  isNavigating = false;
  currentUuid = null;

  try {
    await axios.post('http://localhost:5001/control', { flag: 'stop' });
    res.status(200).json({ message: 'หยุดนำทางแล้ว' });
  } catch (err) {
    res.status(500).json({ error: 'แจ้ง Gateway ไม่สำเร็จ' });
  }
}

function receiveBLEData(req, res) {
  if (!isNavigating)
    return res.status(403).json({ error: 'ยังไม่ได้เริ่มนำทาง' });

  lastBLEData = req.body;
  console.log('ได้ข้อมูล BLE:', lastBLEData);

  // send to client (socket)
  req.io.emit('ble-data', lastBLEData);

  res.status(200).json({ message: 'รับข้อมูลแล้ว' });
}

function getBLEData(req, res) {
  if (!lastBLEData) {
    return res.status(404).json({ error: 'ยังไม่มีข้อมูล BLE' });
  }

  res.status(200).json(lastBLEData);
}

module.exports = {
  startNavigation,
  stopNavigation,
  receiveBLEData,
  getBLEData,
};
