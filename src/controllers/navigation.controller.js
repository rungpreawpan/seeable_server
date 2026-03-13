const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const ArMarker = require('../models/arMarkers.model');

const upload = multer({ dest: 'uploads/' });

/* =================================================
   CONSTANTS
================================================= */

const LEFT_DEPTH = 8; // 301–303
const RIGHT_DEPTH = 6; // 304–307
const BETWEEN_ROOMS = 3;
const C314_DISTANCE = 8;

const LEFT_ROOMS = [301, 302, 303];
const RIGHT_ROOMS = [304, 305, 306, 307];

const navigationSessions = {};

/* =================================================
   OPPOSITE (0 เมตร)
================================================= */

const oppositeNodeMap = {
  C301F: 'C304F',
  C304F: 'C301F',

  C301B: 'C305F',
  C305F: 'C301B',

  C303F: 'C306B',
  C306B: 'C303F',

  C303B: 'C307B',
  C307B: 'C303B',
};

/* =================================================
   CROSS OFFSET 3 เมตร
================================================= */

const crossOffset3mMap = {
  'C302F-C305F': 3,
  'C305F-C302F': 3,

  'C302F-C305B': 3,
  'C305B-C302F': 3,

  'C302F-C306F': 6,
  'C306F-C302F': 6,

  'C302F-C306B': 12,
  'C306B-C302F': 12,

  'C302B-C306F': 3,
  'C306F-C302B': 3,

  'C302B-C306B': 3,
  'C306B-C302B': 3,

  'C302B-C305B': 6,
  'C305B-C302B': 6,

  'C302B-C305F': 12,
  'C305F-C302B': 12,
};

/* =================================================
   UTILITIES
================================================= */

function normalizeNode(node) {
  return node.replace('-', '');
}

function getRoomNumber(node) {
  return parseInt(node.slice(1, 4));
}

function getSide(roomNumber) {
  if (LEFT_ROOMS.includes(roomNumber)) return 'left';
  if (RIGHT_ROOMS.includes(roomNumber)) return 'right';
  if (roomNumber === 314) return 'left';
  return null;
}

function getDepth(roomNumber) {
  return getSide(roomNumber) === 'left' ? LEFT_DEPTH : RIGHT_DEPTH;
}

function getLinearOrder(room) {
  if (LEFT_ROOMS.includes(room)) {
    return {
      side: 'left',
      index: LEFT_ROOMS.indexOf(room),
    };
  }

  if (RIGHT_ROOMS.includes(room)) {
    return {
      side: 'right',
      index: RIGHT_ROOMS.indexOf(room),
    };
  }

  return null;
}

/* =================================================
   SAME SIDE (FIXED CORRECT FORMULA)
================================================= */

function calculateSameSideDistance(startNode, endNode) {
  const startRoom = getRoomNumber(startNode);
  const endRoom = getRoomNumber(endNode);

  const depth = getDepth(startRoom);

  const direction = endRoom > startRoom ? 1 : -1;

  let currentRoom = startRoom;
  let currentSide = startNode.endsWith('F') ? 'F' : 'B';

  let distance = 0;

  while (
    !(
      currentRoom === endRoom &&
      currentSide === (endNode.endsWith('F') ? 'F' : 'B')
    )
  ) {
    // F → B
    if (currentSide === 'F') {
      distance += depth;
      currentSide = 'B';
      continue;
    }

    // B → next room F
    if (currentSide === 'B') {
      distance += BETWEEN_ROOMS;
      currentRoom += direction;
      currentSide = 'F';
      continue;
    }
  }

  return distance;
}

/* =================================================
   MAIN DISTANCE FUNCTION
================================================= */

function calculateDistance(startNode, endNode) {
  if (startNode === endNode) {
    return 0;
  }

  let startRoom = getRoomNumber(startNode);
  let endRoom = getRoomNumber(endNode);

  const startSide = getSide(startRoom);
  const endSide = getSide(endRoom);

  // ห้องเดียวกัน F↔B
  if (startRoom === endRoom) {
    return getDepth(startRoom);
  }

  // cross offset 3m
  const offsetKey = `${startNode}-${endNode}`;
  if (crossOffset3mMap[offsetKey]) {
    return crossOffset3mMap[offsetKey];
  }

  // opposite 0m
  if (oppositeNodeMap[startNode] === endNode) {
    return 0;
  }

  // 314 → ห้อง
  if (startRoom === 314) {
    const branchNode = endSide === 'left' ? 'C301F' : 'C304F';

    let distance =
      C314_DISTANCE + calculateSameSideDistance(branchNode, endNode);

    // ⭐ สำคัญมาก
    if (endNode.endsWith('B')) {
      const endRoomNumber = getRoomNumber(endNode);
      distance += getDepth(endRoomNumber);
    }

    return distance;
  }

  // ห้อง → 314
  if (endRoom === 314) {
    const branchNode = startSide === 'left' ? 'C301F' : 'C304F';

    let distance =
      calculateSameSideDistance(startNode, branchNode) + C314_DISTANCE;

    // ถ้าเริ่มจาก B ต้องผ่านทั้งห้องต้นทางก่อน
    if (startNode.endsWith('B')) {
      const startRoomNumber = getRoomNumber(startNode);
      distance += getDepth(startRoomNumber);
    }

    return distance;
  }

  // คนละฝั่ง → แทน start ด้วย opposite ถ้าตรงฝั่งปลายทาง
  if (startSide !== endSide) {
    const oppositeNode = oppositeNodeMap[startNode];

    if (oppositeNode) {
      const oppositeRoom = getRoomNumber(oppositeNode);

      if (getSide(oppositeRoom) === endSide) {
        startNode = oppositeNode;
        startRoom = oppositeRoom;
      }
    }
  }

  const finalStartSide = getSide(startRoom);
  const finalEndSide = getSide(endRoom);

  if (finalStartSide === finalEndSide) {
    return calculateSameSideDistance(startNode, endNode);
  }

  // fallback
  const anchorNode = finalStartSide === 'left' ? 'C301F' : 'C304F';

  return (
    calculateSameSideDistance(startNode, anchorNode) +
    calculateSameSideDistance(anchorNode, endNode)
  );
}

/* =================================================
   START NAVIGATION
================================================= */

const detectAndNavigate = [
  upload.single('image'),
  async (req, res) => {
    const { destination, start_marker } = req.body;

    if (!destination || !start_marker) {
      return res.status(400).json({
        error: 'ต้องระบุ start_marker และ destination',
      });
    }

    const startNode = normalizeNode(start_marker);
    const endNode = normalizeNode(destination);

    const totalDistance = calculateDistance(startNode, endNode);

    const path = generateSameSidePath(startNode, endNode);
    const destRoom = getRoomNumber(endNode);
    const destSide = getSide(destRoom);

    const sessionId = Date.now().toString();

    navigationSessions[sessionId] = {
      start: startNode,
      destination: endNode,
      totalDistance,
      path,
    };

    return res.json({
      session_id: sessionId,
      start: startNode,
      destination: endNode,
      totalDistance,
      destinationSide: destSide,
      path,
      message: `ระยะทางทั้งหมด ${totalDistance} เมตร`,
    });
  },
];

function generateSameSidePath(startNode, endNode) {
  const startRoom = getRoomNumber(startNode);
  const endRoom = getRoomNumber(endNode);

  const direction = endRoom > startRoom ? 1 : -1;

  let currentRoom = startRoom;
  let currentSide = startNode.endsWith('F') ? 'F' : 'B';

  const targetSide = endNode.endsWith('F') ? 'F' : 'B';

  const path = [startNode];

  while (!(currentRoom === endRoom && currentSide === targetSide)) {
    if (currentSide === 'F') {
      currentSide = 'B';
      path.push(`C${currentRoom}B`);
      continue;
    }

    if (currentSide === 'B') {
      currentRoom += direction;
      currentSide = 'F';
      path.push(`C${currentRoom}F`);
      continue;
    }
  }

  return path;
}

/* =================================================
   UPDATE POSITION
================================================= */

const updateNavigationPosition = [
  upload.single('image'),
  async (req, res) => {
    const { session_id, detected_marker } = req.body;

    const session = navigationSessions[session_id];

    if (!session) {
      return res.status(404).json({ error: 'invalid session' });
    }

    let currentNode = null;

    // =====================
    // 1) รับ marker ตรง ๆ
    // =====================
    if (detected_marker) {
      currentNode = normalizeNode(detected_marker);
    }

    // =====================
    // 2) รับ image แล้วไป detect
    // =====================
    else if (req.file) {
      const imagePath = req.file.path;

      try {
        const form = new FormData();
        form.append('image', fs.createReadStream(imagePath));

        const response = await axios.post(
          'http://localhost:5001/ar-marker',
          form,
          { headers: form.getHeaders() },
        );

        const marker_id = response.data.marker_id;

        if (!marker_id) {
          return res.json({
            status: 'NO_MARKER',
            message: 'ไม่พบ AR Marker',
          });
        }

        const marker = await new Promise((resolve, reject) => {
          ArMarker.getArMarkerByMarkerId(marker_id, (err, m) => {
            if (err || !m) reject(err);
            else resolve(m);
          });
        });

        currentNode = normalizeNode(marker.marker_name);
      } catch (err) {
        return res.status(500).json({
          error: 'AR detection failed',
        });
      } finally {
        fs.unlink(imagePath, () => {});
      }
    } else {
      return res.status(400).json({
        error: 'ต้องส่ง detected_marker หรือ image',
      });
    }

    const destination = session.destination;
    const startNode = session.start;

    // =====================
    // ARRIVED
    // =====================

    if (currentNode === destination) {
      return res.json({
        status: 'ARRIVED',
        remainingDistance: 0,
      });
    }

    // =====================
    // GENERATE PATH
    // =====================

    const path = generateSameSidePath(startNode, destination);

    const currentIndex = path.indexOf(currentNode);
    const destIndex = path.indexOf(destination);

    // =====================
    // SPECIAL OVERSHOOT
    // =====================

    const currentRoom = getRoomNumber(currentNode);
    const destRoom = getRoomNumber(destination);

    if (currentRoom === destRoom && currentIndex === -1) {
      return res.json({
        status: 'OVERSHOOT',
        message: 'คุณเดินเลยจุดหมาย กรุณากลับหลัง',
      });
    }

    // =====================
    // OFF PATH
    // =====================

    if (currentIndex === -1) {
      return res.json({
        status: 'OFF_PATH',
        message: 'คุณออกนอกเส้นทาง',
      });
    }

    // =====================
    // OVERSHOOT
    // =====================

    if (currentIndex > destIndex) {
      return res.json({
        status: 'OVERSHOOT',
        message: 'คุณเดินเลยจุดหมาย กรุณากลับหลัง',
      });
    }

    // =====================
    // ON PATH
    // =====================

    const remainingDistance = calculateDistance(currentNode, destination);

    return res.json({
      status: 'ON_PATH',
      remainingDistance,
    });
  },
];

module.exports = {
  detectAndNavigate,
  updateNavigationPosition,
};
