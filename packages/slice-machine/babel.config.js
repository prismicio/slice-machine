module.exports = {
  "presets": ["next/babel"],
  "plugins": [
    ["module-resolver", {
      "root": ["./"],
      "alias": {
        "src": "./src",
        "components": "./components"
      }
    }],
    ["prismjs", {
      "languages": ["javascript", "css", "markup", 'jsx'],
      // "plugins": ["line-numbers"],
      // "theme": "twilight",
      // "css": true
  }]
  ]
} 
