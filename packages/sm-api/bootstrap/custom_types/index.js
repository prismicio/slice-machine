function customTypes(index, cts) {
  return index.map((ct) => {
    return {
      ...ct,
      value: cts[ct.id] ? cts[ct.id] : {}
    };
  });
};

module.exports = {
  landing: function() {
    const index = require("./landing/index.json")
    const cts = {
      page: require("./landing/page.json")
    };
    return {
      cts: customTypes(index, cts),
      toBeMerged: ['page'], // change this
      files: {
        'index.json': index,
        'page.json': cts.page
      }
    }
  }
}