const express = require("express");
const uniqid = require("uniqid");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { writeDB, readDB } = require("../../lib");
// const { writeFile } = require("fs-extra");
const { join } = require("path");
// const { pipeline } = require("stream");
// const zlib = require("zlib");
// const multer = require("multer");

// const upload = multer({});
// const reviewsImgDir = join(__dirname, "../../../public/img/reviews");

const reviewsJson = join(__dirname, "reviews.json");
const productsJson = join(__dirname, "../products/products.json");
const validationRules = [
  body("comment").isString().ltrim(),
  body("rate")
    .isFloat({ min: 0, max: 5 })
    .withMessage("Rating must be a number between 0 and 5")
    .exists(),
  body("elementID")
    .isString()
    .isAlphanumeric()
    .withMessage("invalid element ID")
    .exists(),
];

router.get("/", async (req, res, next) => {
  try {
    const db = await readDB(reviewsJson);
    if (db.length > 0) {
      res.send(db);
    } else {
      const e = new Error();
      e.httpStatusCode = 404;
      next(e);
    }
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const db = await readDB(reviewsJson);
    const entry = db.find((entry) => entry._id === req.params.id.toString());
    if (entry) {
      res.send(entry);
    } else {
      const error = new Error();
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

router.post("/", validationRules, async (req, res, next) => {
  try {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      const e = new Error();
      e.message = err.array();
      e.httpStatusCode = 400;
      next(e);
    } else {
      const db = await readDB(reviewsJson);
      const newEntry = {
        ...req.body,
        createdAt: new Date(),
      };
      newEntry._id = uniqid("r");
      const products = await readDB(productsJson);
      const product = products.find(
        (product) => product._id === req.body.elementID
      );
      if (
        Object.keys(product).length > 0 &&
        product.hasOwnProperty("numberOfReviews")
      ) {
        product.numberOfReviews++;
      } else {
        product.numberOfReviews = 1;
      }
      db.push(newEntry);
      await writeDB(db, reviewsJson);
      products
        .filter((product) => product._id !== req.body.elementID)
        .push(product);
      await writeDB(products, productsJson);
      res.status(201).send({ _id: newEntry._id });
    }
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  console.log(req);
  try {
    const db = await readDB(reviewsJson);
    const newDb = db.filter((entry) => entry._id !== req.params.id.toString());
    await writeDB(newDb, reviewsJson);

    const products = await readDB(productsJson);
    const product = products.find(
      (product) => product._id === req.body.elementID
    );
    if (
      Object.keys(product).length > 0 &&
      product.hasOwnProperty("numberOfReviews")
    ) {
      product.numberOfReviews--;
    } else {
      product.numberOfReviews = 0;
    }
    products
      .filter((product) => product._id !== req.body.elementID)
      .push(product);
    await writeDB(products, productsJson);
    res.status(202).send();
  } catch (error) {
    next(error);
  }
});

router.put("/:id", validationRules, async (req, res, next) => {
  try {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      const e = new Error();
      e.message = { errors: err.array() };
      e.httpStatusCode = 400;
      next(e);
    } else {
      const db = await readDB(reviewsJson);
      const newEntry = { ...req.body, updatedAt: new Date() };
      const newDB = db.filter((entry) => entry._id !== req.params.id);
      newDB.push(newEntry);
      await writeDB(newDB, reviewsJson);
      res.status(200).send({ _id: newEntry._id });
    }
  } catch (error) {
    console.log(err, e);
    next(error);
  }
});

module.exports = router;
