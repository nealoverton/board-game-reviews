exports.handleInvalidUrl = (req, res) => {
  res.status(404).send({ msg: "Invalid URL" });
};

exports.handleInvalidMethod = (req, res) => {
  res.status(405).send({ msg: "Method not allowed" });
};

exports.handlePsqlErrors = (err, req, res, next) => {
  const sqlErrorCodes = [
    "42601",
    "42703",
    "23503",
    "22P02",
    "2201X",
    "23502",
    "23505",
  ];
  if (sqlErrorCodes.includes(err.code)) {
    res.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
};

exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.handleServerErrors = (err, req, res, next) => {
  console.log(err.code);
  res.status(500).send({ msg: "Internal server error" });
};
