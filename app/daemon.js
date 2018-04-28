import { spawn } from 'child_process'
import { createWriteStream, existsSync } from 'fs'
import { join as pathJoin } from 'path'
import exec from 'promised-exec'
import { fileSync as tmpFileSync } from 'tmp'
import request from 'request-promise-native'
import { app, dialog } from 'electron'
import pjson from '../package.json'
import { get as getAppRoot } from 'app-root-dir'

const CUSTOM_API_PORT = 5101
const CUSTOM_GATEWAY_PORT = 8180
const CUSTOM_SWARM_PORT = 4101

export let binaryPath = `${getAppRoot()}/go-ipfs/ipfs`
let skipRepo = false

/**
 * Skip passing IPFS_PATH when executing commands.
 * Useful when you want to use the default repository path,
 * instead of our custom path (`AppData/Orion/.ipfs`).
 */
export function skipRepoPath () {
  skipRepo = true
}

export function getRepoPath () {
  return pathJoin(app.getPath('userData'), '.ipfs')
}

export function setCustomBinaryPath (path) {
  binaryPath = path
}

/**
 * Execute an IPFS command asynchoniously,
 * without needing to specify the binary path or repo path.
 *
 * Example: `executeIPFSCommand('config Addresses.API')`
 * which could resolve to `/ip4/127.0.0.1/tcp/5001`
 *
 * @param {string} command
 * @return Promise<string>
 */
export function executeIPFSCommand (command) {
  const env = skipRepo ? '' : `IPFS_PATH=${getRepoPath()}`
  return exec(`${env} ${binaryPath} ${command}`)
}

/**
 * Spawn a new process using the given IPFS command,
 * without needing to specify the binary path or repo path.
 *
 * Example: `const daemonProcess = spawnIPFSCommand('daemon')`
 *
 * @param {string} command
 * @returns ChildProcess
 */
export function spawnIPFSCommand (command) {
  const options = skipRepo ? undefined : { env: { IPFS_PATH: getRepoPath() } }
  return spawn(binaryPath, [command], options)
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
       *   Version: "0.4.14",
       *   Commit: "",
       *   Repo: "6",
       *   System: "amd64/linux",
       *   Golang: "go1.10"
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
 * return a promise with child process of IPFS daemon
 */
export function startIPFSDaemon () {
  return new Promise((resolve, reject) => {
    const ipfsProcess = spawnIPFSCommand('daemon')

    // Prepare temporary file for logging:
    const tmpLog = tmpFileSync({ keep: true })
    const tmpLogPipe = createWriteStream(tmpLog.name)

    console.log(`Logging IPFS Daemon logs in: ${tmpLog.name}`)

    ipfsProcess.stdout.on('data', (data) => console.log(`IPFS Daemon: ${data}`))
    ipfsProcess.stdout.pipe(tmpLogPipe)

    ipfsProcess.stderr.on('data', (data) => console.log(`IPFS Daemon Error: ${data}`))
    ipfsProcess.stderr.pipe(tmpLogPipe)

    ipfsProcess.on('close', (exit) => {
      if (exit !== 0) {
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
  const confFile = pathJoin(getRepoPath(), 'config')
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
 * This will ensure Orion starts on the correct ports by
 * resetting the ports to their default values or, when `customPorts` is passed,
 * by mapping these ports to:
 *
 * 5001 -> 5101 (API)
 * 8080 -> 8180 (Gateway)
 * 4001 -> 4101 (Swarm)
 *
 * @param {boolean} customPorts
 * @returns Promise
 */
export function ensureAddressesConfigured (customPorts = false) {
  let apiPort = '5001'
  let gatewayPort = '8080'
  let swarmPort = '4001'

  if (customPorts) {
    console.log('Setting custom addresses for API, Gateway and Swarm')
    apiPort = CUSTOM_API_PORT
    gatewayPort = CUSTOM_GATEWAY_PORT
    swarmPort = CUSTOM_SWARM_PORT
  }

  return executeIPFSCommand(`config Addresses.API /ip4/127.0.0.1/tcp/${apiPort}`)
    .then(() => executeIPFSCommand(`config Addresses.Gateway /ip4/127.0.0.1/tcp/${gatewayPort}`))
    .then(() => executeIPFSCommand(`config Addresses.Swarm --json '["/ip4/0.0.0.0/tcp/${swarmPort}", "/ip6/::/tcp/${swarmPort}"]'`))
}

/**
 * Returns the multiAddr usable to connect to the local dameon via API
 */
export function getApiMultiAddress () {
  return executeIPFSCommand(`config Addresses.API`)
}

/**
 * connectToCMD allows easily to connect to a node by specifying a str
 * multiaddress. example: connectToCMD("/ip4/192.168.0.22/tcp/4001/ipfs/Qm...")
 * returns a promise
 */
export function connectToCMD (strMultiddr) {
  return executeIPFSCommand(`swarm connect ${strMultiddr}`)
}

/**
 * addBootstrapAddr allows easily to add a node multiaddr as a bootstrap nodes
 * example: addBootstrapAddr("/ip4/192.168.0.22/tcp/4001/ipfs/Qm...")
 * returns a promise
 */
export function addBootstrapAddr (strMultiddr) {
  return executeIPFSCommand(`bootstrap add ${strMultiddr}`)
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
      }).catch(() => { }) // do nothing in case of errors
    }, 1000) // every second
  })
}
