#!/bin/bash
# set -x

export NODE_ENV=development 
export SM_ENV=development
export wroom_endpoint="https://prismic.io/"
export authentication_server_endpoint="https://auth.prismic.io/"
export customtypesapi_endpoint="https://customtypes.prismic.io/"
export user_service_endpoint="https://user.internal-prismic.io/"
export acl_provider_endpoint="https://0yyeb2g040.execute-api.us-east-1.amazonaws.com/prod/"
export oembed_endpoint="https://oembed.prismic.io"
export unsplash_endpoint="https://unsplash.prismic.io"

npm run slicemachine