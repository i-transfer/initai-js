/* @flow */
import createAPIClient from './api'
import createMonitorClient from './monitor'

const {VERSION} = process.env

module.exports = { createAPIClient, createMonitorClient, VERSION }
