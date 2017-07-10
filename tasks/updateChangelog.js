#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const moment = require('moment')

const {version} = require('../package')
const matcher = /^# UNRELEASED/

fs.readFile(path.resolve('CHANGELOG.md'), 'utf8', (err, file) => {
  if (err) {
    throw new Error(err)
  }

  const versionHeadline = `# ${version} / ${moment().format("YYYY-MM-DD")}`

  if (!matcher.test(file)) {
    console.log('ERROR: No entry for `# UNRELEASED` found in CHANGELOG.md')
    process.exit(1)
  }

  fs.writeFile('CHANGELOG.md', file.replace(matcher, versionHeadline), 'utf8', (err) => {
    if (err) {
      throw new Error(err)
    }

    console.log('CHANGELOG updated')
  })
})
