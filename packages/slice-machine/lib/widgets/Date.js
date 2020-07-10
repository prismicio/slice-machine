import Timestamp from './Timestamp'

/** {
  "type" : "Date",
  "config" : {
    "label" : "dateee",
    "placeholder" : "qsdqsd"
  }
} */

const createMock = (maybeMock) => maybeMock || Timestamp.createMock().toISOString().split('T')[0] // ?

export default {
  createMock
}