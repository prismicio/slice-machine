#!/bin/bash
# set -x

THIS_DIR=$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)

if [[ -z "$EMAIL" || -z "$PASSWORD" || -z "$PRISMIC_URL" ]]; then
  echo "[ERROR] Please set EMAIL PASSWORD PRISMIC_URL environments variables"
  echo 'EMAIL="email@example.com" PASSWORD="guest" PRISMIC_URL="https://prismic.io" REPOSITORY="my-repo" yarn test:e2e:dev'
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
  export SM_ENV="development"
elif [[ "$PRISMIC_URL" == 'https://wroom.io' ]]; then
  export SM_ENV="staging"
else
  export SM_ENV="production"
fi

rm -rf e2e-projects/cypress-next-app \
&& yarn dlx --quiet create-next-app --app --eslint --import-alias '@/*' --tailwind --typescript --use-npm e2e-projects/cypress-next-app \
&& yarn dlx --quiet vite-node ./cypress/plugins/addAuth.ts -- ${EMAIL} ${PASSWORD} ${PRISMIC_URL} \
&& yarn dlx --quiet vite-node ./cypress/plugins/createRepo.ts -- "${_PRISMIC_REPO}" "${PASSWORD}" "${PRISMIC_URL}" \
&& yarn workspaces foreach --include '{@slicemachine/adapter-next,@slicemachine/init,@slicemachine/manager,@slicemachine/plugin-kit,slice-machine-ui,start-slicemachine}' --topological --verbose pack --out "${THIS_DIR}"/e2e-projects/cypress-next-app/%s-%v.tgz \
&& cd e2e-projects/cypress-next-app \
&& npm i *.tgz \
&& npx @slicemachine/init --repository ${_PRISMIC_REPO} \
&& npm i --save-dev slice-machine-ui*.tgz @slicemachine-adapter-next*.tgz \
&& npx json -I -f package.json -e "this.scripts.slicemachine=\"start-slicemachine\"" \
&& npx json -I -f slicemachine.config.json -e "this.localSliceSimulatorURL=\"http://localhost:3000/slice-simulator\""
