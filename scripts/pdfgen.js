const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const process = require('process')
const path = require('path')

async function getAstroConfig() {
    const configPath = path.resolve(process.cwd(), 'astro.config.mjs');
    try {
        // Ensure the import path is a file URL
        const fileUrlConfigPath = `file://${configPath.startsWith('/') ? '' : '/'}${configPath.replace(/\\/g, '/')}`;
        const { default: astroConfig } = await import(fileUrlConfigPath);
        return {
            base: astroConfig.base || '/',
            port: astroConfig.server?.port || 3000 
        };
    } catch (e) {
        console.warn(`Could not load astro.config.mjs. Using default base '/' and port 3000. Error: ${e.message}`);
        return { base: '/', port: 3000 };
    }
}

async function pdf(url) {
    const browser = await puppeteer.launch({ headless: 'new' })
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle0' })
    const pdfData = await page.pdf({
        format: 'letter',
        printBackground: true
    })
    await browser.close()
    return pdfData
}

async function go() {
    const { base, port } = await getAstroConfig();

    let normalizedBase = base;
    if (normalizedBase !== '/') {
        if (!normalizedBase.startsWith('/')) {
            normalizedBase = '/' + normalizedBase;
        }
        if (!normalizedBase.endsWith('/')) {
            normalizedBase += '/';
        }
    }
    
    const targetUrl = `http://127.0.0.1:${port}${normalizedBase}editions/one-pager`;
    console.log(`Generating PDF from URL: ${targetUrl}`);
    await fs.writeFile('public/editions/printable.pdf', await pdf(targetUrl));
}

go().then(() => {
    console.log('Done!')
    process.exit(0)
}).catch(error => {
    console.error(error)
    process.exit(1)
})