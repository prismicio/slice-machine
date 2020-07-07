/**{
  "type" : "Color",
  "config" : {
    "label" : "color"
  }
} */

const create = (maybeMock) => maybeMock || `#${Math.floor(Math.random()*16777215).toString(16)}`



export default {
  create
}