const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const ArMarker = require('../models/arMarkers.model');

const upload = multer({ dest: 'uploads/' });

const navigationSessions = {};

const graph = {
  // corridor
  H1: ['H2', 'C314F'],
  H2: ['H1', 'H3', 'C301F', 'C304F'],
  H3: ['H2', 'H4', 'C302F', 'C305F'],
  H4: ['H3', 'H5', 'C303F', 'C306F'],
  H5: ['H4', 'C307F'],

  // front doors
  C314F: ['H1'],
  C301F: ['H2'],
  C304F: ['H2'],
  C305F: ['H3'],
  C302F: ['H4'],
  C306F: ['H4'],
  C303F: ['H5'],
  C307F: ['H5'],

  // back doors
  C301B: ['C301F'],
  C302B: ['C302F'],
  C303B: ['C303F'],
  C304B: ['C304F'],
  C305B: ['C305F'],
  C306B: ['C306F'],
  C307B: ['C307F'],
};

// front door to back door
const roomDepth = {
  C301: 8,
  C302: 8,
  C303: 8,
  C304: 6,
  C305: 6,
  C306: 6,
  C307: 6,
};

const betweenRooms = 3;

const sideOfDoor = {
  C301F: 'left',
  C304F: 'right',
  C302F: 'left',
  C305F: 'right',
  C303F: 'left',
  C306F: 'right',
  C307F: 'right',
  C314F: 'left',
};

// ห้องที่อยู่ตรงข้ามกัน (ข้ามโถงได้ทันที)
const oppositeRooms = {
  C301: 'C304',
  C304: 'C301',

  C302: 'C305',
  C305: 'C302',

  C303: 'C307',
  C307: 'C303',

  // กรณีพิเศษ (หลังห้อง)
  C302B: 'C306B',
  C306B: 'C302B',
};

const oppositeDistanceMap = {
  'C301F-C304F': { dist: 0, turn: null },
  'C304F-C301F': { dist: 0, turn: null },

  'C302F-C305F': { dist: 3, turn: 'left' },
  'C305F-C302F': { dist: 3, turn: 'left' },

  'C302F-C306F': { dist: 6, turn: 'right' },
  'C306F-C302F': { dist: 6, turn: 'right' },

  'C303F-C306F': { dist: 6, turn: 'left' },
  'C306F-C303F': { dist: 6, turn: 'left' },

  'C303F-C307F': { dist: 3, turn: 'right' },
  'C307F-C303F': { dist: 3, turn: 'right' },
};

const C314_BRANCH_DISTANCE = 8;

/* =========================
   Graph Utilities
========================= */
function makeBidirectionalGraph(graph) {
  const g = JSON.parse(JSON.stringify(graph));
  for (const n in graph) {
    for (const next of graph[n]) {
      g[next] = g[next] || [];
      if (!g[next].includes(n)) g[next].push(n);
    }
  }
  return g;
}

const bidirectionalGraph = makeBidirectionalGraph(graph);

function normalizeNode(node) {
  return node.replace('-', '');
}

function getRoom(node) {
  return node.slice(0, 4);
}

function reverseSide(side) {
  if (side === 'left') return 'right';
  if (side === 'right') return 'left';
  return side;
}

function isReverseDirection(startNode, destination) {
  const startRoom = parseInt(getRoom(startNode).slice(1));
  const destRoom = parseInt(getRoom(destination).slice(1));
  return startRoom > destRoom;
}

function getEffectiveTargetSide(startNode, destination) {
  const baseSide = sideOfDoor[destination]; // side จริงตามแผนผัง
  if (!baseSide) return null;

  if (isReverseDirection(startNode, destination)) {
    return reverseSide(baseSide);
  }
  return baseSide;
}

function getRoomDepthBySide(room) {
  const side = sideOfDoor[room + 'F'];
  if (side === 'left') return 8; // ห้องฝั่งซ้าย
  if (side === 'right') return 6; // ห้องฝั่งขวา
  return 6; // default
}

function getOppositeDistance(from, to) {
  return oppositeDistanceMap[`${from}-${to}`] || null;
}

function isC314(node) {
  return getRoom(node) === 'C314';
}

function getOppositeOffset(from, to) {
  const key1 = `${from}-${to}`;
  const key2 = `${to}-${from}`;
  return (
    oppositeDistanceMap[key1]?.dist ?? oppositeDistanceMap[key2]?.dist ?? 0
  );
}

function normalizeMarkerForDistance(markerNode) {
  if (markerNode.endsWith('B')) {
    return markerNode.replace('B', 'F');
  }
  return markerNode;
}

/* =========================
   Path Finding
========================= */
function findShortestPath(start, goal) {
  const queue = [[start]];
  const visited = new Set([start]);

  while (queue.length) {
    const path = queue.shift();
    const node = path[path.length - 1];

    if (node === goal) return path;

    for (const next of bidirectionalGraph[node] || []) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push([...path, next]);
      }
    }
  }
  return [];
}

/* =========================
   Distance Calculation
========================= */
function calculateTotalDistance(path) {
  const startRoom = parseInt(getRoom(path[0]).slice(1)); // 304
  const destRoom = parseInt(getRoom(path[path.length - 1]).slice(1)); // 307

  const stepRooms = Math.abs(destRoom - startRoom); // จำนวนห้องที่เดินผ่าน

  let dist = 0;

  // 1) เดิน F→B ของทุกห้องที่ผ่าน (ยกเว้นห้องปลายทาง)
  dist += stepRooms * (roomDepth[`C${startRoom}`] || 0);

  // 2) เดิน B→F ระหว่างห้อง
  dist += stepRooms * betweenRooms;

  return dist;
}

function calculateRemainingDistance(markerNode, destination) {
  if (markerNode === destination) return 0;

  const curRoom = parseInt(getRoom(markerNode).slice(1), 10);
  const destRoom = parseInt(getRoom(destination).slice(1), 10);

  const direction = destRoom > curRoom ? 1 : -1;

  let distance = 0;
  let room = curRoom;
  let position = markerNode.endsWith('F') ? 'F' : 'B';

  // safety guard: กัน loop ไม่จบ
  let guard = 0;

  while (!(room === destRoom && position === 'F')) {
    guard++;
    if (guard > 20) {
      // เกินจำนวนห้องจริง → ถือว่า off path
      return null;
    }

    const depth = getRoomDepthBySide(`C${room}`);

    if (position === 'F') {
      distance += depth;
      position = 'B';
    } else {
      distance += betweenRooms;
      room += direction;
      position = 'F';
    }
  }

  return distance;
}

function calculateCrossSideRoute(startNode, destination) {
  const startRoom = getRoom(startNode);
  const destRoom = getRoom(destination);

  const candidates = [];

  // ===== A) anchor จากฝั่งต้นทาง =====
  const oppStart = oppositeRooms[startRoom];
  if (oppStart) {
    const anchor = `${oppStart}F`;
    const path = findShortestPath(anchor, destination);
    if (path.length) {
      const dist =
        calculateTotalDistance(path) + getOppositeOffset(startNode, anchor);

      candidates.push({
        path: [startNode, anchor, ...path.slice(1)],
        dist,
      });
    }
  }

  // ===== B) anchor จากฝั่งปลายทาง =====
  const oppDest = oppositeRooms[destRoom];
  if (oppDest) {
    const anchor = `${oppDest}F`;
    const path = findShortestPath(startNode, anchor);
    if (path.length) {
      const dist =
        calculateTotalDistance(path) + getOppositeOffset(anchor, destination);

      candidates.push({
        path: [...path, destination],
        dist,
      });
    }
  }

  if (!candidates.length) return null;

  candidates.sort((a, b) => a.dist - b.dist);
  return candidates[0];
}

/* =========================
   CONTROLLERS
========================= */

// ===== Detect & Start Navigation =====
const detectAndNavigate = [
  upload.single('image'),
  async (req, res) => {
    const { destination, start_marker } = req.body;
    let startNode = null;
    let marker_id = null;
    let confidence = null;

    /* ---------- start marker ---------- */
    if (start_marker) {
      startNode = normalizeNode(start_marker);
      confidence = 1.0;
    } else {
      if (!req.file) {
        return res.status(400).json({
          error: 'ต้องส่ง image หรือ start_marker อย่างใดอย่างหนึ่ง',
        });
      }

      const imagePath = req.file.path;
      try {
        const form = new FormData();
        form.append('image', fs.createReadStream(imagePath));

        const pyRes = await axios.post(
          'http://localhost:5001/ar-marker',
          form,
          { headers: form.getHeaders() },
        );

        marker_id = pyRes.data.marker_id;
        confidence = pyRes.data.confidence;

        if (marker_id == null) {
          return res.status(404).json({ error: 'ไม่พบ AR Marker' });
        }

        const marker = await new Promise((resolve, reject) => {
          ArMarker.getArMarkerByMarkerId(marker_id, (err, m) => {
            if (err || !m) reject(err);
            else resolve(m);
          });
        });

        startNode = normalizeNode(marker.marker_name);
      } catch (err) {
        return res.status(500).json({ error: 'AR detection failed' });
      } finally {
        fs.unlink(imagePath, () => {});
      }
    }

    if (!destination) {
      return res.status(400).json({ error: 'ต้องระบุ destination' });
    }

    const endNode = normalizeNode(destination);
    const startIs314 = isC314(startNode);
    const endIs314 = isC314(endNode);

    /* =================================================
       ✅ 314 ↔ 301 / 304 = 8 เมตร (ตายตัว)
       ต้องมาก่อนทุก logic
    ================================================= */
    if (
      (startIs314 &&
        (getRoom(endNode) === 'C301' || getRoom(endNode) === 'C304')) ||
      (endIs314 &&
        (getRoom(startNode) === 'C301' || getRoom(startNode) === 'C304'))
    ) {
      const sessionId = Date.now().toString();

      navigationSessions[sessionId] = {
        path: [startNode, endNode],
        totalDistance: C314_BRANCH_DISTANCE,
        walkedDistance: 0,
      };

      return res.json({
        session_id: sessionId,
        marker_id,
        confidence,
        start: startNode,
        destination: endNode,
        path: [startNode, endNode],
        totalDistance: C314_BRANCH_DISTANCE,
        targetSide: sideOfDoor[endNode] || sideOfDoor[startNode],
        message: 'เดินตรงไปประมาณ 8 เมตร',
      });
    }

    /* =================================================
       ห้องตรงข้าม (opposite ตรงตัว) — เดิม
    ================================================= */
    const directOpposite = getOppositeDistance(startNode, endNode);
    if (directOpposite) {
      const sessionId = Date.now().toString();

      navigationSessions[sessionId] = {
        path: [startNode, endNode],
        totalDistance: directOpposite.dist,
        walkedDistance: 0,
      };

      let message = 'คุณถึงเป้าหมายแล้ว';
      if (directOpposite.turn === 'left') {
        message = `เดินตรงไปข้างหน้า ${directOpposite.dist} เมตร แล้วเลี้ยวซ้าย`;
      } else if (directOpposite.turn === 'right') {
        message = `เดินตรงไปข้างหน้า ${directOpposite.dist} เมตร แล้วเลี้ยวขวา`;
      }

      return res.json({
        session_id: sessionId,
        marker_id,
        confidence,
        start: startNode,
        destination: endNode,
        path: [startNode, endNode],
        totalDistance: directOpposite.dist,
        targetSide: sideOfDoor[endNode],
        message,
      });
    }

    /* =================================================
       CROSS-SIDE (เดิมของคุณ)
    ================================================= */
    const startSide = sideOfDoor[startNode];
    const destSide = sideOfDoor[endNode];

    if (
      !startIs314 &&
      !endIs314 &&
      startSide &&
      destSide &&
      startSide !== destSide &&
      startNode.endsWith('F') &&
      endNode.endsWith('F')
    ) {
      const result = calculateCrossSideRoute(startNode, endNode);
      if (result) {
        const sessionId = Date.now().toString();

        navigationSessions[sessionId] = {
          path: result.path,
          totalDistance: result.dist,
          walkedDistance: 0,
        };

        return res.json({
          session_id: sessionId,
          marker_id,
          confidence,
          start: startNode,
          destination: endNode,
          path: result.path,
          totalDistance: result.dist,
          targetSide: sideOfDoor[endNode],
          message: 'เดินตรงไปตามทางเดิน แล้วข้ามฝั่งไปยังห้องปลายทาง',
        });
      }
    }

    /* =================================================
   ✅ FINAL FIX: C314 = corridor (301/304) + 8
   เลือก branch ตามฝั่งของอีกฝั่งเสมอ
    ================================================= */
    if (startIs314 || endIs314) {
      // เลือก node ที่ใช้ดูฝั่ง
      const refNode = startIs314 ? endNode : startNode;
      const refSide = sideOfDoor[refNode];

      if (!refSide) {
        return res.status(404).json({ error: 'ไม่สามารถระบุฝั่งทางเดินได้' });
      }

      // เลือก branch ตามฝั่ง
      const branchNode = refSide === 'left' ? 'C301F' : 'C304F';

      let corridorStart, corridorEnd, corridorPath, shownPath;

      if (startIs314) {
        // ===== 314 → ห้อง =====
        corridorStart = branchNode;
        corridorEnd = endNode;

        // ⭐ FIX 305: ห้ามผ่าน C302
        if (endNode === 'C305F') {
          corridorPath = ['C304F', 'H2', 'H3', 'C305F'];
        } else {
          corridorPath = findShortestPath(branchNode, endNode);
        }

        if (!corridorPath || !corridorPath.length) {
          return res.status(404).json({ error: 'ไม่พบเส้นทาง' });
        }

        shownPath = ['C314F', ...corridorPath];
      } else {
        // ===== ห้อง → 314 =====
        corridorStart = startNode;
        corridorEnd = branchNode;

        // ⭐ FIX 305: ห้ามผ่าน C302
        if (startNode === 'C305F') {
          corridorPath = ['C305F', 'H3', 'H2', 'C304F'];
        } else {
          corridorPath = findShortestPath(startNode, branchNode);
        }

        if (!corridorPath || !corridorPath.length) {
          return res.status(404).json({ error: 'ไม่พบเส้นทาง' });
        }

        shownPath = [...corridorPath, 'C314F'];
      }

      // ===== คำนวณ corridor distance =====
      let corridorDistance = calculateRemainingDistance(
        corridorStart,
        corridorEnd,
      );

      if (corridorDistance === null) {
        return res.status(404).json({ error: 'ไม่พบเส้นทาง' });
      }

      // +8 เมตร (ทางแยก C314)
      const totalDistance = corridorDistance + C314_BRANCH_DISTANCE;

      const sessionId = Date.now().toString();
      navigationSessions[sessionId] = {
        path: shownPath,
        totalDistance,
        walkedDistance: 0,
      };

      return res.json({
        session_id: sessionId,
        marker_id,
        confidence,
        start: startNode,
        destination: endNode,
        path: shownPath,
        totalDistance,
        targetSide: sideOfDoor[endNode] || refSide,
        message: 'เดินผ่านทางแยก C314',
      });
    }

    /* =================================================
       เส้นทางปกติ (เดิม)
    ================================================= */
    const path = findShortestPath(startNode, endNode);
    if (!path.length) {
      return res.status(404).json({ error: 'ไม่พบเส้นทาง' });
    }

    const totalDistance = calculateTotalDistance(path);
    const targetSide = getEffectiveTargetSide(startNode, endNode);

    const sessionId = Date.now().toString();
    navigationSessions[sessionId] = {
      path,
      totalDistance,
      walkedDistance: 0,
    };

    return res.json({
      session_id: sessionId,
      marker_id,
      confidence,
      start: startNode,
      destination: endNode,
      path,
      totalDistance,
      targetSide,
    });
  },
];

// ===== Update Navigation =====
// const updateNavigationPosition = [
//   upload.single('image'),
//   async (req, res) => {
//     const { session_id, detected_marker } = req.body;
//     const state = navigationSessions[session_id];

//     if (!state) {
//       return res.status(404).json({ error: 'invalid session' });
//     }

//     const { path } = state;
//     const destination = path[path.length - 1];

//     let markerNode = null;

//     /* ---------- หา marker ---------- */
//     if (detected_marker && detected_marker.trim() !== '') {
//       markerNode = normalizeNode(detected_marker);
//     } else if (req.file) {
//       const imagePath = req.file.path;
//       try {
//         const form = new FormData();
//         form.append('image', fs.createReadStream(imagePath));

//         const pyRes = await axios.post(
//           'http://localhost:5001/ar-marker',
//           form,
//           { headers: form.getHeaders() },
//         );

//         const { marker_id } = pyRes.data;
//         if (marker_id == null) {
//           return res.json({ warning: 'NO_MARKER' });
//         }

//         const marker = await new Promise((resolve, reject) => {
//           ArMarker.getArMarkerByMarkerId(marker_id, (err, m) => {
//             if (err || !m) reject(err);
//             else resolve(m);
//           });
//         });

//         markerNode = normalizeNode(marker.marker_name);
//       } catch (err) {
//         return res.status(500).json({ error: 'AR detection failed' });
//       } finally {
//         if (req.file) fs.unlink(req.file.path, () => {});
//       }
//     } else {
//       return res.json({ status: 'OK' });
//     }

//     /* =========================
//        ถึงปลายทางแล้ว
//     ========================= */
//     if (markerNode === destination) {
//       return res.json({
//         success: true,
//         remainingDistance: 0,
//         message: 'คุณถึงเป้าหมายแล้ว',
//       });
//     }

//     /* =========================
//        SPECIAL CASE: C314
//     ========================= */
//     if (isC314(markerNode)) {
//       const virtualEntry = 'C304F';
//       const remaining = calculateRemainingDistance(virtualEntry, destination);

//       return res.json({
//         status: 'ON_PATH',
//         remainingDistance: remaining + C314_BRANCH_DISTANCE,
//         message: 'เดินออกจากทางแยกประมาณ 8 เมตร เพื่อเข้าสู่ทางเดินหลัก',
//       });
//     }

//     /* =========================
//        คำนวณระยะคงเหลือ (แกนเดียว)
//     ========================= */
//     const remaining = calculateRemainingDistance(markerNode, destination);

//     if (remaining === null) {
//       return res.json({
//         warning: 'OFF_PATH',
//         message: 'คุณเดินออกนอกเส้นทาง กรุณาหันกลับ',
//       });
//     }

//     /* =========================
//        OVERSHOOT
//     ========================= */
//     const currentRoom = getRoom(markerNode);
//     if (markerNode.endsWith('B') && currentRoom === getRoom(destination)) {
//       const depth = getRoomDepthBySide(currentRoom);
//       const sideText =
//         reverseSide(sideOfDoor[destination]) === 'left' ? 'ซ้าย' : 'ขวา';

//       return res.json({
//         warning: 'OVERSHOOT',
//         remainingDistance: depth,
//         message: `คุณเดินเลยเป้าหมาย กรุณากลับหลังหัน และเดินตรงไปอีก ${depth} เมตร เป้าหมายจะอยู่ทาง${sideText}`,
//       });
//     }

//     /* =========================
//        ON PATH (ปกติ)
//     ========================= */
//     return res.json({
//       status: 'ON_PATH',
//       remainingDistance: remaining,
//     });
//   },
// ];

const updateNavigationPosition = [
  upload.single('image'),
  async (req, res) => {
    const { session_id, detected_marker } = req.body;
    const state = navigationSessions[session_id];

    if (!state) {
      return res.status(404).json({ error: 'invalid session' });
    }

    const { path } = state;
    const startNode = path[0];
    const destination = path[path.length - 1];

    let markerNode = null;

    /* ---------- หา marker ---------- */
    if (detected_marker && detected_marker.trim() !== '') {
      markerNode = normalizeNode(detected_marker);
    } else if (req.file) {
      const imagePath = req.file.path;
      try {
        const form = new FormData();
        form.append('image', fs.createReadStream(imagePath));

        const pyRes = await axios.post(
          'http://localhost:5001/ar-marker',
          form,
          { headers: form.getHeaders() },
        );

        const { marker_id } = pyRes.data;
        if (marker_id == null) {
          return res.json({ warning: 'NO_MARKER' });
        }

        const marker = await new Promise((resolve, reject) => {
          ArMarker.getArMarkerByMarkerId(marker_id, (err, m) => {
            if (err || !m) reject(err);
            else resolve(m);
          });
        });

        markerNode = normalizeNode(marker.marker_name);
      } catch (err) {
        return res.status(500).json({ error: 'AR detection failed' });
      } finally {
        if (req.file) fs.unlink(req.file.path, () => {});
      }
    } else {
      return res.json({ status: 'OK' });
    }

    /* =========================
       ถึงปลายทาง
    ========================= */
    if (markerNode === destination) {
      return res.json({
        success: true,
        remainingDistance: 0,
        message: 'คุณถึงเป้าหมายแล้ว',
      });
    }

    /* =========================
       OVERSHOOT (เหมือนเดิม)
    ========================= */
    if (markerNode === `${getRoom(destination)}B`) {
      const depth = getRoomDepthBySide(getRoom(destination));
      const sideText =
        reverseSide(sideOfDoor[destination]) === 'left' ? 'ซ้าย' : 'ขวา';

      return res.json({
        warning: 'OVERSHOOT',
        remainingDistance: depth,
        message: `คุณเดินเลยเป้าหมาย กรุณากลับหลังหัน และเดินตรงไปอีก ${depth} เมตร เป้าหมายจะอยู่ทาง${sideText}`,
      });
    }

    /* =================================================
   ✅ FINAL FIX: C314 (ตรงตามตัวเลขที่กำหนด)
================================================= */
    if (path.includes('C314F')) {
      // ===== ถึง C314 จริง =====
      if (markerNode === 'C314F') {
        return res.json({
          success: true,
          remainingDistance: 0,
          message: 'คุณถึงเป้าหมายแล้ว',
        });
      }

      let virtualMarker = markerNode;
      let virtualDestination = destination;
      let extra = C314_BRANCH_DISTANCE; // +8 เสมอ

      // ===== ขาไป: ออกจาก C314 =====
      if (markerNode === 'C314F') {
        virtualMarker = 'C301F';
      }

      // ===== ขากลับ: เข้าสู่ C314 =====
      if (destination === 'C314F') {
        virtualDestination = 'C301F';
      }

      const corridorDistance = calculateRemainingDistance(
        virtualMarker,
        virtualDestination,
      );

      if (corridorDistance === null) {
        return res.json({
          warning: 'OFF_PATH',
          message: 'คุณเดินออกนอกเส้นทาง กรุณาหันกลับ',
        });
      }

      return res.json({
        status: 'ON_PATH',
        remainingDistance: corridorDistance + extra,
      });
    }

    /* =================================================
   ✅ CROSS-SIDE UPDATE (ยึดฝั่ง start)
================================================= */
    const startSide = sideOfDoor[startNode];
    const destSide = sideOfDoor[destination];

    if (
      startSide &&
      destSide &&
      startSide !== destSide &&
      markerNode.endsWith('F')
    ) {
      // เลือก anchor ตามฝั่ง start
      const anchor = startSide === 'left' ? 'C303F' : 'C306F';

      // 1) ระยะจาก marker → anchor
      const base = calculateRemainingDistance(markerNode, anchor);

      if (base === null) {
        return res.json({
          warning: 'OFF_PATH',
          message: 'คุณเดินออกนอกเส้นทาง กรุณาหันกลับ',
        });
      }

      // 2) ระยะข้ามฝั่ง
      const opposite =
        oppositeDistanceMap[`${anchor}-${destination}`] ||
        oppositeDistanceMap[`${destination}-${anchor}`];

      if (!opposite) {
        return res.json({
          warning: 'OFF_PATH',
          message: 'ไม่พบทางข้ามฝั่ง',
        });
      }

      return res.json({
        status: 'ON_PATH',
        remainingDistance: base + opposite.dist,
        message: 'เดินตรงไปแล้วข้ามฝั่งไปยังห้องปลายทาง',
      });
    }

    /* =========================
       กรณีปกติ (เดิม)
    ========================= */
    const remaining = calculateRemainingDistance(markerNode, destination);

    if (remaining === null) {
      return res.json({
        warning: 'OFF_PATH',
        message: 'คุณเดินออกนอกเส้นทาง กรุณาหันกลับ',
      });
    }

    return res.json({
      status: 'ON_PATH',
      remainingDistance: remaining,
    });
  },
];

// ------ AR MarkerCRUD ------

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
  detectAndNavigate,
  updateNavigationPosition,
  getAllFrontMarkers,
  getAllArMarkers,
  getArMarkerById,
  createArMarker,
  updateArMarker,
  deleteArMarker,
  findShortestPath,
  checkMarker,
};
