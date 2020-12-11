const { writeJson, readJson } = require("fs-extra");
const { join } = require("path");

async function readDB(dir, file) {
  try {
    const fileJson = await readJson(join(dir, file));
    return fileJson;
  } catch (error) {
    throw new Error(error);
  }
}
async function writeDB(newDB, dir, file) {
  try {
    await writeJson(join(dir, file), newDB);
  } catch (error) {
    throw new Error(error);
  }
}

module.exports = { readDB, writeDB };
