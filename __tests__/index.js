const getLastNonNullKey = require('../lib').getLastNonNullKey;

describe('', () => {
  it('works with empty object', () => {
    expect(getLastNonNullKey({})).toEqual(undefined);
  });

  it('works with object', () => {
    expect(getLastNonNullKey({
      1: 1,
      2: 2,
      3: null
    })).toEqual('2');
  });
});
