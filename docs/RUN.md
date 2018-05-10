# How to run Siderus Orion
This guide explains how to run Orion as an electron app directly from source code.

## Dependencies
Orion apps requires the following dependencies installed:

* Git
* IPFS ([Install guide here](https://ipfs.io/docs/install/))
* NodeJS ([Install guide here](https://nodejs.org/en/download/package-manager/))
* Yarn (`npm install -g yarn` will do it)

Ubuntu Linux Users instead needs specific packages to be installed:

```
apt-get install libgtkextra-dev libgconf2-dev libnss3 libasound2 libxtst-dev gconf2 gconf-service libnotify4 libappindicator1 libxtst6 libnss3 libxss1
```

Windows users need to install the [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools) package, which comes with
Visual C++ Build Tools and Python 2.7:

```
yarn global add --production windows-build-tools
```

## Clone the source
First of all you need to clone the source code and install
the modules. Run the following commands to do so:

```bash
git clone https://github.com/Siderus/Orion.git
cd ../Orion
```

## Run Orion
After the process is completed, you can run the electron app
by executing:

```
make run
```
