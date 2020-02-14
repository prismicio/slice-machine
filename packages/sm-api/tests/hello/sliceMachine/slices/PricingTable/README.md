# Pricing Table Section

### Purpose of the component
This component allows you to easily create a beautifully styled pricing table section for your company website.

### Variations
1. Default
This default version on the component is the only variation.

### Properties
```
| Property           | Type                 | Repeatable | Description                            | Required | Default          |
| ------------------ | -------------------- | -----------| -------------------------------------- | -------- | ---------------- |
| eyebrow_headline   | RichText \|\| String | false      | A short headline for the slice         | true     | --               |
| title              | RichText \|\| String | false      | A title for the slice                  | true     | --               |
| description        | RichText \|\| String | false      | A paragraph for the slice              | true     | --               |
| plan_title         | RichText \|\| String | true       | A title for the plan                   | true     | --               |
| price_option       | RichText \|\| String | true       | A price for the plan                   | true     | --               |
| features           | RichText \|\| String | true       | List of features for the plan          | true     | --               |
| call_to_action_text| Key Text \|\| String | true       | A label for the CTA                    | true     | --               |
| call_to_action     | String   \|\| URL    | true       | Call to action link                    | false    | https://test.com |
```