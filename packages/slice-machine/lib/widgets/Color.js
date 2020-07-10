/**{
  "type" : "Color",
  "config" : {
    "label" : "color"
  }
} */

const createMock = (maybeMock) => maybeMock || `#${Math.floor(Math.random()*16777215).toString(16)}`

export default {
  createMock
}