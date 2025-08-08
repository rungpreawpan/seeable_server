const express = require('express');
const router = express.Router();
const ocrController = require('../controllers/ocr.controller');

/**
 * @swagger
 * /upload-ocr:
 *   post:
 *     summary: อัปโหลดภาพและภาษาที่ต้องการให้ OCR ตรวจจับ
 *     tags: [OCR]
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
 *               lang:
 *                 type: string
 *                 example: tha
 *     responses:
 *       200:
 *         description: เริ่ม OCR แล้ว
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OCR processing started
 *       500:
 *         description: ไม่สามารถส่งข้อมูลไป OCR Python ได้
 */
router.post('/upload-ocr', ocrController.uploadOCR);

/**
 * @swagger
 * /ocr-result:
 *   post:
 *     summary: รับผลลัพธ์ OCR จากฝั่ง Python
 *     tags: [OCR]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: ตัวอย่างข้อความที่ตรวจจับได้
 *               lang:
 *                 type: string
 *                 example: tha
 *     responses:
 *       200:
 *         description: รับผลสำเร็จ
 */
router.post('/ocr-detect', ocrController.receiveOCRResult);

/**
 * @swagger
 * /ocr-latest:
 *   get:
 *     summary: ดึงผลลัพธ์ OCR ล่าสุด
 *     tags: [OCR]
 *     responses:
 *       200:
 *         description: คืนผลลัพธ์ OCR ล่าสุด
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   example: ตัวอย่างข้อความ
 *                 lang:
 *                   type: string
 *                   example: tha
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: ยังไม่มีผล OCR
 */
router.get('/ocr-result', ocrController.getLatestOCR);

module.exports = router;
