import { spawn } from 'child_process'
import { createWriteStream, existsSync } from 'fs'
import { join as pathJoin } from 'path'
import exec from 'promised-exec'
import { fileSync as tmpFileSync } from 'tmp'
import request from 'request-promise-native'
import { app, dialog } from 'electron'
import pjson from '../package.json'
import { get as getAppRoot } from 'app-root-dir'

const ORION_API_PORT = 5101
const ORION_GATEWAY_PORT = 8180
const ORION_SWARM_PORT = 4101

let customRepoPath
let customBinaryPath

export function setCustomRepoPath (repoPath = pathJoin(app.getPath('home'), '.ipfs')) {
  customRepoPath = repoPath
}

export function setCustomBinaryPath (binaryPath = 'ipfs') {
  customBinaryPath = binaryPath
}

export function getIPFSRepoPath () {
  return customRepoPath || pathJoin(app.getPath('userData'), '.ipfs')
}

/**
 * getPathIPFSBinary will return the IPFS path of our own binary or the custom one if set
 */
export function getPathIPFSBinary () {
  return customBinaryPath || `${getAppRoot()}/go-ipfs/ipfs`
}

/**
 * Resolves true if a connection to the api could be made, false otherwise
 * @returns Promise<Boolean>
 */
export function checkApiConnection () {
  return getAPIVersion()
    .then(version => {
      if (version === pjson.ipfsVersion ||
        version === pjson.ipfsVersion.replace('v', '')) {
        return Promise.resolve(true)
      } else {
        // show alert
      }
      return Promise.resolve(false)
    })
    .catch(err => {
      console.error('API not available', err.message)
      return Promise.resolve(false)
    })
}

/**
 *
 * Example:
 * ```
 * ApiVersionResult {
 *   Version: "0.4.14",
 *   Commit: "",
 *   Repo: "6",
 *   System: "amd64/linux",
 *   Golang: "go1.10"
 * }
 * ```
 * @returns Promise<ApiVersionResult>
 */
export function getAPIVersion () {
  return request({
    // what if it's running on a different port?
    uri: 'http://localhost:5001/api/v0/version',
    headers: { 'User-Agent': `Orion/${pjson.version}` }
  }).then(res => {
    res = JSON.parse(res)
    return Promise.resolve(res.Version)
  })
}

/**
 * startIPFSDaemon will start IPFS go daemon, if installed.
 * return a promise with child process of IPFS daemon
 */
export function startIPFSDaemon () {
  return new Promise((resolve, reject) => {
    const binaryPath = getPathIPFSBinary()
    const options = {
      env: {
        IPFS_PATH: getIPFSRepoPath()
      }
    }
    const ipfsProcess = spawn(binaryPath, ['daemon'], options)

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
 * in the default path (~/.ipfs/config)
 */
export function isIPFSInitialised () {
  const confFile = pathJoin(getIPFSRepoPath(), 'config')
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
    const binaryPath = getPathIPFSBinary()
    const options = {
      env: {
        IPFS_PATH: getIPFSRepoPath()
      }
    }
    const ipfsProcess = spawn(binaryPath, ['init'], options)

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

export function ensureAddressesConfigured () {
  return getApiMultiAddress()
    .then(apiMultiAddr => {
      const isDefaultAddr = apiMultiAddr && apiMultiAddr.indexOf(ORION_API_PORT)

      if (isDefaultAddr) {
        return setOrionAddresses()
      }

      return Promise.resolve()
    })
}

/**
 * 5001 -> 5101
 * 4001 -> 4101
 * 8080 -> 8180
 */
export function setOrionAddresses () {
  console.log('Setting Orion custom addresses for API, Gateway and Swarm')
  const binaryPath = getPathIPFSBinary()
  const ipfsRepoPath = `IPFS_PATH=${getIPFSRepoPath()}`

  return exec(`${ipfsRepoPath} ${binaryPath} config Addresses.API /ip4/127.0.0.1/tcp/${ORION_API_PORT}`)
    .then(() => exec(`${ipfsRepoPath} ${binaryPath} config Addresses.Gateway /ip4/127.0.0.1/tcp/${ORION_GATEWAY_PORT}`))
    .then(() => exec(`${ipfsRepoPath} ${binaryPath} config Addresses.Swarm --json '["/ip4/0.0.0.0/tcp/${ORION_SWARM_PORT}", "/ip6/::/tcp/${ORION_SWARM_PORT}"]'`))
}

/**
 * Returns the multiAddr usable to connect to the local dameon via API
 */
export function getApiMultiAddress () {
  // Other option: ask the binary wich one to use
  const binaryPath = getPathIPFSBinary()
  const ipfsRepoPath = `IPFS_PATH=${getIPFSRepoPath()}`
  return exec(`${ipfsRepoPath} ${binaryPath} config Addresses.API`)
}

/**
 * connectToCMD allows easily to connect to a node by specifying a str
 * multiaddress. example: connectToCMD("/ip4/192.168.0.22/tcp/4001/ipfs/Qm...")
 * returns a promise
 */
export function connectToCMD (strMultiddr) {
  const binaryPath = getPathIPFSBinary()
  const ipfsRepoPath = `IPFS_PATH=${getIPFSRepoPath()}`
  return exec(`${ipfsRepoPath} ${binaryPath} swarm connect ${strMultiddr}`)
}

/**
 * addBootstrapAddr allows easily to add a node multiaddr as a bootstrap nodes
 * example: addBootstrapAddr("/ip4/192.168.0.22/tcp/4001/ipfs/Qm...")
 * returns a promise
 */
export function addBootstrapAddr (strMultiddr) {
  const binaryPath = getPathIPFSBinary()
  const ipfsRepoPath = `IPFS_PATH=${getIPFSRepoPath()}`
  return exec(`${ipfsRepoPath} ${binaryPath} bootstrap add ${strMultiddr}`)
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
