export const valid = {
  __pass: true,
  type: "GeoPoint",
  config: {
    label: "GeoPoint",
    placeholder: "GeoPoint string"
  }
}

export const wrongType = {
  __pass: false,
  type: "GeoPoint2",
  config: {
    label: "GeoPoint",
    placeholder: "GeoPoint string"
  }
}

export const noConfig = {
  __pass: false,
  type: "GeoPoint",
}

export const misplacedId = {
  ...valid,
  __pass: false,
  config: {
    ...valid.config,
    id: 'some-id'
  }
}