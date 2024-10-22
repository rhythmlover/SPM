import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const credentials = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, 'service-account.json'), 'utf8')
);

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const sheetId = '1YHx3x8-xQE2dihE6RT3oPCIn3P9qOGMILa6kkGjNsnM';

const auth = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  SCOPES
);

const sheets = google.sheets({ version: 'v4', auth });

function getCurrentDateTimeGMT8() {
  const date = new Date();
  const gmt8Time = new Date(date.getTime() + (8 * 60 * 60 * 1000));
  const formattedDate = gmt8Time.toISOString().replace('T', ' ').substring(0, 19);

  return formattedDate;
}

export async function updateSheet(testId, status) {
  // Fetch existing data from the sheet (assuming the ID starts in column A, status in K, and date in P)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'UNITTESTS!A3:P', // Adjust range if needed, starting from A3
  });

  const rows = response.data.values;
  const dateTimeGMT8 = getCurrentDateTimeGMT8();

  if (rows && rows.length) {
    // Find the row with the matching testId (in column A)
    const rowIndex = rows.findIndex(row => row[0] === testId);

    if (rowIndex !== -1) {
      const rowNumber = rowIndex + 3;
      const statusRange = `UNITTESTS!K${rowNumber}`;
      const dateRange = `UNITTESTS!P${rowNumber}`;  

      sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: sheetId,
        resource: {
          data: [
            {
              range: statusRange,
              values: [[status]],
            },
            {
              range: dateRange,
              values: [[dateTimeGMT8]],
            }
          ],
          valueInputOption: 'USER_ENTERED',
        }
      });
      console.log(`Test case ${testId} updated successfully.`);
    } else {
      // If test case ID does not exist, append it to the next available row
      sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'UNITTESTS!A:P',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [[testId, , , , , , , , , , status, , , dateTimeGMT8, , dateTimeGMT8]]
        }
      });
      console.log(`Test case ${testId} added successfully.`);
    }
  } else {
    // If no data exists in the sheet, append the first row
    sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'UNITTESTS!A:P',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[testId, , , , , , , , , , status, , , dateTimeGMT8, , dateTimeGMT8]]
      }
    });
    console.log(`Test case ${testId} added as the first entry.`);
  }
}

// Initialization for a new sprint sheet (Do not delete - Nigel)
async function sprintSheetInit() {
  const request = {
    spreadsheetId: sheetId,
    resource: {
      requests: [
        {
          setDataValidation: {
            range: {
              sheetId: 0,
              startRowIndex: 2,
              endRowIndex: 100,
              startColumnIndex: 10,
              endColumnIndex: 11
            },
            rule: {
              condition: {
                type: 'ONE_OF_LIST',
                values: [
                  { userEnteredValue: 'Passed' },
                  { userEnteredValue: 'Failed' }
                ]
              },
              strict: true,
              showCustomUi: true
            }
          }
        }
      ]
    }
  };

  try {
    await sheets.spreadsheets.batchUpdate(request);
    console.log('Dropdown validation added to column K.');
  } catch (error) {
    console.error('Error adding dropdown validation:', error);
  }
}