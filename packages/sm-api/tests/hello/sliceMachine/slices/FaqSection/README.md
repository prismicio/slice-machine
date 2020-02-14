# FAQ Section

### Purpose of the component
Component with repeatable dropdown section for creating FAQ sections.
The accordion uses progressive enhancement as an approach to build the interactivity of the component.
This means that the accordion starts out as a non-interactive component, and then interactivity and appropriate styles are added to it when the JavaScript runs.

### Variations
1. Default
This default version on the component use the simple dropdowns to be used where and as you require.
2. Faq
This version is a more complete website section, including a title and description to create a a basic FAQ page.
3. With Image
Much like the full section but using the optional image for more destinct styling.

### Properties
```
| Property         | Type                 | Repeatable | Description                    | Required |
| ---------------- | -------------------- | -----------| ------------------------------ | -------- |
| eyebrow_headline | RichText \|\| String | false      | A short headline for the slice | true     |
| title            | RichText \|\| String | false      | A title for the slice          | true     |
| description      | RichText \|\| String | false      | A paragraph for the slice      | true     |
| optional_image   | Image    \|\| URL    | false      | An Icon image for the slice    | false    |
| title            | RichText \|\| String | true       | A title for the dropdowns      | true     |
| text             | RichText \|\| String | true       | A paragraph for the dropdowns  | true     |
