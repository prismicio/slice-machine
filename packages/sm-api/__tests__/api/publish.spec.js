
describe('publish', () => {
  it('should work', async () => {
    const req = {
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

    const res = {
      json: jest.fn(),
      send: jest.fn(),
    }

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

    await publish(req, res);
    expect(res.send).not.toBeCalled();
    expect(res.json).toBeCalled();
    expect(res.json).toMatchSnapshot();

    expect(global.console.error).not.toBeCalled();

  })
});