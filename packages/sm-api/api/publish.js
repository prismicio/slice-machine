const fetch = require("node-fetch")
const cors = require("../common/cors");
const Mongo = require('../common/mongo');

const SM_CONFIG_FILE = "sm.json";

const githubWhiteList = {
  "prismicio/vue-essential-slices": true
};

module.exports = async (req, res) => {
  const body = req.body || {}
  if (!body.ref || !body.head_commit || !body.repository) {
    return res.status(400).send('')
  }

  const repoName = body.repository.full_name
  if (!githubWhiteList[repoName]) {
    return res.status(403).send('')
  }

  const branch = body.ref.split("/").pop()
  if (branch !== "master") {
    return res.status(200).send('')
  }

  const smFile =
    body.head_commit.modified.find(e => e === SM_CONFIG_FILE) ||
    body.head_commit.added.find(e => e === SM_CONFIG_FILE)

  if (smFile) {
    const smFileUrl = `https://raw.githubusercontent.com/${repoName}/master/${SM_CONFIG_FILE}`

    try {
      const response = await fetch(smFileUrl);
      const sm = JSON.parse(await response.text());

      await Mongo.collections.libraries(coll => (
        coll.updateOne({ packageName: sm.packageName }, { $set: sm }, {
          upsert: true
        })
      ));

      return res.json(sm);
    } catch(e) {
      // send this via email
      console.error(e);
    }
  }
  res.status(200).send('')
};

