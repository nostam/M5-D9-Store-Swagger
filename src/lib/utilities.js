const { writeJson, readJson } = require("fs-extra");
const readDB = async filepath => {
  try {
    const fileJson = await readJson(filepath);
    return fileJson;
  } catch (error) {
    throw new Error(error);
  }
};

const writeDB = async (filepath, data) => {
  try {
    await writeJson(filepath, data);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  readDB,
  writeDB,
};
