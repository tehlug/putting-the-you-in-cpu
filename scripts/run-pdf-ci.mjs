import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

async function run() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const projectRoot = path.resolve(__dirname, '..');
    const configPath = path.resolve(projectRoot, 'astro.config.mjs');

    let port = 3000; // Default port
    let base = '/';  // Default base

    try {
        // Ensure the import path is a file URL
        const fileUrlConfigPath = `file://${configPath.startsWith('/') ? '' : '/'}${configPath.replace(/\\/g, '/')}`;
        const { default: astroConfig } = await import(fileUrlConfigPath);
        if (astroConfig) {
            base = astroConfig.base || '/';
            // astro.config.mjs server.port is already parsed
            port = astroConfig.server?.port || port;
        }
    } catch (e) {
        console.warn(`Could not load astro.config.mjs to determine base path and port. Using defaults. Error: ${e.message}`);
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

    const pollUrl = `http://127.0.0.1:${port}${normalizedBase}editions/one-pager`;
    const serverCommand = `astro preview --port ${port}`;
    const testCommand = "npm run generate-pdf:local"; // This runs the modified pdfgen.js

    const command = `start-server-and-test "${serverCommand}" "${pollUrl}" "${testCommand}"`;

    try {
        console.log(`Executing CI PDF generation: ${command}`);
        execSync(command, { stdio: 'inherit', cwd: projectRoot });
    } catch (error) {
        console.error('Failed to execute PDF generation for CI:', error);
        process.exit(1);
    }
}

run();
