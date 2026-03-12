const express = require('express');
const router = express.Router();
const arMarkersController = require('../controllers/arMarkers.controller');
const navigationController = require('../controllers/navigation.controller')

/**
 * @swagger
 * /ar-markers:
 *   get:
 *     summary: ดึงข้อมูล AR Markers ทั้งหมด
 *     tags: [AR Markers]
 *     responses:
 *       200:
 *         description: รายการ AR Markers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   marker_id:
 *                     type: integer
 *                   marker_name:
 *                     type: string
 */
router.get('/ar-markers', arMarkersController.getAllArMarkers);

/**
 * @swagger
 * /ar-markers/front:
 *   get:
 *     summary: ดึงข้อมูล AR Markers ชั้นหน้า
 *     tags: [AR Markers]
 *     responses:
 *       200:
 *         description: รายการ AR Markers ชั้นหน้า
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   marker_id:
 *                     type: integer
 *                   marker_name:
 *                     type: string
 */
router.get('/ar-markers/front', arMarkersController.getAllFrontMarkers);

/**
 * @swagger
 * /ar-markers/{id}:
 *   get:
 *     summary: ดึงข้อมูล AR Marker ตาม ID
 *     tags: [AR Markers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ของ AR Marker
 *     responses:
 *       200:
 *         description: ข้อมูล AR Marker
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 marker_id:
 *                   type: integer
 *                 marker_name:
 *                   type: string
 */
router.get('/ar-markers/:id', arMarkersController.getArMarkerById);

/**
 * @swagger
 * /ar-markers:
 *   post:
 *     summary: สร้าง AR Marker ใหม่
 *     tags: [AR Markers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marker_id:
 *                 type: integer
 *               marker_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: สร้าง AR Marker สำเร็จ
 */
router.post('/ar-markers', arMarkersController.createArMarker);

/**
 * @swagger
 * /ar-markers/{id}:
 *   put:
 *     summary: อัปเดตข้อมูล AR Marker ตาม ID
 *     tags: [AR Markers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ของ AR Marker
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marker_id:
 *                 type: integer
 *               marker_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: อัปเดต AR Marker สำเร็จ
 */
router.put('/ar-markers/:id', arMarkersController.updateArMarker);

/**
 * @swagger
 * /ar-markers/{id}:
 *   delete:
 *     summary: ลบ AR Marker ตาม ID
 *     tags: [AR Markers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ของ AR Marker
 *     responses:
 *       204:
 *         description: ลบ AR Marker สำเร็จ
 */
router.delete('/ar-markers/:id', arMarkersController.deleteArMarker);

/**
 * @swagger
 * /ar-markers/detect-and-navigate:
 *   post:
 *     summary: ตรวจจับ AR Marker และนำทาง
 *     tags: [AR Markers]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               destination:
 *                 type: string
 *     responses:
 *       200:
 *         description: ตรวจจับ AR Marker และนำทางสำเร็จ
 */
router.post(
  '/ar-markers/detect-and-navigate',
  navigationController.detectAndNavigate,
);

/**
 * @swagger
 * /ar-markers/update-position:
 *   post:
 *     summary: อัปเดตตำแหน่งปัจจุบันของผู้ใช้ในการนำทาง
 *     tags: [AR Markers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_id:
 *                 type: string
 *               current_marker_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: อัปเดตตำแหน่งสำเร็จ
 */
router.post(
  '/ar-markers/update-position',
  navigationController.updateNavigationPosition,
);

/**   
 * @swagger
 * /ar-markers/check-marker:
 *   post:
 *     summary: ตรวจสอบ AR Marker ที่ถูกตรวจจับ
 *     tags: [AR Markers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marker_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: ตรวจสอบ AR Marker สำเร็จ
 */ 
router.post('/ar-markers/check', arMarkersController.checkMarker);


module.exports = router;
