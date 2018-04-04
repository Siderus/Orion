# How to build Siderus Orion
This guide will help building Siderus Orion standalone app.

## Dependencies
Orion apps requires the following dependencies installed:

* Git
* make
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
git clone https://github.com/Siderus/Orion.git
cd ../Orion
```

## Build packages
To build the standalone app into its own application we need to generate the
icons files, and then generate the binary/app files. We have one script which does both:

```
make build
```

This process will run automatically for you, and the final application will
be available in the `./build/` directory.

If you desire to build also for other platforms (macOS, Win and Linux Debian) consider running:

```
make build_all
```

## Make a new release

The process of making a new release is performed via a GitLab pipeline. No action is required. Instead the suggested procedure is:


1. Commit/merge the changes to master.
2. On GitHub, draft a new release with the tag version you are releasing (ex: version = `0.2.5` tag = `v0.2.5`)
3. Create a new PR to bump the version in the package.json file (ex: `0.2.5`)
4. On merge/push of the new bumping commit, it will automatically trigger GitLab to build and upload the pkgs. It may take time.
