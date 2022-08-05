#!/bin/bash
rm -rf e2e-cypress-next-app
npx --yes create-next-app e2e-cypress-next-app
node ./cypress/plugins/addAuth.js
cd e2e-cypress-next-app
node ../packages/init/build/index.js --e2e true --mode stage
npm i
npx --yes json -I -f package.json -e "this.scripts.slicemachine=\"node ../packages/slice-machine/bin/start.js\""