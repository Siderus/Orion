import { spawn, exec, execSync } from 'child_process'

import {
  readFileSync,
  writeFile,
  createWriteStream,
  existsSync
} from 'fs'

import { join as pathJoin } from 'path'
import { fileSync as tmpFileSync } from 'tmp'
import { app, dialog } from 'electron'
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
 * startIPFSDaemon will start IPFS go daemon, if installed.
 * return a promise with child process of IPFS daemon.
 * The daemon always has 2 options, one to ensure that the repo is initalized
 * the other one to ensure that the api endpoint is the right multiaddr
 */
export function startIPFSDaemon () {
  return new Promise((resolve, reject) => {
    const disablePubSubIPNS = Settings.get('disablePubSubIPNS')

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
 * This will ensure the ipfs repo version is compatible with the daemon
 * by running migrations on the ipfs repo
 */
export function ensureRepoMigrated () {
  return new Promise((resolve, reject) => {
    let options
    if (global.IPFS_REPO_PATH.length > 0) {
      options = { env: { IPFS_PATH: global.IPFS_REPO_PATH } }
    }
    // yes to all
    const cmd = `${global.REPO_MIGRATIONS_BINARY_PATH} -y`

    console.log('Running', cmd, options)
    const result = execSync(cmd, options).toString('utf8')

    console.log('Finished', cmd, 'with: ', result)
    resolve()
  })
}

/**
 * Returns the multiAddr usable to connect to the local dameon via API
 */
export function getApiMultiAddress () {
  return executeIPFSCommand('config', 'Addresses.API')
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
