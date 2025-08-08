const express = require('express');
const router = express.Router();
const {
  localize,
  getAllFingerprints,
  getFingerprintById,
  createFingerprint,
  updateFingerprint,
  deleteFingerprint,
} = require('../controllers/localize.controller');

/**
 * @swagger
 * tags:
 *   name: Localization
 *   description: คำนวณตำแหน่งจาก RSSI
 */

/**
 * @swagger
 * /api/localize:
 *   post:
 *     summary: คำนวณตำแหน่งจากค่า RSSI
 *     tags: [Localization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rssi_map:
 *                 type: object
 *                 example:
 *                   Ruuvi_30E9: [-54, -54, -53, -55]
 *                   Ruuvi_9A12: [-70, -71, -69, -70]
 *     responses:
 *       200:
 *         description: ตำแหน่งที่คำนวณได้
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 x:
 *                   type: number
 *                 y:
 *                   type: number
 */
router.post('/localize', localize);

/**
 * @swagger
 * /api/fingerprints:
 *   get:
 *     summary: ดึง Fingerprint ทั้งหมด
 *     tags: [Localization]
 *     responses:
 *       200:
 *         description: รายการ Fingerprint ทั้งหมด
 */
router.get('/fingerprints', getAllFingerprints);

/**
 * @swagger
 * /api/fingerprints/{id}:
 *   get:
 *     summary: ดึง Fingerprint ตาม ID
 *     tags: [Localization]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Fingerprint ที่พบ
 *       404:
 *         description: ไม่พบข้อมูล
 */
router.get('/fingerprints/:id', getFingerprintById);

/**
 * @swagger
 * /api/fingerprints:
 *   post:
 *     summary: เพิ่ม Fingerprint ใหม่
 *     tags: [Localization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               x:
 *                 type: integer
 *               y:
 *                 type: integer
 *               beacon_id:
 *                 type: string
 *               rssi_values:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: เพิ่มเรียบร้อย
 */
router.post('/fingerprints', createFingerprint);

/**
 * @swagger
 * /api/fingerprints/{id}:
 *   put:
 *     summary: แก้ไข Fingerprint
 *     tags: [Localization]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               x:
 *                 type: integer
 *               y:
 *                 type: integer
 *               beacon_id:
 *                 type: string
 *               rssi_values:
 *                 type: array
 *                 items:
 *                   type: number
 *     responses:
 *       200:
 *         description: แก้ไขสำเร็จ
 */
router.put('/fingerprints/:id', updateFingerprint);

/**
 * @swagger
 * /api/fingerprints/{id}:
 *   delete:
 *     summary: ลบ Fingerprint
 *     tags: [Localization]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 */
router.delete('/fingerprints/:id', deleteFingerprint);

module.exports = router;
