module.exports = {
  "presets": ["next/babel"],
  "plugins": [
    ["module-resolver", {
      "root": ["./"],
      "alias": {
        "@": "./",
        "@lib": "lib",
        "@utils": "lib/utils",
        "@builders": "lib/builders",
        "@models": "lib/models",
        "@src": "src",
        "@hooks": "hooks",
        "@components": "components"
      }
    }]
  ]
}