const cors = require('cors');
const express = require('express');
const app = express();

app.use(cors());  // This enables CORS for all routes and origins
app.use(express.json());  // Middleware to parse JSON bodies

app.post('/multiply', (req, res) => {
    const { number1, number2 } = req.body;
    const result = number1 * number2;
    res.json({ result });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
