#!/bin/bash
# set -x
if [[ -z "$EMAIL" || -z "$PASSWORD" ]]; then
  echo "[ERROR] Please set EMAIL evnotiment variable"
  echo 'EMAIL="email@example.com" PASSWORD="guest" RESPOSITORY="repo-name" npm run test:e2e:dev'
  echo $EMAIL $PASSWORD
  exit 1
fi 
_DATE=$(date +'%y%m%d%H%M%S')
_PRISMIC_REPO=""
if [[ -z "$REPOSITORY" ]]; then 
  _PRISMIC_REPO="repository-cypress$_DATE"
else 
  _PRISMIC_REPO=$REPOSITORY
fi

if [[ -z "$CYPRESS_URL" ]]; then 
  CYPRESS_URL="wroom.io"
fi

rm -rf e2e-projects/cypress-next-app \
&& npx --yes create-next-app e2e-projects/cypress-next-app \
&& npx --yes ts-node ./cypress/plugins/addAuth.ts ${EMAIL} ${PASSWORD} ${CYPRESS_URL} \
&& npx --yes ts-node ./cypress/plugins/createRepo.ts "${_PRISMIC_REPO}" "${PASSWORD}" "${CYPRESS_URL}"  \
&& cd e2e-projects/cypress-next-app \
&& node ../../packages/init/build/index.js --mode stage --repository "${_PRISMIC_REPO}" \
&& npm i \
&& npx --yes json -I -f package.json -e "this.scripts.slicemachine=\"node ../../packages/slice-machine/bin/start.js\""
