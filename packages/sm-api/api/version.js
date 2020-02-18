const current = "0.0.14-alpha.54";
const deprecatedUnder = "0.0.14-alpha.54";


module.exports = (_, res) => {
  res.send({ current, deprecatedUnder });
};
