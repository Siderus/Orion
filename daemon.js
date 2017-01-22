/* eslint no-console:0 */

const { spawn } = require("child_process")

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
