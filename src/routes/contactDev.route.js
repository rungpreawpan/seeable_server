const express = require('express');
const router = express.Router();
const controller = require('../controllers/contactDev.controller');

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: ส่งข้อความติดต่อไปยังนักพัฒนา
 *     tags:
 *       - Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               message:
 *                 type: string
 *                 example: ผมสนใจแอปของคุณ อยากสอบถามเพิ่มเติม
 *     responses:
 *       200:
 *         description: ส่งอีเมลสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email sent successfully
 *       500:
 *         description: ส่งอีเมลไม่สำเร็จ
 */
router.post('/contact-dev', controller.sendContactEmail);

module.exports = router;