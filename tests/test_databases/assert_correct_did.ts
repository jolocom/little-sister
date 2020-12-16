import { accountActions } from 'src/actions'
import assert from 'assert'

declare var store: any

/**
 * Very simple script which runs as part of yarn test:migrations, after test_databases.sh is executed.
 * It simply asserts that the final DID (after migrations have been applied) matches the one initially
 * recorded to the databas (before migrations).
 */

// The original DID recorede to the DB pre any migrations, should not change.
const initial_did =
  'did:jolo:d129fdce5ff7d69878c001b0973d7e1a0ff2ae4cc7066d5a769e909c28c4149d'
store.dispatch(accountActions.checkIdentityExists).then(() => {
  assert(
    store.backendMiddleware.identityWallet.did === initial_did,
    'DID After migrations does not match expected one',
  )
  console.log('Post migration test returned OK - DIDs match!')
})
