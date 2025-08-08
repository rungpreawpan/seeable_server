const express = require('express');
const router = express.Router();
const { registerUser, updateUser } = require('../controllers/register.controller');

/**
 * @swagger
 * /register:
 *   post:
 *     summary: ลงทะเบียนผู้ใช้ใหม่
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - uuid
 *               - username
 *               - password
 *               - email
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               uuid:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: ลงทะเบียนสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบถ้วน
 *       500:
 *         description: เกิดข้อผิดพลาดขณะลงทะเบียน
 */

router.post('/register', registerUser);

/**
 * @swagger
 * /users/{uuid}:
 *   put:
 *     summary: แก้ไขข้อมูลผู้ใช้
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         description: UUID ของผู้ใช้
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบถ้วน
 *       404:
 *         description: ไม่พบผู้ใช้งาน
 *       500:
 *         description: ไม่สามารถแก้ไขข้อมูลได้
 */
router.put('/users/:uuid', updateUser);

module.exports = router;
