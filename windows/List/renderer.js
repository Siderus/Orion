// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { dialog, app } = require('electron').remote
let ipfsAPI = require('ipfs-api')

let ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001')

console.log(ipfs);