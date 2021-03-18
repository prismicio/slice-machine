module.exports = {
  "presets": ["next/babel"],
  "plugins": [
    ["module-resolver", {
      "root": ["./"],
      "alias": {
        "src": "./src",
        "components": "./components",
        "lib": "./lib",
        "models": "./lib/models"
      }
    }]
  ]
}
