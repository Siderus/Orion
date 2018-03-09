/* eslint no-console:0 */

import { spawn, execSync } from 'child_process'
import request from 'request-promise-native'

const pjson = require('../package.json');

import Settings from 'electron-settings'

/**
 * getPathIPFSBinary will return the IPFS default path
 */
export function getPathIPFSBinary() {
  return Settings.getSync('daemon.pathIPFSBinary') || '/usr/local/bin/ipfs'
}

/**
 * startIPFSCommand will start IPFS go daemon, if installed.
 * return child process with IPFS daemon
 */
export function startIPFSCommand() {
  if (Settings.getSync('daemon.startIPFSAtStartup') === false) return null

  const binaryPath = getPathIPFSBinary()
  const ipfsProcess = spawn(binaryPath, ['daemon'])

  ipfsProcess.stdout.on('data', (data) => console.log(`IPFS: ${data}`))
  ipfsProcess.stderr.on('data', (data) => console.log(`IPFS Error: ${data}`))
  ipfsProcess.on('close', (exit) => console.log(`IPFS Closed: ${exit}`))

  return ipfsProcess
}

/**
 * Returns the multiAddr usable to connect to the local dameon via API
 */
export function getMultiAddrIPFSDaemon() {
  // If the user specified a value in the multiaddrAPI
  const settingsAddress = Settings.getSync('daemon.multiAddrAPI')
  if (settingsAddress) return settingsAddress

  // Otherwise ask the binary wich one to use
  const binaryPath = getPathIPFSBinary()
  const multiAddr = execSync(`${binaryPath} config Addresses.API`)
  return `${multiAddr}`
}

/**
 * Set the multiAddr usable to connect to the local dameon via API.
 * It restores it to /ip4/127.0.0.1/tcp/5001
 */
export function setMultiAddrIPFSDaemon() {
  const binaryPath = getPathIPFSBinary()
  const multiAddr = execSync(`${binaryPath} config Addresses.API /ip4/127.0.0.1/tcp/5001`)
  return `${multiAddr}`
}

/**
 * getSiderusPeers returns a Promise that will download and return a list of
 * multiaddress (as str) of IPFS nodes from Siderus Network.
 */
export function getSiderusPeers() {
  return request({
    uri: "https://peers.siderus.io/ipfs.txt",
    headers: { 'User-Agent': `Lumpy/${pjson.version}` }
  }).then( res => {
    let peers
    // split the file by endlines
    peers = res.split(/\r?\n/)
    // remove empty lines
    peers = peers.filter(el => el.length > 0 )
    return Promise.resolve(peers)
  })
}
