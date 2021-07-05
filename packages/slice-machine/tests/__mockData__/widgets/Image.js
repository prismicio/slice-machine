/** 
 * {
    "type": "Image",
    "config": {
      "constraint": {
        "width": 100,
        "height": 100
      },
      "thumbnails": [
        {
          "name": "square",
          "width": 500,
          "height": 500
        }
      ],
      "label": "Icon Image"
    }
  } */

export const valid = {
  __pass: true,
  type: "Image",
  config: {
    constraint: {
      width: 100,
      height: 100
    },
    thumbnails: [{
      name: 'square',
      width: 500,
      height: 500
    }],
    label: 'Icon Image'
  }
}

export const emptyConstraint = {
  __pass: true,
  type: "Image",
  config: {
    constraint: {},
    thumbnails: [],
    label: 'Icon Image'
  }
}

export const noThumbnails = {
  __pass: false,
  type: "Image",
  config: {
    constraint: {},
    label: 'Icon Image'
  }
}
export const labelTooLong = {
  __pass: false,
  type: "Image",
  config: {
    constraint: { height: 300, width: 400 },
    thumbnails: [],
    label: "Label should be less than 35 characters long. Which is pretty long already."
  }
}

export const wrongType = {
  __pass: false,
  type: "Image",
  config: {
    constraint: { height: "str", width: "ing" },
    thumbnails: [],
    label: "Label should be less than 35 characters long. Which is pretty long already."
  }
}

export const wrongType2 = {
  __pass: false,
  type: "Image",
  config: {
    constraint: { height: 300, width: 400 },
    thumbnails: [{
      name: 'square',
      width: "str",
      height: "ing"
    }],
    label: "Label should be less than 35"
  }
}

export const noName = {
  __pass: false,
  type: "Image",
  config: {
    constraint: {
      height: 300,
      width: 400
    },
    thumbnails: [{
      width: 500,
      height: 500
    }],
    label: "Label should be less than 35"
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