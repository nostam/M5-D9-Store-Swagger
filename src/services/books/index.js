const express = require("express");
const uniqid = require("uniqid");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { writeDB, readDB, err } = require("../../lib");
const { join } = require("path");

const booksJson = join(__dirname, "books.json");
const commentsJson = join(__dirname, "comments.json");
const validationRules = [
  body("asin").isInt().notEmpty(),
  body("text").exists().isString().notEmpty(),
  body("username").notEmpty().isAlphanumeric(),
];

router.get("/", async (req, res, next) => {
  try {
    const books = await readDB(booksJson);
    res.send(books);
  } catch (error) {
    next(error);
  }
});

router.get("/:asin", async (req, res, next) => {
  try {
    const books = await readDB(booksJson);
    const book = books.find((entry) => entry.asin === req.params.asin);
    if (Object.keys(book).length > 0) {
      res.send(book);
    } else {
      err("invalid asin");
    }
  } catch (error) {
    next(error);
  }
});

router.get("/:asin/comments", async (req, res, next) => {
  try {
    const db = await readDB(commentsJson);
    const comments = db.filter((entry) => entry.asin === req.params.asin);
    if (Object.keys(comments).length > 0) {
      res.send(comments);
    } else {
      err("invalid asin");
    }
  } catch (error) {
    next(error);
  }
});

router.post("/:asin/comments", [validationRules], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      err(errors.array());
    } else {
      const db = await readDB(commentsJson);
      const newComment = { ...req.body, date: new Date(), commentID: uniqid() };
      await writeDB(db.push(newComment), commentsJson);
      res.status(201).send();
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete("/:asin/comments/:commentID", async (req, res, next) => {
  try {
    const db = await readDB(commentsJson);
    let commentIndex = db.findIndex(entry.asin === req.params.asin) !== -1;
    if (commentIndex !== -1) {
      const newDB = db.filter(entry.commentID !== req.params.commentID);
      await writeDB(newDB, commentsJson);
      res.status(201).send();
    } else {
      errMsg("invalid asin");
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
