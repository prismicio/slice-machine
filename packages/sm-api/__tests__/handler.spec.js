/*
* here we test with out mocks
*/
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

if(!process.env.MONGODB_URI) {
  throw new Error("env variable: 'MONGODB_URI' not set");
}

const handler = require('../handler');

describe("handler.bootstrap", () => {
  it('should work', async () => {
    const event = {};

    const result = await handler.bootstrap(event);
    const body = JSON.parse(result.body)
    
    expect(result.statusCode).toBe(200);
    expect(body).toMatchSnapshot();
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    
  });
});

describe("handler.frameworks", () => {
  it('should work', async () => {
    const event = {};

    const result = await handler.frameworks(event);
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(200);
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(body).toMatchSnapshot()
  });
});

describe("handler.libraries", () => {
  // memory leak
  it('should work', async () => {
    const event = {};

    const result = await handler.libraries(event);
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(200);
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(body).toMatchSnapshot()
  });
});

describe("handler.library", () => {
  it('should work', async () => {
    const event = { queryStringParameters: { lib: 'vue-essential-slices' } };

    const result = await handler.library(event);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(result.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(body).toMatchSnapshot();

    jest.unmock('node-fetch');
  });
});

describe("handler.publish", () => {
  // memory leak
  xit('should work', async () => {
    const event = {
      body: {
        ref: "qwerty/master",
        repository: {
          full_name: "prismicio/vue-essential-slices"
        },
        head_commit: {
          modified: ["sm.json"],
          added: [],
        }
      }
    };

    const result = await handler.publish(event);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toEqual({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Content-Type': 'application/json'
    });
    expect(body).toMatchSnapshot();

  })
});
describe("handler.slices", () => {
  it('should return nuxt slices', async () => {
    const event = {};

    const result = await handler.slices(event);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toEqual({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Content-Type': 'application/json'
    });
    expect(body).toMatchSnapshot();

  })
});

describe("handler.version", () => {
  it('should return the version of this app', async () => {
    const result = await handler.version();

    const body = JSON.parse(result.body);
    const { version } = require('../package.json');

    expect(result.statusCode).toBe(200);
    expect(body.current).toBe(version)
  });
});