![Logo](docs/logo.png)

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com)
[![codebeat badge](https://codebeat.co/badges/55b6d66b-3b3f-41b1-a26f-9a79209e7feb)](https://codebeat.co/projects/github-com-koalalorenzo-Orion-master) [![Build Status](https://travis-ci.org/Siderus/Orion.svg?branch=master)](https://travis-ci.org/Siderus/Orion)

# Siderus Orion - Easy to use IPFS desktop client
Siderus Orion is an easy to use [inter planetary file system](http://ipfs.io) desktop
client. It allows you to easily add, share, remove files and manage the IPFS
repository from an UI. It includes all the dependencies needed, and works on
every major operative system.
It is developed and maintained by [Siderus](https://siderus.io).

![Screenshots](docs/main.png)

## Download
To download the latest version, you can [check the latest release page](https://github.com/Siderus/Orion/releases/latest)

We support the following operative systems, but feel free to try it on different ones:

 * macOS (latest)
 * Windows 10
 * GNU/Linux

### Ubuntu / Debian Repository
To download Siderus Orion for Ubuntu, you can add Siderus debian reposiotry:

```
wget -qO - https://get.siderus.io/key.public.asc | sudo apt-key add -
echo "deb https://get.siderus.io/ apt/" | sudo tee -a /etc/apt/sources.list.d/siderus.list
sudo apt update
```

And then you can install the `orion` package by running:

```
sudo apt install orion
```

## About the project
The user should be able to manage the repository by adding, downloading and
removing files from the node using an GUI instead of CLI or web interface.

The main goals of this project are:

* Help embracing IPFS by providing an easy to use and intuitive interface.
* Help the user understanding IPFS and the decentralised web.
* Show only what is **important** to the user (Ex: the name of the
files/directory, not just CID)
* Help the user achieving their goals using IPFS instead of traditional tools (Download, upload, update)

### Features:

- [x] Manages the files pinned in the repository (Not just objects and CID)
- [x] Allows _Downloads_/_Uploads_ to the IPFS node
- [x] Integrates with OS actions like drag-and-drop or URI
- [x] Provides information and statistics about the repository and the daemon
- [x] Integrates with [Siderus](https://siderus.io/) IPFS for faster network and gateway connections
- [x] Allows to maintain a daemon from the interface
- [ ] Integration external services/tools for encryption and content distribution

## Learn more
You can find more documentation in the following pages:

 * [How to run Siderus Orion](docs/RUN.md)
 * [How to build Siderus Orion standalone App](docs/BUILD.md)
 * ...More in [docs directory](https://github.com/Siderus/Orion/tree/master/docs/)

## How To Help
Note: This project is not ready for a stable use. Help is needed!
It is developed using *Electron* and *React*, but we have a lot of things to do!

You can contribute by checking what should be done in the
[Issue Board](https://gitlab.com/siderus/Orion/boards?=).

If you need to report something, please send an email to [hello@siderus.io](mailto:hello@siderus.io) or
contact us directly in the [chatroom on Matrix](https://riot.im/app/#/room/#orion:matrix.org)!
