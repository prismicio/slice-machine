function cors(asyncFn) {
  return (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return asyncFn(req, res);
  }
}

module.exports = cors;
