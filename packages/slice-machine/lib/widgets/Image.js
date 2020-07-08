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

const _create = (src, { width= 900, height= 500 } = { width: 900, height: 500 }, thumbnails = []) => ({
  dimensions: { width, height },
  alt: 'Placeholder image',
  copyright: null,
  url: src || `https://via.placeholder.com/${width}x${height}`,
  ...thumbnails.reduce((acc, e) => ({
    ...acc,
    [e.name]: _create(src, { width: e.width, height: e.height })
  }), [])
})

const defaultValue = _create()

const fromUser = (...args) =>
  typeof mock === 'object' ?
  mock :
  _create(...args)

const create = (maybeMock, model) => maybeMock ? fromUser(mock) : _create(null, model.constraint, model.thumbnails)

export default {
  create,
  defaultValue,
  fromUser
}
