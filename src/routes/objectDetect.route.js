const express = require('express');
const router = express.Router();
const objectDetectionController = require('../controllers/objectDetect.controller');

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: อัปโหลดภาพเพื่อประมวลผลด้วย YOLO
 *     consumes:
 *       - multipart/form-data
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
 *     responses:
 *       200:
 *         description: เริ่มประมวลผลภาพแล้ว
 */
router.post('/upload-object', objectDetectionController.uploadImage);

/**
 * @swagger
 * /results:
 *   post:
 *     summary: รับผลลัพธ์จาก YOLO Python Script
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               boxes:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                     confidence:
 *                       type: number
 *                     x1:
 *                       type: number
 *                     y1:
 *                       type: number
 *                     x2:
 *                       type: number
 *                     y2:
 *                       type: number
 *     responses:
 *       200:
 *         description: รับผลเรียบร้อยแล้ว
 */
router.post('/results', objectDetectionController.receiveResult);

/**
 * @swagger
 * /get-latest:
 *   get:
 *     summary: ดึงผลลัพธ์ล่าสุดจาก YOLO
 *     responses:
 *       200:
 *         description: ผลลัพธ์ล่าสุด
 *       404:
 *         description: ยังไม่มีผลลัพธ์
 */
router.get('/object-results', objectDetectionController.getLatest);

module.exports = router;
