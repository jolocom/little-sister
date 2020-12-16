#!/bin/bash

# 1.6.empty.sqlite3 is a wallet database initialized @ v1.6.0 (before any migration logic was introduced).

# This folder also includes the password to decrypt the test encrypted entropy
# Both the database and the password files are moved to the project root folder
# and yarn repl is executed.
# As part of it's init code, the repl file will instantiate the Storage class,
# which will attempt to migrate the test database (by applying all local migrations) 
# to the database.
#
# After that, the ./assert_correct_did.ts code fires.

cp ./tests/test_databases/1.6.empty.sqlite3 ./db.sqlite3;
cp ./tests/test_databases/local_identity.password.txt ./local_identity.password.txt;
yarn repl ./tests/test_databases/assert_correct_did.ts;
