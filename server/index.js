const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post('/api/correct', async (req, res) => {
    const { text } = req.body;

    try {
        const response = await axios({
            method: 'POST',
            url: 'https://api.languagetoolplus.com/v2/check',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            data: new URLSearchParams({
                text,
                language: 'en-US'
            })
        });

        let correctedText = text;
        const matches = response.data.matches;

        matches.reverse().forEach(match => {
            if (match.replacements.length > 0) {
                const replacement = match.replacements[0].value;
                correctedText =
                    correctedText.slice(0, match.offset) +
                    replacement +
                    correctedText.slice(match.offset + match.length);
            }
        });

        res.json({ corrected: correctedText });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'LanguageTool failed' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
