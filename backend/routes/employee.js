import express from "express";
import { executeQuery } from "../mysqlConnection.js";

const router = express.Router();

// // middleware that is specific to this router
// const timeLog = (req, res, next) => {
//   console.log('Time: ', Date.now())
//   next()
// }
// router.use(timeLog)

router.get("/error", async (req, res, next) => {
  try {
    throw new Error("Employee table error!");
  } catch (error) {
    next(error);
  }
});

router.get("/all", async (req, res, next) => {
  try {
    let [results, fields] = await executeQuery("SELECT * FROM `Employee`");
    console.log(results);
    res.json({ results });
  } catch (error) {
    next(error);
  }
});

export default router;
