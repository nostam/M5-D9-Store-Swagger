const express = require("express");
const uniqid = require("uniqid");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { writeDB, readDB } = require("../../lib");
// const { join } = require("path");

router.get("/:cartID", async (req, res, next) => {
  try {
    const db = await readDB(__dirname, "carts.json");
    if (db.length > 0) {
      const cart = db.find((entry) => entry._id === req.params.cartID);
      if (Object.keys(cart).length > 0) {
        res.send(cart);
      } else {
        const e = new Error();
        e.message = "invalid user"; //users existence is hardcoded for now
        e.httpStatusCode = 404;
        next(e);
      }
    } else {
      const e = new Error();
      e.httpStatusCode = 404;
      next(e);
    }
  } catch (error) {
    next(error);
  }
});

router.post("/:cartID/add-to-cart/:productID", async (req, res, next) => {
  try {
    const db = await readDB(__dirname, "carts.json");
    const cart = db.find((entry) => entry._id === req.params.cartID);
    const cartIndex = db.findIndex((entry) => entry._id === req.params.cartID);
    if (cartIndex !== -1) {
      const products = await readDB(__dirname, "../products/products.json");
      const product = products.find(
        (product) => product._id === req.params.productID
      );
      if (Object.keys(product).length < 0) {
        const e = new Error();
        e.message = "invalid product ID";
        e.httpStatusCode = 404;
        next(e);
      } else {
        const updatedCart = cart.products.push(product);
        updatedCart.total++;
        const updatedDB = [
          ...db.slice(0, cartIndex),
          { ...db[cartIndex], ...updatedCart },
          ...db.slice(cartIndex + 1),
        ];
        await writeDB(updatedDB, __dirname, "carts.json");
        res.status(201).send(updatedCart);
      }
    } else {
      const e = new Error();
      e.message = "invalid user";
      e.httpStatusCode = 404;
      next(e);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.delete(
  "/:cartID/remove-from-cart/:productID",
  async (req, res, next) => {
    try {
      const db = await readDB(__dirname, "carts.json");
      const cart = db.find((entry) => entry._id === req.params.cartID);
      const cartIndex = db.findIndex(
        (entry) => entry._id === req.params.cartID
      );
      if (cartIndex !== -1) {
        const products = await readDB(__dirname, "../products/products.json");
        const product = products.find(
          (product) => product._id === req.params.productID
        );
        if (Object.keys(product).length < 0) {
          const e = new Error();
          e.message = "invalid product ID";
          e.httpStatusCode = 404;
          next(e);
        } else {
          const updatedCart = cart.products.filter(
            (product) => product._id !== req.params.productID
          );
          updatedCart.total--;
          const updatedDB = [
            ...db.slice(0, cartIndex),
            { ...db[cartIndex], ...updatedCart },
            ...db.slice(cartIndex + 1),
          ];
          await writeDB(updatedDB, __dirname, "carts.json");
          res.status(200).send(updatedCart);
        }
      } else {
        const e = new Error();
        e.message = "invalid user";
        e.httpStatusCode = 404;
        next(e);
      }
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;