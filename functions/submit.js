const { google } = require('googleapis');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const requestBody = JSON.parse(event.body);
    const { name, enrollment, os } = requestBody;

    // Load your Google Sheets API credentials
    const auth = await authorize();

    const osLower = os.toLowerCase();

    // Check if OS is unique
    const isUnique = await checkUniqueOS(auth, osLower);

    if (!isUnique) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Operating system is not unique.' }),
      };
    }

    // Add data to Google Sheets
    await appendToSheet(auth, [name, enrollment, osLower]);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error.' }),
    };
  }
};

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
