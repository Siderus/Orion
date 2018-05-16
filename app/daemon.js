import { spawn, exec } from 'child_process'

import {
  readFileSync,
  writeFile,
  createWriteStream,
  existsSync
} from 'fs'

import { join as pathJoin } from 'path'
import { fileSync as tmpFileSync } from 'tmp'
import request from 'request-promise-native'
import { app, dialog } from 'electron'
import pjson from '../package.json'
import Settings from 'electron-settings'

/**
 * Execute an IPFS command asynchoniously,
 * without needing to specify the binary path or repo path.
 *
 * Example: `executeIPFSCommand('config', 'Addresses.API')`
 * which could resolve to `/ip4/127.0.0.1/tcp/5001`
 *
 * @param {string} command
 * @return Promise<string>
 */
export function executeIPFSCommand (...args) {
  return new Promise((resolve, reject) => {
    let options
    if (global.IPFS_REPO_PATH.length > 0) {
      options = { env: { IPFS_PATH: global.IPFS_REPO_PATH } }
    }

    console.log('Running', global.IPFS_BINARY_PATH, args)
    // Build the cmd
    const cmd = global.IPFS_BINARY_PATH + ' ' + args.join(' ')
    const child = exec(cmd, options)

    let output = ''
    // Pipe output to stderr
    child.stderr.on('data', (data) => {
      output += data
      console.log(`${global.IPFS_BINARY_PATH} ${args}: ${data}`)
    })
    child.stdout.on('data', (data) => { output += data })

    // On close ensure that the Promise resolves
    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`Error running: ${global.IPFS_BINARY_PATH} ${args} ${options} - ${code}`)
        return reject(output)
      }
      return resolve(output)
    })
  })
}

/**
 * Spawn a new process using the given IPFS command,
 * without needing to specify the binary path or repo path.
 *
 * Example: `const daemonProcess = spawnIPFSCommand('daemon', '--debug')`
 *
 * @param {string} command
 * @returns ChildProcess
 */
export function spawnIPFSCommand (...args) {
  let options
  if (global.IPFS_REPO_PATH.length > 0) {
    options = { env: { IPFS_PATH: global.IPFS_REPO_PATH } }
  }
  console.log('Running', global.IPFS_BINARY_PATH, args, options)
  return spawn(global.IPFS_BINARY_PATH, args, options)
}

/**
 *
 * Returns the version of the currently running API.
 * If no API is available returns `null`.
 *
 * Example: 'v0.4.14'
 * @returns Promise<string>
 */
export function getAPIVersion () {
  return request({
    // what if it's running on a different port?
    uri: 'http://localhost:5001/api/v0/version',
    headers: { 'User-Agent': `Orion/${pjson.version}` }
  })
    .then(res => {
      /**
       * ApiVersionResult {
       *   Version: '0.4.14',
       *   Commit: ',
       *   Repo: '6',
       *   System: 'amd64/linux',
       *   Golang: 'go1.10'
       * }
       */
      res = JSON.parse(res)
      return Promise.resolve(`v${res.Version}`)
    })
    .catch(err => {
      console.error('API not available', err.message)
      return Promise.resolve(null)
    })
}

/**
 * startIPFSDaemon will start IPFS go daemon, if installed.
 * return a promise with child process of IPFS daemon.
 * The daemon always has 2 options, one to ensure that the repo is initalized
 * the other one to ensure that the api endpoint is the right multiaddr
 */
export function startIPFSDaemon () {
  return new Promise((resolve, reject) => {
    const disablePubSubIPNS = Settings.getSync('disablePubSubIPNS')

    const args = [
      '--init',
      `--api=${global.IPFS_MULTIADDR_API}`
    ]

    if (!disablePubSubIPNS) {
      args.push('--enable-namesys-pubsub')
    }

    const ipfsProcess = spawnIPFSCommand('daemon', ...args)

    // Prepare temporary file for logging:
    const tmpLog = tmpFileSync({ keep: true })
    const tmpLogPipe = createWriteStream(tmpLog.name)

    console.log(`Logging IPFS Daemon logs in: ${tmpLog.name}`)

    ipfsProcess.stdout.on('data', (data) => console.log(`IPFS Daemon: ${data}`))
    ipfsProcess.stdout.pipe(tmpLogPipe)

    ipfsProcess.stderr.on('data', (data) => console.log(`IPFS Daemon Error: ${data}`))
    ipfsProcess.stderr.pipe(tmpLogPipe)

    ipfsProcess.on('close', (exit) => {
      if (exit !== 0 && exit !== null) {
        let msg = `IPFS Daemon was closed with exit code ${exit}. `
        msg += 'The app will be closed. Try again. '
        msg += `Log file: ${tmpLog.name}`

        dialog.showErrorBox('IPFS was closed, the app will quit', msg)
        app.quit()
      }
      console.log(`IPFS Closed: ${exit}`)
    })

    resolve(ipfsProcess)
  })
}

/**
 * isIPFSInitialised returns a boolean if the repository config file is present
 * in the default path (i.e. userData)
 * (~/.config/Electron/.ipfs/config) in development
 *
 * https://github.com/electron/electron/blob/master/docs/api/app.md#appgetpathname
 */
export function isIPFSInitialised () {
  const confFile = pathJoin(global.IPFS_REPO_PATH, './config')
  return existsSync(confFile)
}

/**
 * ensuresIPFSInitialised will ensure that the repository is initialised
 * correctly in the home directory (by running `ipfs init`)
 */
export function ensuresIPFSInitialised () {
  if (isIPFSInitialised()) return Promise.resolve()
  console.log('Initialising IPFS repository...')
  return new Promise((resolve, reject) => {
    const ipfsProcess = spawnIPFSCommand('init')
    // Prepare temporary file for logging:
    const tmpLog = tmpFileSync({ keep: true })
    const tmpLogPipe = createWriteStream(tmpLog.name)

    console.log(`Logging IPFS init logs in: ${tmpLog.name}`)

    ipfsProcess.stdout.on('data', (data) => console.log(`IPFS Init: ${data}`))
    ipfsProcess.stdout.pipe(tmpLogPipe)

    ipfsProcess.stderr.on('data', (data) => console.log(`IPFS Init Error: ${data}`))
    ipfsProcess.stderr.pipe(tmpLogPipe)

    ipfsProcess.on('close', (exit) => {
      if (exit !== 0) {
        let msg = `IPFS init failed with exit code ${exit}. `
        msg += 'The app will be closed. Try again. '
        msg += `Log file: ${tmpLog.name}`

        dialog.showErrorBox('IPFS init failed. The app will quit', msg)
        app.quit()
        reject()
      }

      resolve()
    })
  })
}

/**
 * This will ensure IPFS Daemon starts on the correct ports by changing the
 * API, Gateway and Address ports to the one specified in the global variables
 *
 * @returns Promise
 */
export function ensureDaemonConfigured () {
  return new Promise((resolve, reject) => {
    // Read the json conifugation. A simple require() won't work
    const configFilePath = pathJoin(global.IPFS_REPO_PATH, './config')
    const confRaw = readFileSync(configFilePath, { encoding: 'utf8' })
    let conf = JSON.parse(confRaw)

    // Change the configuration
    conf.Addresses.API = global.IPFS_MULTIADDR_API
    conf.Addresses.Gateway = global.IPFS_MULTIADDR_GATEWAY
    conf.Addresses.Swarm = global.IPFS_MULTIADDR_SWARM

    // Return a promise that writes the configuration back in the file
    writeFile(configFilePath, JSON.stringify(conf, null, 2), function (err) {
      if (err) return reject(err)
      return resolve()
    })
  })
}

/**
 * Returns the multiAddr usable to connect to the local dameon via API
 */
export function getApiMultiAddress () {
  return executeIPFSCommand('config', 'Addresses.API')
}

/**
 * connectToCMD allows easily to connect to a node by specifying a str
 * multiaddress. example: connectToCMD('/ip4/192.168.0.22/tcp/4001/ipfs/Qm...')
 * returns a promise
 */
export function connectToCMD (strMultiddr) {
  return executeIPFSCommand('swarm', 'connect', `${strMultiddr}`)
}

/**
 * addBootstrapAddr allows easily to add a node multiaddr as a bootstrap nodes
 * example: addBootstrapAddr('/ip4/192.168.0.22/tcp/4001/ipfs/Qm...')
 * returns a promise
 */
export function addBootstrapAddr (strMultiddr) {
  return executeIPFSCommand('bootstrap', 'add', `${strMultiddr}`)
}

/**
 * getSiderusPeers returns a Promise that will download and return a list of
 * multiaddress (as str) of IPFS nodes from Siderus Network.
 */
export function getSiderusPeers () {
  return request({
    uri: 'https://meta.siderus.io/ipfs/peers.txt',
    headers: { 'User-Agent': `Orion/${pjson.version}` }
  }).then(res => {
    let peers
    // split the file by endlines
    peers = res.split(/\r?\n/)
    // remove empty lines
    peers = peers.filter(el => el.length > 0)
    return Promise.resolve(peers)
  })
}

/**
 * Wait for the ipfs repository to be unlocked.
 * Useful when running ipfs commands simultaneously.
 * (e.g running ipfs daemon needs some time before it releases the lock)
 * @param {number} timeout defaults to 30 tries every second
 */
export function promiseRepoUnlocked (timeout = 30) {
  let iID // interval id
  let trial = 0
  return new Promise((resolve, reject) => {
    iID = setInterval(() => {
      trial++
      if (trial >= timeout) {
        clearInterval(iID)
        return reject('TIMEOUT')
      }

      return getApiMultiAddress().then(() => {
        clearInterval(iID)
        return resolve()
      }).catch(() => {
        console.log('Waiting for repo to be unlocked...')
      })
    }, 1000) // every second
  })
}
