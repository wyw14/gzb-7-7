const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getDataPath(filename) {
  ensureDataDir();
  return path.join(DATA_DIR, filename);
}

function readJSON(filename, defaultValue) {
  const filePath = getDataPath(filename);
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error(`读取 ${filename} 失败:`, e);
    return defaultValue;
  }
}

function writeJSON(filename, data) {
  const filePath = getDataPath(filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  readJSON,
  writeJSON,
  getDataPath
};
