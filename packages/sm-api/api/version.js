const current = "0.0.15-alpha.4";
const deprecatedUnder = "0.0.14";


module.exports = (_, res) => {
  res.send({ current, deprecatedUnder });
};
