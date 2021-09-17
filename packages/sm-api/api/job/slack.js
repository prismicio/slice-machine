const fetch = require("node-fetch");

async function main(text) {
  const rawResponse = await fetch(process.env.SLACK_MESAGE_URI, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  const content = await rawResponse.text();
  return content;
}

module.exports = {
  postMessage: main,
};
