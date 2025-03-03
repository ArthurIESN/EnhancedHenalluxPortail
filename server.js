const express = require('express');
const axios = require('axios');
const app = express();
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const puppeteer = require("puppeteer");

dotenv.config();

let requestData =
{
    "xsrf" : null,
    "session" : null,
    "token" : null,
    "snapshot" : null,
}

async function updateCSRFToken()
{
    console.log('Updating CSRF token');
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
    await page.goto("https://portail.henallux.be");

    const targetUrl = "https://portail.henallux.be/";

    try {
        await page.waitForFunction(
            `window.location.href === '${targetUrl}'`,
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

    await page.type('#usernameUserInput', atob(process.env.EMAIL), { delay: getRandomDelay(100, 200) });

    await page.type("#password", atob(process.env.PASSWORD), { delay: getRandomDelay(100, 200) });

    // click on data-testid="login-page-continue-login-button"
    await page.click('[data-testid="login-page-continue-login-button"]', { delay: getRandomDelay(100, 200) });

    targetUrl = "https://portail.henallux.be/";

    await page.waitForFunction(
        `window.location.href === '${targetUrl}'`,
        { timeout: 30000 }
    );

    const currentCookies = await browser.cookies();

    requestData.session = currentCookies.find(c => c.name === 'portail_session').value;
    requestData.xsrf = currentCookies.find(c => c.name === 'XSRF-TOKEN').value;

    await browser.close();
}

function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getPromotions(items)
{
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
            let response = await sendRequest([item]);

            let data = response['components'][0]['effects']['dispatches'][0]['params']['data'];

            promotions = promotions.filter(p => p.id !== item);

            promotions.push({ id: item, lastUpdate: new Date().toISOString(), events: data });
            fs.writeFileSync(filePath, JSON.stringify(promotions, null, 2));

            events = data;
        }

        myEvents.push(events);

    }

    return myEvents;
}


const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const cors = require('cors');

app.use(cors({
    origin: '*',
    methods: ['POST'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept-Language'],
}));

app.use(express.json());


// Middleware : check if the request is a POST request
app.use((req, res, next) => {
    if (req.method !== 'POST')
    {
        return res.status(405).json({ message: `HTTP Method ${req.method} is not allowed` });
    }
    next();
});

app.post("/api/planning", async (req, res) => {
    //const { promotions } = req.body; // Récupère les promotions du corps de la requête
    let items = req.body;

    let response = await getPromotions(items);

    res.json(response);
});

async function sendRequest(items, times = 0)
{
    if (times > 3)
    {
        console.error('Error: Too many attempts');
        return null;
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

   let data = null;

    await axios.post("https://portail.henallux.be/livewire/update", payload, {
        headers: headers
    })
        .then(async response =>
        {
            if (response.status === 200)
            {
                data = response.data;
            }
            else
            {
                console.error('Error ', response.status, " : Unexpected error");
            }
        })
        .catch(async error => {
            if (error.response && error.response.status === 419)
            {
                console.error('Error 419: Trying to get a new crsf token');
                await updateCSRFToken();
                await sendRequest(items, times + 1);
            } else {
                console.error('Error:', error);
                return "Error";
            }
        });

    return data;
}

app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).send('Bad request');
});

app.listen(PORT, async () =>
{
    console.log('Serveur proxy en cours d\'exécution sur ' + PORT);

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
});
