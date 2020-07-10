/**{
                "type" : "Number",
                "config" : {
                  "label" : "number",
                  "placeholder" : "ddd"
                }
              } */

const createMock = (maybeMock) => maybeMock || Math.floor(Math.random() * 9999)

export default {
  createMock
}