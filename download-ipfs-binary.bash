#!/bin/bash

PLATFORM=""
BINARY_EXT=".tar.gz"

# one flag is expected
case "$1" in
  --win)  PLATFORM="windows" BINARY_EXT=".zip";;
  --mac)  PLATFORM="darwin";;
  --linux)  PLATFORM="linux";;
  *) # if is not provided, try to detect
    case "$OSTYPE" in
      darwin*)  PLATFORM="darwin";;
      linux*)   PLATFORM="linux";;
      msys*)    PLATFORM="windows";;
      cygwin*)    PLATFORM="windows";;
      *) # could not detect platform nor it was provided
          echo "Could not detect the operating system... \n"
          echo "    Try: $0 --platform \n"
          echo "    Where platform is exactly one of ['win','mac','linux']"
          echo "    Example: $0 --linux"
          exit 1
    esac
esac

IPFS_VERSION=`node -p "require('./package.json').ipfsVersion"`
echo "Downloading ipfs binary" $IPFS_VERSION "for" $PLATFORM

BINARY_URL="https://dist.ipfs.io/go-ipfs/"$IPFS_VERSION"/go-ipfs_"$IPFS_VERSION"_"$PLATFORM"-amd64"$BINARY_EXT
ZIPPED_BINARY="go-ipfs"$BINARY_EXT

# download the binary and save it as go-ipfs.zip or go-ipfs.tar.gz
curl -o ./$ZIPPED_BINARY $BINARY_URL
echo "Download complete"

rm -rf ./go-ipfs

if [ $BINARY_EXT == 'tar.gz' ]; then
  tar xf $ZIPPED_BINARY
else
  unzip $ZIPPED_BINARY
fi

rm -rf ./$ZIPPED_BINARY
echo "Cleanup complete"
