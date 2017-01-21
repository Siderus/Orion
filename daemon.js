const { app } = require('electron')
const path = require('path')
const ipfs = require('ipfs')

const IPFSRepoPath = path.join(app.getPath("userData"), "./ipfs/");

const startAndGetIPFS = function startAndGetIPFS() {
    const node = new IPFS(IPFSRepoPath)

    // Init the repo if not there
    node.init({ emptyRepo: !fs.existsSync(IPFSRepoPath), bits: 2048 }, (err) => {
        console.log(err);
    })

    return node
}

module.exports = {
    startAndGetIPFS,
    IPFSRepoPath
}