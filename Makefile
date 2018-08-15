# we need the go-ipfs binary
IPFS_VERSION := $(shell node -p "require('./package.json').ipfsVersion")
IPFS_BINARY_NAME ?= go-ipfs_${IPFS_VERSION}_${TARGET}-amd64${BINARY_EXT}
BINARY_URL ?= https://dist.ipfs.io/go-ipfs/${IPFS_VERSION}/${IPFS_BINARY_NAME}
# we need the fs-repo-migrations binary
REPO_MIGRATIONS_VERSION := $(shell node -p "require('./package.json').ipfsRepoMigrationsVersion")
REPO_MIGRATIONS_BINARY_NAME ?= fs-repo-migrations_${REPO_MIGRATIONS_VERSION}_${TARGET}-amd64${BINARY_EXT}
REPO_MIGRATIONS_BINARY_URL ?= https://dist.ipfs.io/fs-repo-migrations/${REPO_MIGRATIONS_VERSION}/${REPO_MIGRATIONS_BINARY_NAME}
NODE_ENV ?= development
GH_TOKEN ?=

ifeq ($(OS),Windows_NT)
	BINARY_EXT := .zip
	DECOMPRESSOR := unzip
	TARGET := windows
	BUILD_ARGS += --windows
else
	BINARY_EXT := .tar.gz
	DECOMPRESSOR := tar xf
	UNAME_S ?= $(shell uname -s)
	ifeq ($(UNAME_S),Linux)
		TARGET := linux
		BUILD_ARGS += --linux
	endif
	ifeq ($(UNAME_S),Darwin)
		TARGET := darwin
		BUILD_ARGS += --mac --x64
	endif
endif

_test_variables:
	@test -n "$(TARGET)" || (echo "Variable TARGET not set"; exit 1)
	@test -n "$(NODE_ENV)" || (echo "Variable TARGET not set"; exit 1)
	@test -n "$(IPFS_VERSION)" || (echo "Variable IPFS_VERSION not set"; exit 1)
	@test -n "$(BINARY_URL)" || (echo "Variable BINARY_URL not set"; exit 1)
	@test -n "$(REPO_MIGRATIONS_VERSION)" || (echo "Variable REPO_MIGRATIONS_VERSION not set"; exit 1)
	@test -n "$(REPO_MIGRATIONS_BINARY_URL)" || (echo "Variable REPO_MIGRATIONS_BINARY_URL not set"; exit 1)
	@test -n "$(DECOMPRESSOR)" || (echo "Variable DECOMPRESSOR not set"; exit 1)
	@test -n "$(BUILD_ARGS)" || (echo "Variable BUILD_ARGS not set"; exit 1)
.PHONY: _test_variables

clean:
	rm -rf .cache
	rm -rf build
	rm -rf go-ipfs
	rm -rf coverage
	rm -rf node_modules
	rm -rf repo
	rm -rf fs-repo-migrations
.PHONY: clean

# Yarn packages, tests and linting
dep:
	yarn --link-duplicates --pure-lockfile
.PHONY: dep

run: dep
	test -s go-ipfs/ipfs || "$(MAKE)" prepare_ipfs_bin
	test -s fs-repo-migrations/fs-repo-migrations || "$(MAKE)" prepare_repo_migrations_bin
	rm -rf .cache
	yarn start
.PHONY: run

lint: dep
	yarn lint
.PHONY: lint

test: dep
	yarn test
.PHONY: test

# Building the packages for multiple platforms
build_icons: dep
	./node_modules/.bin/icon-gen -i ./docs/logo.svg -o ./docs/ -m ico,icns -n ico=logo,icns=logo
.PHONY: build_icons

# uses electron-compile to build the app and ensures icons are there
_prepkg: dep _test_variables
	mkdir -p build
	cp ./docs/logo.icns ./build/
	cp ./docs/logo.ico ./build/
	NODE_ENV=${NODE_ENV} ./node_modules/.bin/electron-compile app
.PHONY: _prepkg

prepare_binaries: prepare_ipfs_bin prepare_repo_migrations_bin
.PHONY: prepare_binaries

# Download the go-ipfs binary from the URL
prepare_ipfs_bin: _test_variables
	curl -o ./${IPFS_BINARY_NAME} ${BINARY_URL}
	rm -rf ./go-ipfs
	$(DECOMPRESSOR) ${IPFS_BINARY_NAME}
	rm ${IPFS_BINARY_NAME}
.PHONY: prepare_ipfs_bin

# Download the fs-repo-migrations binary from the URL
prepare_repo_migrations_bin: _test_variables
	curl -o ./${REPO_MIGRATIONS_BINARY_NAME} ${REPO_MIGRATIONS_BINARY_URL}
	rm -rf ./fs-repo-migrations
	$(DECOMPRESSOR) ${REPO_MIGRATIONS_BINARY_NAME}
	rm ${REPO_MIGRATIONS_BINARY_NAME}
.PHONY: prepare_repo_migrations_bin

build_unpacked: _test_variables prepare_binaries _prepkg
	./node_modules/.bin/build ${BUILD_ARGS} --dir
.PHONY: build_unpacked

build: _test_variables prepare_binaries _prepkg
	./node_modules/.bin/build ${BUILD_ARGS}
.PHONY: build

build_all: clean
	$(MAKE) build -e OS="Darwin" -e UNAME_S="Darwin"
	$(MAKE) build -e OS="Linux" -e UNAME_S="Linux"
	$(MAKE) build -e OS="Windows_NT"
.PHONY: build_all

release: _test_variables prepare_binaries _prepkg
	@test -n "$(GH_TOKEN)" || (echo "Variable GH_TOKEN not set"; exit 1)
	./node_modules/.bin/build ${BUILD_ARGS} --publish onTagOrDraft
.PHONY: release

release_all: clean
	@test -n "$(GH_TOKEN)" || (echo "Variable GH_TOKEN not set"; exit 1)
	$(MAKE) release -e OS="Darwin" -e UNAME_S="Darwin"
	$(MAKE) release -e OS="Linux" -e UNAME_S="Linux"
	$(MAKE) release -e OS="Windows_NT"
.PHONY: release_all
