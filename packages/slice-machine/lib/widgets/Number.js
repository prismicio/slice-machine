/**{
                "type" : "Number",
                "config" : {
                  "label" : "number",
                  "placeholder" : "ddd"
                }
              } */

const create = (maybeMock) => maybeMock || Math.floor(Math.random() * 9999)

export default {
  create
}