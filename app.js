const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// Set up middleware
app.use(bodyParser.json());

// Serve the HTML file at the root URL
app.get('/', (req, res) => {
    // Read the index.html file and send it as a response
    fs.readFile('index.html', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading index.html:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.send(data);
        }
    });
});

// Include the submit route from submit.js
const submitRoute = require('./functions/submit');
app.use(submitRoute);

// Start the server only if not in a Netlify environment
if (!process.env.NETLIFY) {
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
