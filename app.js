const express = require('express');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Load the service account key JSON file
const serviceAccountKey = require('./credentials.json'); // Replace with your service account key file

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

// Handle form submissions
app.post('/submit', async (req, res) => {
    const { name, enrollment, os } = req.body;

    try {
        // Authenticate with Google Sheets using the service account credentials
        const auth = await authorize();

        const osLower = os.toLowerCase();

        // Check if OS is unique
        const isUnique = await checkUniqueOS(auth, osLower);

        if (!isUnique) {
            res.json({ error: 'Operating system is not unique.' });
            return;
        }

        // Add data to Google Sheets
        await appendToSheet(auth, [name, enrollment, osLower]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error.' });
    }
});

// Google Sheets API functions
async function authorize() {
    const jwtClient = new google.auth.JWT(
        serviceAccountKey.client_email,
        null,
        serviceAccountKey.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
    );

    try {
        await jwtClient.authorize();
        return jwtClient;
    } catch (err) {
        console.error('Error authorizing with service account:', err);
        throw err;
    }
}

async function checkUniqueOS(auth, os) {
    // Replace with your Google Sheets document ID and sheet name
    const spreadsheetId = '1Go2YQHRPmf8cni6kINGj_QNc1HXT0VcVYp3Cg5x8Sp4'; // Update with your Spreadsheet ID
    const sheetName = 'Sheet1';

    // Load the sheet
    const sheetsAPI = google.sheets({ version: 'v4', auth });
    const sheet = await sheetsAPI.spreadsheets.values.get({
        spreadsheetId,
        range: sheetName,
    });

    // Check if the OS already exists in the sheet
    const data = sheet.data.values;
    if (data) {
        return !data.some(row => row[2] === os);
    } else {
        return true;
    }
}

// Start the server only if not in a Netlify environment
if (!process.env.NETLIFY) {
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}
