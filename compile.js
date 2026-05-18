const fs = require('fs');

async function compile() {
    console.log('Downloading uBO filters...');
    const response = await fetch('https://ublockorigin.github.io/uAssetsCDN/filters/filters.min.txt');
    const text = await response.text();

    const domains = new Set();
    const cssRules = new Set();

    for (let line of text.split('\n')) {
        line = line.trim();
        if (!line || line.startsWith('!')) continue;

        // FIX: Powerful Regex to capture domains with or without uBO modifiers ($3p, etc.)
        if (line.startsWith('||')) {
            const match = line.match(/^\|\|([a-z0-9.-]+)[\^/$]/i);
            if (match && match[1] && !match[1].includes('*')) {
                domains.add(match[1].toLowerCase());
            }
        }

        // Extract CSS
        if (line.startsWith('##') && !line.includes(':upward') && !line.includes(':xpath')) {
            cssRules.add(line.slice(2));
        }
    }

    if (!fs.existsSync('./public')) fs.mkdirSync('./public');

    const domainArray = Array.from(domains);
    fs.writeFileSync('./public/ubo-domains.json', JSON.stringify(domainArray));

    const cssString = `<style id="ubo-proxy-css">${Array.from(cssRules).join(', ')} { display: none !important; visibility: hidden !important; height: 0 !important; }</style>`;
    fs.writeFileSync('./public/ubo-cosmetic.txt', cssString);

    console.log(`Build complete! Extracted ${domainArray.length} domains.`);
}

compile();