const fs = require("fs/promises");

exports.getEndpoints = async (req, res, next) => {
  try {
    const endpointsString = await fs.readFile("./endpoints.json", "utf-8");
    const endpoints = JSON.parse(endpointsString);
    res.status(200).send({ endpoints });
  } catch (err) {
    next(err);
  }
};
