#!/bin/bash
rm -rf e2e-projects/cypress-next-app
npx --yes create-next-app e2e-projects/cypress-next-app
npx --yes ts-node ./cypress/plugins/addAuth.ts
npx --yes ts-node ./cypress/plugins/createRepo.ts
cd e2e-projects/cypress-next-app
node ../../packages/init/build/index.js --mode stage --repository repository-cypress
npm i
npx --yes json -I -f package.json -e "this.scripts.slicemachine=\"node ../../packages/slice-machine/bin/start.js\""