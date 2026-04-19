const axios = require('axios');
const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, 'normal_indian_child_names.json');
const OUTPUT_FILE = path.join(__dirname, 'indian_child_names.json');
const API_URL = 'https://miniphinzi.vercel.app/api/convert';
const CONCURRENCY = 5;

function loadNames() {
    const raw = fs.readFileSync(INPUT_FILE, 'utf8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
        throw new Error('Input file must contain an array of names.');
    }

    return parsed
        .filter((name) => typeof name === 'string')
        .map((name) => name.trim())
        .filter(Boolean);
}

async function fetchNameData(name) {
    const response = await axios.get(API_URL, {
        params: { name },
        timeout: 30000,
    });

    return response.data;
}

async function processBatch(names, allData, startIndex) {
    await Promise.all(
        names.map(async (name, index) => {
            const currentIndex = startIndex + index + 1;

            try {
                const data = await fetchNameData(name);
                allData.push(data);
                console.log(`[${currentIndex}] Fetched ${name}`);
            } catch (error) {
                console.error(`[${currentIndex}] Error fetching ${name}: ${error.message}`);
            }
        })
    );
}

async function scrapeNames() {
    const names = loadNames();
    const allData = [];

    for (let index = 0; index < names.length; index += CONCURRENCY) {
        const batch = names.slice(index, index + CONCURRENCY);
        await processBatch(batch, allData, index);
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allData, null, 2));
    console.log(`Data saved to ${OUTPUT_FILE}`);
}

scrapeNames().catch((error) => {
    console.error('Scrape failed:', error.message);
    process.exitCode = 1;
});
