# How to build Siderus Lumpy
This guide will help building Siderus Lumpy standalone app.

## Dependencies
Lumpy apps requires the following dependencies installed:

* Git
* IPFS ([Install guide here](https://ipfs.io/docs/install/))
* NodeJS ([Install guide here](https://nodejs.org/en/download/package-manager/))
* Yarn (`npm install -g yarn` will do it)

Ubuntu Linux Users instead needs specific packages to be installed:

```
# apt-get install libgtkextra-dev libgconf2-dev libnss3 libasound2 libxtst-dev
```

## Clone the source
First of all you need to clone the source code and install
the modules. Run the following commands to do so:

```bash
git clone https://github.com/Siderus/Lumpy.git
cd ../Lumpy
yarn
```

## Build
To build the standalone app into its own application we need to generate the
icons files, and then generate the binary/app files.

```
yarn build-icons
yarn build-app
```

This process will run automatically for you, and the final application will
be available in the `./build/` directory.
