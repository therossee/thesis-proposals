const axios = require('axios');
const FormData = require('form-data');

const INSERT_URL = 'https://didattica.polito.it/pls/portal30/sviluppo.elaborato_finale.insert_pdf_orig';
const DOWNLOAD_URL = 'https://didattica.polito.it/pls/portal30/sviluppo.elaborato_finale.dowload_pdf_conv?p_id=';

async function convertToPdfA({ buffer, filename }) {
  const form = new FormData();
  form.append('p_file_pdf', buffer, { filename });

  const uploadResp = await axios.post(INSERT_URL, form, {
    headers: {
      ...form.getHeaders(),
      'X-Requested-With': 'XMLHttpRequest',
      Accept: 'application/json, text/javascript, */*; q=0.01',
    },
    validateStatus: s => s >= 200 && s < 300,
  });

  const data = typeof uploadResp.data === 'string' ? JSON.parse(uploadResp.data) : uploadResp.data;

  const fileId = data?.files?.[0]?.id;
  if (!fileId) {
    throw new Error('Conversion service did not return a file id');
  }

  const downloadResp = await axios.get(`${DOWNLOAD_URL}${fileId}`, {
    responseType: 'arraybuffer',
    validateStatus: s => s >= 200 && s < 300,
  });

  return Buffer.from(downloadResp.data);
}

module.exports = { convertToPdfA };
