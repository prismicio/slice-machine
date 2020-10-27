const fetch = require("node-fetch")
const Mongo = require('../common/mongo');

const SM_CONFIG_FILE = "sm.json";

const githubWhiteList = {
  "prismicio/vue-essential-slices": true
};

module.exports = async (event) => {
  const bodyMaybeString = event.body || ""
  const body = (typeof(bodyMaybeString) === typeof("")) ? JSON.parse(bodyMaybeString) : bodyMaybeString;

  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST','Content-Type': 'application/json'};

  if (!body.ref || !body.head_commit || !body.repository) {
    const message = `missing parameters:${!body.ref && " ref"}${!body.head_commit && " head_commit"}${!body.repository && " repository"}`
    return { statusCode: 400, headers, body: JSON.stringify({ error: true, message })}
  }

  const repoName = body.repository.full_name
  if (!githubWhiteList[repoName]) {
    const message = `Unauthorised repository ${repoName}`;
    return { statusCode: 403, headers, body: JSON.stringify({ error: true, message })}
  }

  const branch = body.ref.split("/").pop()

  if (branch !== "master") {
    const message = `ref should be master branch`;
    return { statusCode: 200, headers, body: JSON.stringify({ error: true, message }) }
  }

  const smFile =
    body.head_commit.modified.find(e => e === SM_CONFIG_FILE) ||
    body.head_commit.added.find(e => e === SM_CONFIG_FILE)

  if (smFile) {
    const smFileUrl = `https://raw.githubusercontent.com/${repoName}/master/${SM_CONFIG_FILE}`

    try {
      const response = await fetch(smFileUrl);
      const sm = await response.json();
      
      /**
       * Memory leak deteced in tests,
       * comment out mongo to remove the warning.
      */
      await Mongo.collections.libraries(coll => coll.updateOne({
        packageName: sm.packageName
      }, {
        $set: sm
      }, {
        upsert: true
      }));

      return { statusCode: 200, headers, body:JSON.stringify(sm) };
    } catch(e) {
      // send this via email
      console.error(e);
      return e;
    }
  }
  // should we do a 200 here?
  return { statusCode: 400, headers, body: JSON.stringify({ error: true, message: `${SM_CONFIG_FILE} not found in head_commit`}) }
};

