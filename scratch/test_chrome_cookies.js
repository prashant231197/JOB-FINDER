const fs = require('fs');
const path = require('path');

const chromeUserData = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data');
console.log('Chrome User Data path exists:', fs.existsSync(chromeUserData));

const defaultCookies = path.join(chromeUserData, 'Default', 'Network', 'Cookies');
console.log('Default Network Cookies file exists:', fs.existsSync(defaultCookies));
