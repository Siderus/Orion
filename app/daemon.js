/* eslint no-console:0 */

const { spawn, execSync } = require("child_process")

module.exports = {}

/**
 * startIPFSCommand will start IPFS go daemon, if installed.
 * return child process with IPFS daemon
 */
module.exports.startIPFSCommand = function startIPFSCommand() {
  const ipfs_process = spawn("ipfs", ["daemon"])

  ipfs_process.stdout.on("data", (data) => console.log(`IPFS: ${data}`))
  ipfs_process.stderr.on("data", (data) => console.log(`IPFS Error: ${data}`))
  ipfs_process.on("close", (exit) => console.log(`IPFS Closed: ${exit}`))

  return ipfs_process
}


/**
 * Returns the multiAddr usable to connect to the local dameon via API
 */
module.exports.getMultiAddrIPFSDaemon = function getMultiAddrIPFSDaemon(){
  let multiAddr = execSync('ipfs config Addresses.API')
  return `${multiAddr}`
}

/**
 * Set the multiAddr usable to connect to the local dameon via API.
 * It restores it to /ip4/127.0.0.1/tcp/5001
 */
module.exports.setMultiAddrIPFSDaemon = function setMultiAddrIPFSDaemon(){
  let multiAddr = execSync('ipfs config Addresses.API /ip4/127.0.0.1/tcp/5001')
  return `${multiAddr}`
}