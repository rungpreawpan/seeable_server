const express = require('express');
const router = express.Router();
const objectDetectionController = require('../controllers/objectDetect.controller');

/**
 * @swagger
 * /object-detection:
 *   post:
 *     summary: อัปโหลดภาพเพื่อทำ Object Detection
 *     tags: [Object Detection]
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
 *         description: ผลลัพธ์จาก Object Detection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 objects:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       confidence:
 *                         type: number
 */

router.post('/object-detection', objectDetectionController.objectDetection); 

module.exports = router;
