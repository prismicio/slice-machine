const baseServer = "http://localhost:9999";

export default async function handler(req, res) {
  return fetch(`${baseServer}${req.url}`, {
    method: req.method,
    headers: req.headers,
    ...(req.method === "POST"
      ? {
          body: JSON.stringify(req.body),
        }
      : {}),
  })
    .then(async (response) => {
      const headers = response.headers.get("content-type");
      if (headers && headers.indexOf("application/json") !== -1) {
        const payload = await response.json();
        return res.status(response.status || 200).json(payload);
      }
      const buffer = await response.buffer();
      res.setHeader("Content-Type", response.headers.get("content-type"));
      res.write(buffer);
    })
    .catch(async (err) => {
      console.error(`[slicemachine-dev] Error at route "${req.url}": ${err}`);
      res.status(err.status || 400).json(err);
    });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "64mb",
    },
  },
};
