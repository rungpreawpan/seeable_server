const express = require('express');
const router = express.Router();
const ocrController = require('../controllers/ocr.controller');

/**
 * @swagger
 * /ocr:
 *   post:
 *     summary: อัปโหลดภาพเพื่อทำ OCR
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
 *     responses:
 *       200:
 *         description: ผลลัพธ์จาก OCR
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string 
 */

router.post('/ocr', ocrController.ocr);

module.exports = router;
