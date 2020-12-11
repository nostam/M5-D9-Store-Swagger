const express = require("express");
const { writeFile, createReadStream } = require("fs-extra");
const multer = require("multer");
// const { pipeline } = require("stream");
// const { readDB, writeDB } = require("../../lib/utilities");
const { readDB, writeDB } = require("../../lib");
const path = require("path");
const uniqid = require("uniqid");
const { check, validationResult } = require("express-validator");
const router = express.Router();

const upload = multer({});

const productsImagePath = path.join(__dirname, "../../../public/img/products");
// const productFilePath = path.join(__dirname, "products.json"); //GETTING FILEPATH TO JSON

router.get("/", async (req, res, next) => {
  try {
    const productDataBase = await readDB(__dirname, "products.json"); //RUNS FUNCTION TO GET DATABASE
    if (productDataBase.length > 0) {
      res.status(200).send(productDataBase); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (err) {
    // err.httpStatusCode = 404;
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const productDataBase = await readDB(__dirname, "products.json"); //RUNS FUNCTION TO GET DATABASE
    const singleProduct = productDataBase.find(
      (product) => product._id === req.params.id
    );
    if (Object.keys(singleProduct).length > 0) {
      res.status(200).send(singleProduct); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
    } else {
      const err = new Error();
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (err) {
    // err.httpStatusCode = 404;
    next(err);
  }
});

router.post(
  "/",
  [
    check("name").exists().isLength({ min: 1 }).withMessage("Invalid name"),
    check("description")
      .exists()
      .isString()
      .isLength({ min: 2 })
      .ltrim()
      .withMessage("Gimmie a description man"),
    check("brand")
      .exists()
      .isString()
      .isLength({ min: 2 })
      .withMessage("Invalid brand name"),
    check("imageUrl").exists().isURL().withMessage("Invalid image url"),
    check("price")
      .exists()
      .isInt()
      .isFloat({ min: 0 })
      .withMessage("Invalid price"),
    check("category")
      .isAlpha()
      .isLowercase()
      .isLength({ min: 2 })
      .withMessage("invalid categories")
      .exists(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const err = new Error();
        err.message = errors.array();
        err.httpStatusCode = 400;
        console.log(err.message);
        next(err);
      } else {
        const productDataBase = await readDB(__dirname, "products.json"); //RUNS FUNCTION TO GET DATABASE
        const newProduct = {
          ...req.body,
          _id: uniqid("p"),
          createdAt: new Date(),
        }; //GIVES BODY CREATION DATE
        productDataBase.push(newProduct); //ADDS BODY TO DATABSE
        await writeDB(productDataBase, __dirname, "products.json"); //OVERWRITES OLD DATABASE WITH NEW DATABASE
        res.status(201).send({ id: newProduct._id }); //SENDS RESPONSE WITH NEW PRODUCTS ID
      }
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  "/:id",
  [
    check("name").exists().isLength({ min: 1 }).withMessage("Invalid name"),
    check("description")
      .exists()
      .isString()
      .isLength({ min: 2 })
      .ltrim()
      .withMessage("Gimmie a description man"),
    check("brand")
      .exists()
      .isString()
      .isLength({ min: 2 })
      .withMessage("Invalid brand name"),
    check("imageUrl").exists().isURL().withMessage("Invalid image url"),
    check("price")
      .exists()
      .isInt()
      .isFloat({ min: 0 })
      .withMessage("Invalid price"),
    check("category")
      .isAlpha()
      .isLowercase()
      .isLength({ min: 2 })
      .withMessage("invalid categories")
      .exists(),
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

      const productDataBase = await readDB(__dirname, "products.json"); //RUNS FUNCTION TO GET DATABASE
      const singleProduct = productDataBase.find(
        (product) => product._id === req.params.id
      );
      if (Object.keys(singleProduct).length > 0) {
        const filteredDB = productDataBase.filter(
          (product) => product._id !== req.params.id
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
        await writeDB(filteredDB, __dirname, "products.json");
        res.status(201).send({ _id: editedProduct._id }); //SENDS RESPONSE WITH GOOD CODE AND WHOLE DATABSE
      } else {
        const err = new Error();
        err.httpStatusCode = 404;
        next(err);
      }
    } catch (err) {
      // err.httpStatusCode = 404;
      next(err);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const productDataBase = await readDB(__dirname, "products.json"); //RUNS FUNCTION TO GET DATABASE
    const singleProduct = productDataBase.filter(
      (product) => product._id === req.params.id
    );
    if (singleProduct.length > 0) {
      const filteredDB = productDataBase.filter(
        (product) => product._id !== req.params.id
      );
      await writeDB(filteredDB, __dirname, "products.json");
      res.status(204).send();
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
  "/:id/upload",
  upload.single("productImg"),
  async (req, res, next) => {
    try {
      const filenameArr = req.file.originalname.split(".");
      const filename =
        req.params.id + "." + filenameArr[filenameArr.length - 1];

      const db = await readDB(__dirname, "products.json");
      const product = db.find((entry) => (entry._id = req.params.id));
      const src = new URL(
        `https://${req.get("host")}/public/img/products/${filename}`
      ).href;
      if (Object.keys(product).length > 0) {
        await writeFile(join(productsImgDir, filename), req.file.buffer);
        const newEntry = { ...product, imageUrl: src, updateAt: newDate() };
        const newDB = db.filter((entry !== entry._id) !== req.params.id);
        newDB.push(newEntry);
        writeDB(newDB, __dirname, "products.json");
        res.status(201).send();
      } else {
        const err = new Error();
        err.message = "invalid ID";
        err.httpStatusCode = 404;
        next(err);
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// router.post(
//   "/:id/uploadPhoto",
//   upload.single("productImg"),
//   async (req, res, next) => {
//     let nameArray = req.file.originalname.split(".");
//     let fileType = "." + nameArray.pop();
//     console.log(nameArray);
//     console.log(fileType);
//     try {
//       await writeFile(
//         path.join(productsImagePath, req.params.id + fileType),
//         req.file.buffer
//       );
//       res.send("ok");
//     } catch (error) {
//       console.log(error);
//       next(error);
//     }
//   }
// );

// router.get("/:name/download", (req, res, next) => {
//   const source = createReadStream(
//     path.join(productsImagePath, `${req.params.name}`)
//   );
//   res.setHeader(
//     "Content-Disposition",
//     `attachment; filename=${req.params.name}`
//   );
//   pipeline(source, res, (error) => next(error));
// });

module.exports = router;
