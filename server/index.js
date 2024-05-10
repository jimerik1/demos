const cors = require('cors');
const express = require('express');
const multer = require('multer');
const app = express();

// Enable CORS for all routes and origins
app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());

// Set up multer storage engine for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');  // Save files in 'uploads' directory
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Endpoint to handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
    console.log('Received file:', req.file.originalname);
    res.json({ message: 'File received' });
});

// Existing endpoint to multiply two numbers
app.post('/multiply', (req, res) => {
    const { number1, number2 } = req.body;
    const result = number1 * number2;
    res.json({ result });
});

// Set the port for the server
const PORT = process.env.PORT || 3001;

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
