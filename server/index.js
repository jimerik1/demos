const cors = require('cors');
const express = require('express');
const multer = require('multer');
const app = express();

app.use(cors());
app.use(express.json());


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
    const model = req.body.model; // Retrieve the model from the request body
    console.log('Received file:', req.file.originalname, 'Selected AI Model:', model);
    if (model === "gpt4") {
        console.log("GPT 4"); 
    } else if (model === "gpt3") {
        console.log("GPT 3.5");
    } else if (model === "claude3"){
        console.log("Claude 3");
    }
    
    res.json({ message: 'File received', model });
});

app.post('/multiply', (req, res) => {
    const { number1, number2 } = req.body; // Extract numbers from request body
    const product = number1 * number2; // Correct operation for multiplication
    console.log(product); // Log the correct result
    res.json({ result: product }); // Send the result back to the client
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
