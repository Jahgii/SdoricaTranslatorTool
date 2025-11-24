const fs = require('node:fs');
const path = require('node:path');

const ICON_REGEXES = [
    // matches iconStart/iconEnd with optional @tui.
    /(?:\[?icon(?:Start|End)\]?=)["'](?:'|")?(?:@tui\.)?([a-zA-Z0-9-]+)(?:'|")?["']/g,
    // matches icon
    /(?:\[?icon\]?=)["'](?:@tui\.)?([a-zA-Z0-9-]+)["']/g,
    // matches tui-icon background
    /<tui-icon\b[^>]*?\[background\]=["'](?:'|")?(?:@tui\.)?([a-zA-Z0-9-]+)(?:'|")?["']/g,
    // matches all @tui.
    /@tui\.([a-zA-Z0-9-]+)/g
];

const htmlDir = path.join(__dirname, 'src');
const iconSrcDir = path.join(__dirname, 'node_modules/@taiga-ui/icons/src');
const iconDestDir = path.join(__dirname, 'src/assets/taiga-ui/icons/');

const icons = new Set();

function scanDir(dir) {
    for (const file of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
    
        if (stat.isDirectory()) scanDir(fullPath);
        else if (file.endsWith('.html')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            for (const regex of ICON_REGEXES) {
                let match;
                while ((match = regex.exec(content)) !== null) {
                const icon = match[1] || match[0];
                icons.add(icon);
                }
            }
        }    
    }

}

function copyIcons() {
    if (!fs.existsSync(iconDestDir)) {
        fs.mkdirSync(iconDestDir, { recursive: true });
    }

    for (const icon of icons) {
        const filename = `${icon}.svg`;
        const src = path.join(iconSrcDir, filename);
        const dest = path.join(iconDestDir, filename);
    
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            console.log(`✓ Copied ${filename}`);
        } else {
            console.warn(`⚠️ Icon not found: ${filename}`);
        }    
    }
}

function addRequiredIcons() {
    icons.add("check");
    icons.add("eye");
    icons.add("eye-off");
    icons.add("chevron-down");
    icons.add("languages");
    icons.add("minus");
    icons.add("triangle-alert");
    icons.add("circle-check-big");
}

scanDir(htmlDir);
addRequiredIcons();
copyIcons();