const express = require('express');
const router = express.Router();
const obstacleWarningController = require('../controllers/obstacleWarning.controller');

/**
 * @swagger
 * /upload-object:
 *   post:
 *     summary: อัปโหลดภาพเพื่อตรวจจับสิ่งกีดขวางด้วย YOLO
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
router.post('/upload-obstacle', obstacleWarningController.uploadImage);

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
router.post('/obstacle-detect-results', obstacleWarningController.receiveResult);

/**
 * @swagger
 * /object-results:
 *   get:
 *     summary: ดึงผลลัพธ์ล่าสุดจาก YOLO
 *     responses:
 *       200:
 *         description: ผลลัพธ์ล่าสุด
 *       404:
 *         description: ยังไม่มีผลลัพธ์
 */
router.get('/obstacle-results', obstacleWarningController.getLatest);

module.exports = router;