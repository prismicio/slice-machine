#!/bin/bash
# set -x
if [[ -z "$EMAIL" || -z "$PASSWORD" || -z "$PRISMIC_URL" ]]; then
  echo "[ERROR] Please set EMAIL PASSWORD PRISMIC_URL environments variables"
  echo 'EMAIL="email@example.com" PASSWORD="guest" PRISMIC_URL="https://prismic.io REPOSITORY="my-repo" npm run test:e2e:dev'
  echo $EMAIL $PASSWORD $PRISMIC_URL $REPOSITORY
  exit 1
fi 
_DATE=$(date +'%y%m%d%H%M%S')
_PRISMIC_REPO=""
if [[ -z "$REPOSITORY" ]]; then 
  _PRISMIC_REPO="repository-cypress$_DATE"
else 
  _PRISMIC_REPO=$REPOSITORY
fi

if [[ "$PRISMIC_URL" == 'https://wroom-qa.com' ]] || [[ "$PRISMIC_URL" == 'http://wroom.test' ]] ; then 
  MODE="dev"
elif [[ "$PRISMIC_URL" == 'https://wroom.io' ]]; then
  MODE="stage"
else
  MODE="prod"
fi

rm -rf e2e-projects/cypress-next-app \
&& npx --yes create-next-app e2e-projects/cypress-next-app \
&& npx --yes ts-node ./cypress/plugins/addAuth.ts ${EMAIL} ${PASSWORD} ${PRISMIC_URL} \
&& npx --yes ts-node ./cypress/plugins/createRepo.ts "${_PRISMIC_REPO}" "${PASSWORD}" "${PRISMIC_URL}"  \
&& cd e2e-projects/cypress-next-app \
&& node ../../packages/init/build/index.js --mode "${MODE}" --repository "${_PRISMIC_REPO}" \
&& npm i \
&& npx --yes json -I -f package.json -e "this.scripts.slicemachine=\"node ../../packages/slice-machine/bin/start.js\""
