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

        if (line.startsWith('||') && line.endsWith('^') && !line.includes('*') && !line.includes('/')) {
            domains.add(line.slice(2, -1));
        }
        if (line.startsWith('##') && !line.includes(':upward') && !line.includes(':xpath')) {
            cssRules.add(line.slice(2));
        }
    }

    // Create an output folder
    if (!fs.existsSync('./public')) fs.mkdirSync('./public');

    fs.writeFileSync('./public/ubo-domains.json', JSON.stringify(Array.from(domains)));

    const cssString = `<style id="ubo-proxy-css">${Array.from(cssRules).join(', ')} { display: none !important; visibility: hidden !important; height: 0 !important; }</style>`;
    fs.writeFileSync('./public/ubo-cosmetic.txt', cssString);

    console.log('Build complete! Files saved in /public');
}

compile();