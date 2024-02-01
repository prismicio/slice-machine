# Git: Unauthorzed Prismic access

The GitHub app tried to make a request to Prismic, but failed due to unauthorized access.

This error can occur when syncing model changes to Prismic from GitHub with an invalid Prismic Write API token.

## How to fix the issue

First, ensure a Prismic Write API token was saved in Slice Machine. You can set, update, and delete a Write API token from Slice Machine's Settings page.

If a token was already saved in Slice Machine, verify that the Prismic Write API token is valid:

1. In the Prismic repository, navigate to the Settings page.
2. Select **API & Security** in the sidebar and the **Write APIs** tab at the top of the page.
3. Verify that the Write API token is listed. If necessary, generate a new token and save it in Slice Machine.
