#!/bin/bash

OUT="$PWD/repo"
# KEY=""

_init # Init the repo

for distro in xenial bionic cosmic; do
  add_dist "$distro" "Orion-$distro" "Orion Debian Packages"
  add_comp "$distro" stable
  add_comp "$distro" beta
  add_arch "$distro" amd64
  add_arch "$distro" i386
done

deb=$(dir -w 1 "$PWD/build" | grep ".deb$") # get deb from build folder
add_pkg_file "$PWD/build/$deb" amd64 # add the deb

fin # Update/create repo
