const express = require('express');
const router = express.Router();
const {
  startNavigation,
  stopNavigation,
  receiveBLEData,
  getBLEData,
} = require('../controllers/navigation.controller');

/**
 * @swagger
 * /navigation/start:
 *   post:
 *     summary: เริ่มการนำทาง
 *     tags: [Navigation]
 *     description: เริ่มต้นการนำทางโดยส่ง UUID ของผู้ใช้ไปยัง Gateway
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uuid
 *             properties:
 *               uuid:
 *                 type: string
 *                 example: abc-1234
 *     responses:
 *       200:
 *         description: เริ่มนำทางแล้ว
 *       400:
 *         description: ไม่ได้ส่ง UUID
 *       500:
 *         description: แจ้ง Gateway ไม่สำเร็จ
 */
router.post('/navigation/start', startNavigation);

/**
 * @swagger
 * /navigation/stop:
 *   post:
 *     summary: หยุดการนำทาง
 *     tags: [Navigation]
 *     description: หยุดการนำทางแบบเรียลไทม์
 *     responses:
 *       200:
 *         description: หยุดนำทางแล้ว
 *       500:
 *         description: แจ้ง Gateway ไม่สำเร็จ
 */
router.post('/navigation/stop', stopNavigation);

/**
 * @swagger
 * /ble-data:
 *   post:
 *     summary: รับข้อมูล BLE จาก Gateway
 *     tags: [Navigation]
 *     description: Gateway ส่งข้อมูล BLE มายัง server นี้ พร้อม UUID และตำแหน่ง
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               uuid:
 *                 type: string
 *               mac:
 *                 type: string
 *               name:
 *                 type: string
 *               rssi:
 *                 type: integer
 *     responses:
 *       200:
 *         description: รับข้อมูลแล้ว
 *       403:
 *         description: ยังไม่ได้เริ่มนำทาง
 */
router.post('/ble-data', receiveBLEData);

/**
 * @swagger
 * /ble:
 *   get:
 *     summary: ดึงข้อมูล BLE แบบ streaming
 *     description: ใช้เพื่อดึงข้อมูล BLE ที่ถูกส่งเข้ามาล่าสุดผ่าน POST /ble
 *     tags: [Navigation]
 *     responses:
 *       200:
 *         description: ข้อมูล BLE ล่าสุด
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uuid:
 *                   type: string
 *                   example: "c7534f9f23829bce"
 *                 mac:
 *                   type: string
 *                   example: "09F84D97-4ADA-4EC0-D966-E58D85FC5AAC"
 *                 name:
 *                   type: string
 *                   example: "Ruuvi AB5E"
 *                 rssi:
 *                   type: integer
 *                   example: -46
 *       404:
 *         description: ยังไม่มีข้อมูล BLE
 */
router.get('/ble', getBLEData); 

module.exports = router;
