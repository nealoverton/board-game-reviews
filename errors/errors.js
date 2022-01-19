exports.handleInvalidUrl = (req, res) => {
  res.status(404).send({ msg: "Invalid URL" });
};

exports.handleInvalidMethod = (req, res) => {
  res.status(405).send({ msg: "Method not allowed" });
};

exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code === "22P02" || err.code === "42703" || err.code === "23503") {
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
