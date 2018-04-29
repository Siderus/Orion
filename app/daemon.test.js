import * as daemon from './daemon'

global.IPFS_REPO_PATH = '/custom/path/to/ipfs'

jest.mock('electron-settings', () => {
  const getSyncMock = jest.fn()
    .mockReturnValueOnce(null)
    .mockReturnValueOnce('/custom/path/to/ipfs')

  return {
    getSync: getSyncMock
  }
})

jest.mock('electron', () => {
  const fakeDir = jest.fn().mockReturnValue('not-existing-dir')
  return {
    app: {
      getPath: fakeDir
    }
  }
})

describe('daemon.js', () => {
  describe('isIPFSInitialised', () => {
    it('will correctly return if a repo conf does not exist', () => {
      const bool = daemon.isIPFSInitialised()
      expect(bool).toBe(false)
    })
  })

  describe('getSiderusPeers', () => {
    it('should download list of peers, not empty', () => {
      const prom = daemon.getSiderusPeers()

      expect(prom).resolves.not.toContain('')// removes empty lines
    })
  })
})
