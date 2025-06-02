import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

async function run() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const projectRoot = path.resolve(__dirname, '..');
    const configPath = path.resolve(projectRoot, 'astro.config.mjs');
    console.log(`Resolved astro.config.mjs path: ${configPath}`);

    let port = 3000; // Default port
    let base = '/';  // Default base

    try {
        const fileUrl = pathToFileURL(configPath); // Use pathToFileURL for robustness
        console.log(`Attempting to import astro.config.mjs from: ${fileUrl.href}`);
        const { default: astroConfig } = await import(fileUrl.href);
        if (astroConfig) {
            base = astroConfig.base || '/';
            // astro.config.mjs server.port might be a number or string, ensure it's used correctly
            port = astroConfig.server?.port || port;
            console.log(`Successfully loaded astro.config.mjs. Base: '${base}', Port: ${port}`);
        } else {
            console.warn('astro.config.mjs loaded but was empty or did not export a default. Using defaults.');
        }
    } catch (e) {
        console.warn(`Could not load astro.config.mjs. Using default base '/' and port ${port}.`);
        console.error(`Error details during astro.config.mjs load: ${e.message}`);
    }

    let normalizedBase = base;
    if (normalizedBase !== '/') {
        if (!normalizedBase.startsWith('/')) {
            normalizedBase = '/' + normalizedBase;
        }
        if (!normalizedBase.endsWith('/')) {
            normalizedBase += '/';
        }
    }

    console.log(`Normalized base for URL construction: '${normalizedBase}'`);
    
    // Poll the base URL of the application. This should be a reliable target.
    // Ensures normalizedBase (like '/' or '/path/') is correctly appended.
    const pollUrl = `http://127.0.0.1:${port}${normalizedBase}`;
    console.log(`Calculated pollUrl for start-server-and-test: ${pollUrl}`);

    const serverCommand = `astro preview --port ${port} --host`;
    const testCommand = "npm run generate-pdf:local"; // This runs scripts/pdfgen.js

    const command = `start-server-and-test "${serverCommand}" "${pollUrl}" "${testCommand}"`;
    console.log(`Executing command: ${command}`);

    try {
        execSync(command, { stdio: 'inherit', cwd: projectRoot });
    } catch (error) {
        console.error('Failed to execute start-server-and-test command:', error);
        process.exit(1);
    }
}

run();
