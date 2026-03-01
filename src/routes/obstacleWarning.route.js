const express = require('express');
const router = express.Router();
const obstacleWarningController = require('../controllers/obstacleWarning.controller');

/**
 * @swagger
 * /obstacle-detection:
 *   post:
 *     summary: อัปโหลดภาพเพื่อทำ Obstacle Detection
 *     tags: [Obstacle Detection]
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
 *         description: ผลลัพธ์จาก Obstacle Detection
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 obstacles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       confidence:
 *                         type: number 
 */

router.post('/obstacle-detection', obstacleWarningController.obstacle);

module.exports = router;
