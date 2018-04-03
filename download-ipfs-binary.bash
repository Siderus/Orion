#!/bin/bash
set -e

PLATFORM=""
BINARY_EXT=".tar.gz"
IPFS_VERSION=`node -p "require('./package.json').ipfsVersion"`
BINARY_URL=""
ZIPPED_BINARY=""

# one flag is expected
case "$1" in
  --win)  PLATFORM="windows" BINARY_EXT=".zip";;
  --mac)  PLATFORM="darwin";;
  --linux)  PLATFORM="linux";;
  *) # if is not provided, try to detect
    case "$OSTYPE" in
      darwin*)  PLATFORM="darwin";;
      linux*)   PLATFORM="linux";;
      msys*)    PLATFORM="windows" BINARY_EXT=".zip";;
      cygwin*)    PLATFORM="windows" BINARY_EXT=".zip";;
      *) # could not detect platform nor it was provided
          echo "Could not detect the operating system... \n"
          echo "    Try: $0 --platform \n"
          echo "    Where platform is exactly one of ['win','mac','linux']"
          echo "    Example: $0 --linux"
          exit 1
    esac
esac

# Updating the variables with the right content
BINARY_URL="https://dist.ipfs.io/go-ipfs/${IPFS_VERSION}/go-ipfs_${IPFS_VERSION}_${PLATFORM}-amd64${BINARY_EXT}"
ZIPPED_BINARY="go-ipfs${BINARY_EXT}"

# download the binary and save it as go-ipfs.zip or go-ipfs.tar.gz
echo "Downloading ipfs binary" $IPFS_VERSION "for" $PLATFORM
curl -o ./$ZIPPED_BINARY $BINARY_URL
echo "Download complete"

# cleanup previous download
rm -rf ./go-ipfs
# unzip the binary
case "$ZIPPED_BINARY" in
  *tar.gz*)
    tar xf $ZIPPED_BINARY
    ;;
  *zip*)
    unzip $ZIPPED_BINARY
    ;;
esac

rm -rf $ZIPPED_BINARY
echo "Cleanup complete"
