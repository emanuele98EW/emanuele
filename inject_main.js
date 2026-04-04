const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (!content.includes('main.js')) {
                // Calculate relative path to js folder
                const depth = fullPath.split(path.sep).length - __dirname.split(path.sep).length - 1;
                let prefix = '';
                for (let i = 0; i < depth; i++) {
                    prefix += '../';
                }
                const scriptTag = `\n<script src="${prefix}js/main.js"></script>\n`;
                
                content = content.replace('</body>', scriptTag + '</body>');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Injected main.js into ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'engineering'));
processDir(path.join(__dirname, 'finanza'));
console.log('Fatto!');
