const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

const SCOPES = [process.env.GOOGLE_SHEETS_SCOPE];

const TOKEN_PATH = path.join(process.cwd(), process.env.GOOGLE_SHEETS_TOKEN_PATH);
const CREDENTIALS_PATH = path.join(process.cwd(), process.env.GOOGLE_SHEETS_KEY_PATH);

/**
 * Lee credenciales previamente autorizadas desde el archivo guardado.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializa las credenciales a un archivo compatible con GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * 
 * Read of all the sheets:
 * @see https://docs.google.com/spreadsheets/d/1ZNN5dMuNkv_DGlJc5wmsjaMckTN5mEkW6FIHSFcIyWM/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 * @return map with the list of sheets
 */
async function listSheets(auth) {
  const sheets = google.sheets({version: 'v4', auth});

  const result = (await sheets.spreadsheets.get({ 
    spreadsheetId: '1ZNN5dMuNkv_DGlJc5wmsjaMckTN5mEkW6FIHSFcIyWM'
  })).data.sheets.map((sheet) => {
    return sheet.properties.title
  })
  console.log(result);
  return result;
}

/**
 * @see https://docs.google.com/spreadsheets/d/1ZNN5dMuNkv_DGlJc5wmsjaMckTN5mEkW6FIHSFcIyWM/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client. 
 * @param {number} day The number of the day 
 * @param {string} sheet The name of the sheet
 * @returns Array of size 7. An empty string means that there is no reservation in that turn. 
 */
async function listTurns(auth, day, sheet){
  const sheets = google.sheets({version: 'v4', auth});
  const correctDay = parseInt(day)+1
  const rangeOfTurns = sheet+"!H"+correctDay+":B"+correctDay;

  const result = (await sheets.spreadsheets.values.get({
    spreadsheetId: '1ZNN5dMuNkv_DGlJc5wmsjaMckTN5mEkW6FIHSFcIyWM',
    range:rangeOfTurns.toString()
  }))

  const rows = await result.data.values || [""];
  //normalize rows so that they all have the same number of columns
  const desiredWidth = 7;
  const normalized = rows.map (r => {
    const copy = [...r];
    while (copy.length < desiredWidth) copy.push('');
    return copy;
  })

  return(normalized);
}

/**
 * Write a message in a cell of the specific sheet
 * @see https://docs.google.com/spreadsheets/d/1ZNN5dMuNkv_DGlJc5wmsjaMckTN5mEkW6FIHSFcIyWM/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client. 
 * @param {number} day The number of the day.
 * @param {string} sheet The name of the sheet. 
 * @param {string} column A char from B to H.
 * @param {string} keyword The string to write in the cell
 * @returns 
 */
async function reserve(auth, day, sheet, column, keyword) {
  const sheets = google.sheets({version: 'v4', auth});
  const correctDay = parseInt(day)+1
  const targetCell = sheet+"!"+column+correctDay+":"+column+correctDay;

  const result = await sheets.spreadsheets.values.update({
    spreadsheetId: '1ZNN5dMuNkv_DGlJc5wmsjaMckTN5mEkW6FIHSFcIyWM',
    range:targetCell.toString(),
    valueInputOption: 'RAW',
    resource:{
      values:[[keyword]]
    }
  })

  return(result.status)
}

module.exports = {authorize, listSheets, listTurns, reserve}
authorize().then(listSheets).catch(console.error);