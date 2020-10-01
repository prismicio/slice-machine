
describe('libraries', () => {

  it('should work', async () => {
    jest.mock('../../common/mongo', () => ({
      collections: {
        libraries: () => ({
          toArray: () => require('../../__stubs__/libraries-mongo-libraries.json'),
        }),
      },
    }));

    const { libraries } = require('../../api');

    const req = { query: { /* framework, strip, list, preserveDefaults */ } };
    const res = { json: jest.fn() };

    

    await libraries(req, res);

    expect(res.json).toBeCalled();
    expect(res.json).toMatchSnapshot();

    jest.unmock('../../common/mongo');

  });

  // to-do: test query params.
});
