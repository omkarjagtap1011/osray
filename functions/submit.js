const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

// Load the service account key JSON file
const serviceAccountKey = require('./credentials.json'); // Replace with your service account key file

// Handle form submissions
router.post('/submit', async (req, res) => {
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
    return !data.some((row) => row[2] === os);
  } else {
    return true;
  }
}

async function appendToSheet(auth, data) {
  // Replace with your Google Sheets document ID and sheet name
  const spreadsheetId = '1Go2YQHRPmf8cni6kINGj_QNc1HXT0VcVYp3Cg5x8Sp4'; // Update with your Spreadsheet ID
  const sheetName = 'Sheet1';

  // Load the sheet
  const sheetsAPI = google.sheets({ version: 'v4', auth });
  await sheetsAPI.spreadsheets.values.append({
    spreadsheetId,
    range: sheetName,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: [data],
    },
  });
}
