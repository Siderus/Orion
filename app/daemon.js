/* eslint no-console:0 */

import { spawn, execSync } from "child_process"

/**
 * startIPFSCommand will start IPFS go daemon, if installed.
 * return child process with IPFS daemon
 */
export function startIPFSCommand() {
  const ipfs_process = spawn("ipfs", ["daemon"])

  ipfs_process.stdout.on("data", (data) => console.log(`IPFS: ${data}`))
  ipfs_process.stderr.on("data", (data) => console.log(`IPFS Error: ${data}`))
  ipfs_process.on("close", (exit) => console.log(`IPFS Closed: ${exit}`))

  return ipfs_process
}

/**
 * Returns the multiAddr usable to connect to the local dameon via API
 */
export function getMultiAddrIPFSDaemon(){
  let multiAddr = execSync('ipfs config Addresses.API')
  return `${multiAddr}`
}

/**
 * Set the multiAddr usable to connect to the local dameon via API.
 * It restores it to /ip4/127.0.0.1/tcp/5001
 */
export function setMultiAddrIPFSDaemon(){
  let multiAddr = execSync('ipfs config Addresses.API /ip4/127.0.0.1/tcp/5001')
  return `${multiAddr}`
}