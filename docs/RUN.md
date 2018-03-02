# How to run Siderus Lumpy
This guide explains how to run Lumpy as an electron app directly from source code.

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

## Run Lumpy
After the process is completed, you can run the electron app
by executing:

```
yarn start
```
