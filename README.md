# Lumpy - Easy and KISS desktop client for IPFS
Lumpy is an easy and KISS [inter planetary file system](http://ipfs.io) desktop
client. It allows you to easily add and remove files, and manage the repository
and the daemon.

[![Stories in Ready](https://badge.waffle.io/koalalorenzo/Lumpy.png?label=ready&title=Ready)](https://waffle.io/koalalorenzo/Lumpy)
![StorageList Screenshot](.readme/StorageList.png)

**Note**: This page and project is still work in progress!

## Goals and Features
This app provides and easy to use and KISS client to IPFS for _any OS_.
The user should be able to manage the repository by adding, downloading and
removing files from the node.

The main goals of this project are:

* explains and **educates** the user about the perks of using IPFS
* shows only what is **important** to the user (Sometimes the name of the
file/Directory, not hash. KISS, but configurable)
* Help users to acheive their goals using IPFS instead of traditioanl tools.

### Features:

* Manages the files pinned in the repository (Not just objects)
* Allows _Downloads_/_Uploads_ to the IPFS node
* Integrates with OS actions like drag-and-drop or URI
* Provides information and statistics about the repository and the daemon
* Allows to maintain a daemon from the interface
* Possible Encryption/Decryption of files

## How Help

Note: This project is not ready for a stable use. Help is needed!
It is developed using *Electron* and *React*, but we have a lot of things to do!

You can contribute by checkign what should be done in the
[Waffle Board](https://waffle.io/koalalorenzo/Lumpy).

## How to use
At the moment Lumpy works only on macOS and Linux, and it requires IPFS to be
installed.

```bash
# 1. Install IPFS on macOS via Homebrew
brew install ipfs
# 2. Clone the repository
git clone https://github.com/koalalorenzo/Lumpy.git
cd ./Lumpy
# 3. Install dependencies
npm install
# 4. Run the app
npm start
```

#### License [GPL 3](LICENSE.md)
