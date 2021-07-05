
describe('publish', () => {
  it('should work', async () => {
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

    jest.mock('node-fetch');
    const fetch = require('node-fetch');
    fetch.mockResolvedValue({
      json: jest.fn(() => require('../../__stubs__/publish-github-sm-file.json'))
    })

    jest.mock('../../common/mongo', () => ({
      collections: {
        libraries: () => ({
          updateOne: jest.fn(),
        }),
      },
    }));

    global.console.error = jest.fn();


    const { publish } = require('../../api');

    const result = await publish(event);
    const body = JSON.parse(result.body);

    expect(result.statusCode).toBe(200);   
    expect(result.headers["Access-Control-Allow-Origin"]).toBe("*");
    expect(result.body).toMatchSnapshot();
    expect(global.console.error).not.toBeCalled();

  })
});