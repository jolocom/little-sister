const detox = require('detox')
const getDetoxConfig = require('./utils').getDetoxConfig
const adapter = require('detox/runners/jest/adapter')
const specReporter = require('detox/runners/jest/specReporter')

// Set the default timeout
jest.setTimeout(120000)
jasmine.getEnv().addReporter(adapter)

// This takes care of generating status logs on a per-spec basis. By default,
// jest only reports at file-level.  This is strictly optional.
jasmine.getEnv().addReporter(specReporter)

beforeAll(async () => {
  try {
    const detoxConfig = await getDetoxConfig()
    await detox.init(detoxConfig)
  } catch (err) {
    // when detox init fails we should really stop the tests otherwise we get a
    // bunch of unrelated and misleading errors
    console.error('Detox init failed!', err)
    process.exit(1)
  }
});

beforeEach(async () => {
  await adapter.beforeEach()
});

afterAll(async () => {
  await adapter.afterAll()
  await detox.cleanup()
});
