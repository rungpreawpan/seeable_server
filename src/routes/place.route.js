const express = require('express');
const router = express.Router();
const {
  getPlaces,
  addPlace,
  updatePlace,
  getPlaceById,
  deletePlace,
  setFavorite,
} = require('../controllers/place.controller');

/**
 * @swagger
 * tags:
 *   name: Place
 *   description: API สำหรับจัดการสถานที่ (Place)
 */

/**
 * @swagger
 * /places:
 *   get:
 *     summary: ดึงรายชื่อสถานที่ทั้งหมด
 *     tags: [Place]
 *     responses:
 *       200:
 *         description: รายชื่อสถานที่ทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Place'
 */
router.get('/places', getPlaces);

/**
 * @swagger
 * /places:
 *   post:
 *     summary: เพิ่มสถานที่ใหม่
 *     tags: [Place]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewPlace'
 *     responses:
 *       201:
 *         description: เพิ่มสถานที่เรียบร้อย
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Place'
 *       400:
 *         description: ข้อมูลไม่ครบถ้วน
 */
router.post('/places', addPlace);

/**
 * @swagger
 * /places/{id}:
 *   put:
 *     summary: แก้ไขข้อมูลสถานที่
 *     tags: [Place]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสของสถานที่
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewPlace'
 *     responses:
 *       200:
 *         description: แก้ไขสถานที่สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบถ้วน
 *       500:
 *         description: เกิดข้อผิดพลาด
 */
router.put('/places/:id', updatePlace);

/**
 * @swagger
 * /places/{id}:
 *   get:
 *     summary: ดึงข้อมูลสถานที่ตาม ID
 *     tags: [Place]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสสถานที่
 *     responses:
 *       200:
 *         description: ข้อมูลสถานที่
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Place'
 *       404:
 *         description: ไม่พบสถานที่
 */
router.get('/places/:id', getPlaceById);

/**
 * @swagger
 * /places/{id}:
 *   delete:
 *     summary: ลบสถานที่ตาม ID
 *     tags: [Place]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: รหัสสถานที่
 *     responses:
 *       200:
 *         description: ลบสถานที่เรียบร้อย
 *       404:
 *         description: ไม่พบสถานที่
 */
router.delete('/places/:id', deletePlace);

/**
 * @swagger
 * /places/{id}/favorite:
 *   put:
 *     summary: เปลี่ยนสถานะ favorite ของสถานที่
 *     tags: [Place]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสของสถานที่
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_favorite
 *             properties:
 *               is_favorite:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: เปลี่ยนสถานะ favorite สำเร็จ
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       500:
 *         description: ไม่สามารถอัปเดตข้อมูลได้
 */
router.put('/places/:id/favorite', setFavorite);

module.exports = router;
