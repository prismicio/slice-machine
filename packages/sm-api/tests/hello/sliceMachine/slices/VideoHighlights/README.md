# Video Highlights Section

### Purpose of the component
This component allows you to easily add a list of videos, great for showcasing playlists or video courses.

### Variations
1. Default
This default version on the component is the only variation.
1. Dark
This variation allows you to enable a dark mode for the section

### Properties
```
| Property           | Type                 | Repeatable | Description                            | Required | Default          |
| ------------------ | -------------------- | -----------| -------------------------------------- | -------- | ---------------- |
| eyebrow_headline   | RichText \|\| String | false      | A short headline for the slice         | true     | --               |
| title              | RichText \|\| String | false      | A title for the slice                  | true     | --               |
| description        | RichText \|\| String | false      | A paragraph for the slice              | true     | --               |
| title              | RichText \|\| String | true       | A title to select the video            | true     | --               |
| src.embed_url      | String   \|\| URL    | true       | The link to your video                 | true     | --               |
```