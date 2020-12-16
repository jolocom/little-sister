#!/usr/bin/env node

const child_process = require('child_process')

// check that nothing is committed in android/gradle.properties
const gradlePropertiesDiff =
  child_process.execSync('git diff --cached --raw ./android/gradle.properties')

if (gradlePropertiesDiff != '') {
  console.error('android/gradle.properties should not be committed!')
  process.exit(1)
}
