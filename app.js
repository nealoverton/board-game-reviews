const express = require("express");
const cors = require("cors");

const {
  handleInvalidUrl,
  handlePsqlErrors,
  handleCustomErrors,
  handleServerErrors,
} = require("./errors/errors.js");

const apiRouter = require("./routers/api-router");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.all("*", handleInvalidUrl);

app.use(handlePsqlErrors);
app.use(handleCustomErrors);
app.use(handleServerErrors);

module.exports = app;
