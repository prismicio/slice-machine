# Git: Missing Write API Token

A Prismic Write API token was missing. A Write API token for the configured Prismic repository is required to push models.

## How to fix the issue

Re-connect the Prismic and GitHub repositories, ensuring the Write API token is active and correct:

1. In Slice Machine's Settings page, disconnect the connected GitHub repository.
1. Re-connect the GitHub repository.
1. When asked for a Write API token, provide a valid token.

Tokens can be created following these steps:

1. In the Prismic repository, navigate to the Settings page.
1. Select **API & Security** in the sidebar and the **Write APIs** tab at the top of the page.
1. Create and copy a new Write API token or copy an existing token.
