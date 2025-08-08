const express = require('express');
const router = express.Router();
const { login, getUserByUUID } = require('../controllers/login.controller');

/**
 * @swagger
 * /login:
 *   post:
 *     summary: เข้าสู่ระบบ
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: password
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     uuid:
 *                       type: string
 *                     firstname:
 *                       type: string
 *                     lastname:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
 */

/**
 * @swagger
 * /user/{uuid}:
 *   get:
 *     summary: ดึงข้อมูลผู้ใช้จาก UUID
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID ของผู้ใช้
 *     responses:
 *       200:
 *         description: รายละเอียดผู้ใช้
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 uuid:
 *                   type: string
 *                 firstname:
 *                   type: string
 *                 lastname:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       404:
 *         description: ไม่พบผู้ใช้
 */

router.post('/login', login);
router.get('/user/:uuid', getUserByUUID);

module.exports = router;
