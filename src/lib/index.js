const { writeJson, readJson } = require("fs-extra");

async function readDB(filepath) {
  try {
    const fileJson = await readJson(filepath);
    return fileJson;
  } catch (error) {
    throw new Error(error);
  }
}
async function writeDB(newDB, filepath) {
  try {
    await writeJson(filepath, newDB);
  } catch (error) {
    throw new Error(error);
  }
}
const err = (msg) => {
  const e = new Error();
  e.message = msg;
  e.httpStatusCode = 404;
  return next(e);
};

const sortObject = async (obj) =>
  Object.keys(obj)
    .sort()
    .reduce((result, key) => ((result[key] = obj[key]), result), {});

module.exports = { readDB, writeDB, err };
