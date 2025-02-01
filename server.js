const express = require('express');
const axios = require('axios');
const app = express();

const baseUrl = 'https://portail.henallux.be/api/';
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

const cors = require('cors');

app.use(cors({
    origin: '*',
    methods: ['POST'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept-Language'],
}));

// Middleware : check if the request is a POST request
app.use((req, res, next) => {
    if (req.method !== 'POST')
    {
        return res.status(405).json({ message: `Méthode HTTP ${req.method} non autorisée` });
    }
    next();
});

// Middleware : check if the request has an Authorization header with a valid token
app.use((req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer '))
    {
        const token = authHeader.substring(7);
        req.token = token;
        next();
    } else
    {
        console.log('Aucun token ou token invalide ', authHeader);
        res.status(401).json({ message: 'Token manquant ou invalide', code: 401 });
    }
});

app.post('/api/:endpoint', async (req, res) =>
{
    const { token } = req;
    const url = `${baseUrl}${req.params.endpoint}`;

    if (!token)
    {
        return res.status(401).json({ message: 'Token JWT requis' });
    }

    sendRequest(url, token, res);
});

app.post('/api/classes/:endpoint', async (req, res) =>
{
    const { token } = req;
    const url = `${baseUrl}classes/${req.params.endpoint}`;

    if (!token)
    {
        return res.status(401).json({ message: 'Token JWT requis' });
    }

    sendRequest(url, token, res);
});

app.post('/api/plannings/promotion/:endpoint', async (req, res) => {
    const { token } = req;
    const url = `${baseUrl}plannings/promotion/${req.params.endpoint}`;

    if (!token)
    {
        return res.status(401).json({ message: 'Token JWT requis' });
    }

    sendRequest(url, token, res);
});

function sendRequest(url, token, res)
{
    axios.get(url, {
        headers:
            {
                Authorization: `Bearer ${token}`,
                'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            },
    })
        .then(response =>
        {
            console.log("Data received from " + url);
            res.json(response.data);
        })
        .catch(error =>
        {
            console.error(`(${url})Erreur dans le proxy:`, error.message);  // Affiche l'erreur dans la console
            res.status(500).json({ message: 'Erreur dans le proxy', error: error.message, code: 500 });
        });
}


app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err.stack);  // Affiche l'erreur complète dans la console
    res.status(500).send('Quelque chose a mal tourné!');
});

app.listen(PORT, () =>
{
    console.log('Serveur proxy en cours d\'exécution sur ' + PORT);
});
