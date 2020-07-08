import Timestamp from './Timestamp'

/** {
  "type" : "Date",
  "config" : {
    "label" : "dateee",
    "placeholder" : "qsdqsd"
  }
} */

const create = (maybeMock) => maybeMock || Timestamp.create().toISOString().split('T')[0] // ?

export default {
  create
}