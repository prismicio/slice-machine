/**
 *{
   "type": "Select",
   "config": {
     "label": "Image side",
     "default_value": "left",
     "options": ["left", "right"]
   }
 }
 */

export const valid = {
  __pass: true,
  type: "Select",
  config: {
    label: "Image side",
    default_value: "left",
    options: ["left", "right"]
  }
}

export const wrongType = {
  __pass: false,
  type: "Select2",
  config: {
    label: "Image side",
    default_value: "left",
    options: ["left", "right"]
  }
}

export const noOptions = {
  __pass: false,
  type: "Select",
  config: {
    label: "Image side",
    default_value: "left"
  }
}

export const emptyOptions = {
  __pass: false,
  type: "Select",
  config: {
    label: "Image side",
    options: []
  }
}

export const wrongDefaultValue = {
  __pass: false,
  type: "Select",
  config: {
    label: "Image side",
    default_value: "right",
    options: ["left", "lefty", "left-right"]
  }
}

export const misplacedId = {
  ...valid,
  __pass: false,
  config: {
    ...valid.config,
    id: 'some-id'
  }
}