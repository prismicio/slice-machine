const Pre = {
  "repeatable": false,
  "title": "HelloTab",
  "tabs": {
    "MyTab": {
      "myGroup": {
        "type": "Group",
        "fields": {
          "boolean": {
            "type": "Boolean",
            "config": {
              "label": "My label"
            }
          }
        }
      },
      "mySliceZone": {
        "type": "Slices",
        "config": {
          "choices": {
            "my_slice": {
              "type": "SharedSlice"
            }
          }
        }
      }
    }
  }
}

const Post = {
  repeatable: false,
  title: "HelloTab",
  tabs: [{
    key: "MyTab",
    value: [{
      key: "myGroup",
      type: "Group",
      value: [{
        key: "boolean",
        value: {
          "type": "Boolean",
          "config": {
            "label": "My label"
          }
        }
      }]
    }],
    sliceZone: {
      slices: [{
        key: "my_slice",
        value: {
          type: "SharedSlice"
        }
      }]
    }
  }],
}