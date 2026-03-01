const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

const objectDetection = [
  upload.single('image'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'ไม่พบไฟล์ภาพที่อัปโหลด' });
    }

    const imagePath = req.file.path;

    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    try {
      const response = await axios.post(
        'http://localhost:5001/object-detection',
        form,
        {
          headers: form.getHeaders(),
        },
      );

      return res.status(200).json(response.data);      
    } catch (err) {
      console.error('Error:', err.message);
      return res.status(500).json({
        error: 'Failed to send to Python',
        detail: err.message,
      });
    } finally {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('ลบไฟล์ไม่สำเร็จ:', err.message);
        }
      });
    }
  },
];

module.exports = {
  objectDetection,
};
