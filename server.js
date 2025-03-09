const express = require('express');
const axios = require('axios');
const app = express();
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const puppeteer = require("puppeteer");
const cors = require('cors');

const url = process.env.URL || '';
const henalluxUrl = "https://portail.henallux.be/";
const PORT = process.env.PORT || 3000;


let requestData =
{
    "xsrf" : null,
    "session" : null,
    "token" : null,
    "snapshot" : null,
    "lastUpdate" : null
}

dotenv.config();

app.use(express.static('public'));
app.use(express.json());
app.use(cors({
    origin: "*",
    methods: ['POST'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept-Language'],
}));
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).send('Bad request');
});

// Only allow POST requests
app.use((req, res, next) => {
    if (req.method !== 'POST')
    {
        return res.status(405).json({ message: `HTTP Method ${req.method} is not allowed` });
    }
    next();
});

app.post("/api/updaterequestdata", async (req, res) =>
{
    let key = process.env.KEY || '';
    if (req.body.key !== key)
    {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    await updateRequestData();

    res.json("Request data updated");
});

app.post("/api/planning", async (req, res) => {
    //const { promotions } = req.body; // Récupère les promotions du corps de la requête
    let items = req.body;

    let response = await getPromotions(items);

    res.json(response);
});

app.listen(PORT, async () =>
{
    console.log('Server running on port ' + PORT);

    setRequestData();
    //await updateRequestData();
});


async function sendRequest(items, times = 0)
{
    if (times > 3)
    {
        console.error('Error: Too many attempts');
        return { status: 520 };
    }

    const headers = {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
        "Origin": "https://portail.henallux.be",
        "Referer": "https://portail.henallux.be/",
        "X-Livewire": "",
        "Cookie": "portail_session=" + requestData.session
    };

    let updates = {};
    items.forEach((item, index) =>
    {
        updates[`items_selected.${index}`] = item;
    });

   const payload = {
        "_token": requestData.token,
        "components": [
            {
                "snapshot": requestData.snapshot,
                "updates":
                    {
                        ...updates,
                },
                "calls": [
                    {
                        "path": "",
                        "method": "handle_click_promotion_submit",
                        "params": []
                    }
                ]
            }
        ]
    };

    try {
        const response = await axios.post(henalluxUrl + "livewire/update", payload, { headers });

        if (response.status === 200) {
            return {status : response.status, data: response.data};
        } else {
            console.error('Error ', response.status, " : Unexpected error");
            return {status : response.status};
        }
    } catch (error) {
        if (error.response && error.response.status === 419) {
            console.error('Error 419: Trying to get a new csrf token');
            await updateRequestData();
            return await sendRequest(items, times + 1); // Ajout du `return` ici
        } else {
            console.error('Error:', error);
            return {status : 520};
        }
    }
}

async function updateRequestData()
{
    const formattedDate = new Date().toLocaleString();
    console.log(formattedDate + ' - Updating Request Data');

    let portail_token = requestData.session || '';
    let xsrf_token = requestData.xsrf || '';

    const cookies =
    [
        `portail_session=${portail_token}`,
        `XSRF-TOKEN=${xsrf_token}`
    ].join('; ');

    console.log('Updating Request Data');
    axios.get(henalluxUrl, {
        headers: {
            'Cookie': cookies,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/'
        }
    })
        .then(response => {
            const cookie = response.headers['set-cookie'];

            // update RequestData
            requestData.session = cookie.find(c => c.startsWith('portail_session')).split(';')[0].split('=')[1];
            requestData.xsrf = cookie.find(c => c.startsWith('XSRF-TOKEN')).split(';')[0].split('=')[1];
            requestData.token = response.data.match(/<meta name="csrf-token" content="(.*)">/)[1];
            requestData.lastUpdate = new Date().toISOString();

            fs.writeFileSync(path.join(__dirname, 'tokens.bak'), JSON.stringify(requestData, null, 2));

            console.log('Request data updated');

            return { status: 200 };

        })
        .catch(error => {
            console.error('Erreur lors de la requête:', error);

            return { status: 500 };
        });

    return { status: 201 };
}


/**
 * Set the request data from the tokens.bak file.
 * @Note Helpful when the server is restarted.
 */
function setRequestData()
{
    if (fs.existsSync(path.join(__dirname, 'tokens.bak')))
    {
        try
        {
            requestData = JSON.parse(fs.readFileSync(path.join(__dirname, 'tokens.bak')));
        } catch (error)
        {
            console.log('No tokens.bak file found');
        }
    }
}

async function updateWithCredentials()
{
    console.log('Updating CSRF token with credentials');

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto("https://portail.henallux.be");

    let targetUrl = "https://auth.henallux.be/";

    await page.waitForFunction(
        `window.location.href.startsWith('${targetUrl}')`,
        { timeout: 3000 }
    );

    // simulate login
    await page.type('#usernameUserInput', atob(process.env.EMAIL), { delay: getRandomDelay(100, 200) });
    await page.type("#password", atob(process.env.PASSWORD), { delay: getRandomDelay(100, 200) });
    await page.click('[data-testid="login-page-continue-login-button"]', { delay: getRandomDelay(100, 200) });

    await page.waitForFunction(
        `window.location.href === '${henalluxUrl}'`,
        { timeout: 30000 }
    );

    const currentCookies = await browser.cookies();

    requestData.session = currentCookies.find(c => c.name === 'portail_session').value;
    requestData.xsrf = currentCookies.find(c => c.name === 'XSRF-TOKEN').value;

    await browser.close();
}

/**
  * Use to generate a random delay when simulating a user action in puppeteer browser (Avoid being flagged as a 'bot' by the server)
*/
function getRandomDelay(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
/**
 * Get promotions from the server.
 *if the promotion is already in the cache, return it (cache are updated every 1/2 hour).
 * if not, get it from the server and update the cache.
    */
async function getPromotions(items)
{
    // get the promotions json file
    const filePath = path.join(__dirname, 'promotions.json');
    if (!fs.existsSync(filePath))
    {
        fs.writeFileSync(filePath, JSON.stringify([]));
    }

    let promotions;
    try
    {
        promotions = JSON.parse(fs.readFileSync(filePath));
    }
    catch (error)
    {
        promotions = [];
    }

    let myEvents = [];

    for (const item of items)
    {
        const promotion = promotions.find(p => p.id === item);
        let events = null;

        if(promotion && new Date(promotion.lastUpdate).getTime() + 3600000 > new Date().getTime())
        {
            console.log('Promotion from cache');
            events = promotion.events;
        }
        else
        {
            const response = await sendRequest([item]);

            if(response.status === 200)
            {
                events = response.data['components'][0]['effects']['dispatches'][0]['params']['data'];
                if (promotions.filter || 1 === 1)
                {
                    promotions = promotions.filter(p => p.id !== item);
                    promotions.push({ id: item, lastUpdate: new Date().toISOString(), events: events });
                    fs.writeFileSync(filePath, JSON.stringify(promotions, null, 2));
                }


            }
            else
            {
                if(response.status === 520)
                {
                    return { status: 520 };
                }

                //console.error('Error :', response);
            }
        }

        myEvents.push(events);

    }

    return myEvents;
}

// Return true if we are in a local environment (.env URL must be configured)
function isLocal()
{
    return url.startsWith('http://localhost');
}

/**
 * Update the CSRF token using puppeteer.
 * @Note : We cannot update the CSRF token from the server because the server has no browser to simulate the actions.
 * @Note as far as i know, snapshot doesn't change, so we can keep the same snapshot for all requests. (can change in the future)
 * @todo : from local, update CSRF token on the server and make a command to simplify the process ==> npm run update-ehp

*/
async function updateCSRFToken()
{
    console.log('Updating CSRF token');

    if(!isLocal())
    {
        console.warn('Not in local environment. Will not update CSRF token.\nThis function must be called in local environment only.');
        return;
    }

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    let portail_token = requestData.session || '';
    let xsrf_token = requestData.xsrf || '';

    const cookies = [
        {
            name: 'portail_session',
            value: portail_token,
            domain: 'portail.henallux.be',
            path: '/',
            httpOnly: true,
            secure: true
        },
        {
            name: 'XSRF-TOKEN',
            value: xsrf_token,
            domain: 'portail.henallux.be',
            path: '/',
            httpOnly: true,
            secure: true
        }
    ];

    await browser.setCookie(...cookies);
    await page.goto(henalluxUrl);

    try {
        await page.waitForFunction(
            `window.location.href === '${henalluxUrl}'`,
            { timeout: 3000 }
        );
    } catch (error) {
        if (error.name === 'TimeoutError')
        {
            console.log('Connexion timeout. will try with credentials');
            await updateWithCredentials();
            await updateCSRFToken();
            await browser.close();
            return;
        } else {
            throw error;
        }
    }

    // log page cookies
    const currentCookies = await browser.cookies();

    // simulate a click to get a /livewire/update request
    await page.click('[wire\\:click="handle_click_promotion"]');

    let updateRequest = null;

    await page.waitForResponse(response => response.url().includes("update"))
        .then(async (response) =>
        {
            updateRequest = await response.request();
        });

    if (!updateRequest)
    {
        console.log("No requests captured. Cannot continue.");
        await browser.close();
        return;
    }

    const requestPostData = updateRequest.postData();

    requestData.session = currentCookies.find(c => c.name === 'portail_session').value;
    requestData.xsrf = currentCookies.find(c => c.name === 'XSRF-TOKEN').value;

    requestData.token = JSON.parse(requestPostData)._token;
    requestData.snapshot = JSON.parse(requestPostData).components[0].snapshot;

    fs.writeFileSync(path.join(__dirname, 'tokens.bak'), JSON.stringify(requestData, null, 2));

    await browser.close();
}