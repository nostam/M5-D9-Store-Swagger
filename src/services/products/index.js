const express = require("express");
const { writeFile, createReadStream } = require("fs-extra");
const multer = require("multer");
// const { pipeline } = require("stream");
const { readDB, writeDB } = require("../../lib/utilities");
const path = require("path");
const uniqid = require("uniqid");
const { check, validationResult } = require("express-validator");
const router = express.Router();

const upload = multer({});

const productsImagePath = path.join(__dirname, "../../../public/img/products");
const productFilePath = path.join(__dirname, "products.json"); //GETTING FILEPATH TO JSON

router.get("/", async (req, res, next) => {
  try {
    const productDataBase = await readDB(productFilePath); //RUNS FUNCTION TO GET DATABASE
    if (productDataBase.length > 0) {
      res.status(201).send(productDataBase); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    } else {
      const err = {};
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (err) {
    err.httpStatusCode = 404;
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const productDataBase = await readDB(productFilePath); //RUNS FUNCTION TO GET DATABASE
    const singleProduct = productDataBase.filter(
      product => product._id === req.params.id
    );
    if (singleProduct.length > 0) {
      res.status(201).send(singleProduct); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    } else {
      const err = {};
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (err) {
    err.httpStatusCode = 404;
    next(err);
  }
});

router.post(
  "/",
  [
    check("Name")
      .exists()
      .isLength({ min: 1 })
      .withMessage("Give it a name, you bitch"),
    check("Description")
      .exists()
      .isLength({ min: 1 })
      .withMessage("Gimmie a description man"),
    check("RepoURL")
      .exists()
      .isLength({ min: 1 })
      .withMessage("You have to give a URL for the product repository"),
    check("LiveURL")
      .exists()
      .isLength({ min: 1 })
      .withMessage("You need to have a live demo of your product"),
    check("StudentID")
      .exists()
      .isLength({ min: 1 })
      .withMessage("You need to have your Student ID"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = {};
      err.message = errors;
      err.httpStatusCode = 400;
      next(err);
    } else {
      const productDataBase = await readDB(productFilePath); //RUNS FUNCTION TO GET DATABASE
      const newProduct = req.body; //GETS THE REQUEST BODY
      newProduct._id = uniqid(); //GIVES BODY NEW ID
      newProduct.CreationDate = new Date(); //GIVES BODY CREATION DATE
      productDataBase.push(newProduct); //ADDS BODY TO DATABSE
      await writeDB(productFilePath, productDataBase); //OVERWRITES OLD DATABASE WITH NEW DATABASE
      res.status(201).send(productDataBase); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    }
  }
);

router.put(
  "/:id",
  [
    check("name")
      .exists()
      .isString()
      .isLength({ min: 1 })
      .withMessage("Give it a name, you bitch"),
    check("description")
      .exists()

      .isLength({ min: 1 })
      .withMessage("Gimmie a description man"),
    check("brand")
      .exists()
      .isLength({ min: 1 })
      .withMessage("You have to give a brand name"),
    check("imageUrl")
      .isURL()
      .exists()
      .isLength({ min: 1 })
      .withMessage("You need to have an image of your product"),
    check("price")
      .exists()
      .isNumeric()
      .isLength({ min: 1 })
      .withMessage("You need to have your Student ID"),
    check("category")
      .exists()
      .isString()
      .isLength({ min: 1 })
      .withMessage("You need to have your Student ID"),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        const err = new Error();
        err.message = errors;
        err.httpStatusCode = 400;
        next(err);
      }

      const productDataBase = await readDB(productFilePath); //RUNS FUNCTION TO GET DATABASE
      const singleProduct = productDataBase.filter(
        product => product._id === req.params.id
      );
      if (singleProduct.length > 0) {
        const filteredDB = productDataBase.filter(
          product => product._id !== req.params.id
        );
        console.log(singleProduct);
        const editedProduct = {
          // ...req.body,
          // ID: singleProduct[0].ID,
          // StudentID: singleProduct[0].StudentID,
          // CreationDate: singleProduct[0].CreationDate,
          // ModifiedDate: new Date(),

          ...req.body,
          updatedAt: new Date(),
        };
        filteredDB.push(editedProduct);
        await writeDB(productFilePath, filteredDB);
        res.status(201).send(filteredDB); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
      } else {
        const err = {};
        err.httpStatusCode = 404;
        next(err);
      }
    } catch (err) {
      err.httpStatusCode = 404;
      next(err);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const productDataBase = await readDB(productFilePath); //RUNS FUNCTION TO GET DATABASE
    const singleProduct = productDataBase.filter(
      product => product._id === req.params.id
    );
    if (singleProduct.length > 0) {
      const filteredDB = productDataBase.filter(
        product => product._id !== req.params.id
      );
      await writeDB(productFilePath, filteredDB);
      res.status(201).send(filteredDB); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    } else {
      const err = {};
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (err) {
    err.httpStatusCode = 404;
    next(err);
  }
});

router.post(
  "/:id/uploadPhoto",
  upload.single("productImg"),
  async (req, res, next) => {
    let nameArray = req.file.originalname.split(".");
    let fileType = "." + nameArray.pop();
    console.log(nameArray);
    console.log(fileType);
    try {
      await writeFile(
        path.join(productsImagePath, req.params.id + fileType),
        req.file.buffer
      );
      res.send("ok");
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

router.get("/:name/download", (req, res, next) => {
  const source = createReadStream(
    path.join(productsImagePath, `${req.params.name}`)
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${req.params.name}`
  );
  pipeline(source, res, error => next(error));
});

module.exports = router;
