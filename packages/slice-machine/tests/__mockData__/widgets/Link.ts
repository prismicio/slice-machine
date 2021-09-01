/**
* {
     "type": "Link",
    "config": {
      "label": "link",
      "placeholder": "Could be a link to use case, press article, signup...",
      "allowTargetBlank": true
    }
  }
 */

 /**
  *{
    "type": "Link",
    "config": {
      "select": "document",
      "customtypes": ["homepage"],
      "label": "contentrrrrr",
      "placeholder": "dsfdsfsdf"
    }
  }
  */

  /**{
    "type" : "Link",
    "config" : {
      "select" : "media",
      "label" : "tomedia",
      "placeholder" : "qsdqsdqsd"
    }
  } */


 /** should handle content relationship and media
  * 
  *{
    id: "Xt9fSxEAACIAFHz7"
    type: "homepage"
    tags: []
    slug: "homepage"
    lang: "en-us"
    link_type: "Document"
    isBroken: false
  }
  */
export const valid = {
  __pass: true,
  type: "Link",
  config: {
    label: "bool",
    placeholder: 'my placeholder',
    allowTargetBlank: true
  }
}

export const valid2 = {
  __pass: true,
  type: "Link",
  config: {
    label: "bool",
    placeholder: 'my placeholder',
    allowTargetBlank: false
  }
}

export const wrongAllow = {
  __pass: false,
  type: "Link",
  config: {
    label: "bool",
    placeholder: 'my placeholder',
    allowTargetBlank: 'false'
  }
}

export const selectMedia = {
  __pass: true,
  type: "Link",
  config: {
    select: 'media',
  }
}

export const wrongMedia = {
  __pass: false,
  type: "Link",
  config: {
    select: 'wrong-media',
  }
}

export const emptycts = {
  __pass: true,
  type: "Link",
  config: {
    select: 'document',
    label: "bool",
    customtypes: []
  }
}

export const nocts = {
  __pass: true,
  type: "Link",
  config: {
    select: 'document',
    label: "bool",
  }
}

export const ctsNotStrings = {
  __pass: false,
  type: "Link",
  config: {
    select: 'document',
    label: "bool",
    customtypes: [1]
  }
}

export const selectNotDoc = {
  __pass: false,
  type: "Link",
  config: {
    select: 'document2',
    label: "bool",
    customtypes: ['1']
  }
}

/** Should this pass? */
export const noLabel = {
  __pass: true,
  type: "Link",
  config: {
    select: 'document',
    customtypes: ['1']
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