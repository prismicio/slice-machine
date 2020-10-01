
describe('version', () => {
  it('should work', () => {
    const pkg = require('../../package.json');
    const req = {};
    const res = { json: jest.fn() };
    
    const { version } = require('../../api');

    version(req, res);

    expect(res.json).toBeCalled();
    expect(res.json.mock.calls[0][0].current).toEqual(pkg.version);
  })
}); 