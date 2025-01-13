const { D1 } = require('@cloudflare/workers-types');
require('dotenv').config()

export const handler = async (event) => {

    const CLOUDFLARE_D1_DATABASE_ID = process.env.CLOUDFLARE_D1_DATABASE_ID
    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

    // Constants
    const CLOUDFLARE_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/d1/database/${CLOUDFLARE_D1_DATABASE_ID}`

    const sendRequestWithRetries = async (url, headers, payload, retries = 3, delay = 2) => {
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });
            response.ok ? null :  (()=> {throw Error(`Error ${response.status} ${response.statusText}`)})()
            const jsonResponse = await response.json();
            return jsonResponse;
        } catch (e) {
            console.log(`[ERROR] Attempt ${attempt + 1} failed: ${e}`)
            if (attempt < retries - 1) {
                console.log(`[INFO] Retrying in ${delay} seconds...`)
                await new Promise(resolve => setTimeout(resolve, delay * 1000));
            } else {
                throw e;
            }
        }
    }
}

  const queryPayload = {
      "sql": `SELECT appid FROM ios_top100_rank_data limit 10;`
    };
  const url = `${CLOUDFLARE_BASE_URL}/query`;
  const headers = {
        "Authorization": `Bearer ${CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json"
    };

    try {
        const response = await sendRequestWithRetries(url, headers, queryPayload);
      const results = response.result[0].results;
      const appIds = results.map((item) =>  parseInt(item[0].value));
       return {
           statusCode: 200,
           body: JSON.stringify({result: appIds}),
        };
    }
    catch (e){
        console.log(`error fetching data: ${e}`)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch app data from db' }),
          };
        }
  };
