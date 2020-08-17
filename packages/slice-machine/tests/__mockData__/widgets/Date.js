export const valid = {
  __pass: true,
  type: "Date",
  config: {
    label: "Date",
    placeholder: "iso Date"
  }
}

export const wrongType = {
  __pass: false,
  type: "Date2",
  config: {
    label: "Date",
    placeholder: "iso Date"
  }
}

export const noConfig = {
  __pass: false,
  type: "Date",
}
