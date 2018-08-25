import * as daemon from './daemon'

global.IPFS_REPO_PATH = '/custom/path/to/ipfs'

jest.mock('./stats', () => {
  return {
    trackEvent: jest.fn().mockReturnValue(Promise.resolve())
  }
})

jest.mock('electron-settings', () => {
  const getMock = jest.fn()
    .mockReturnValueOnce(null)
    .mockReturnValueOnce('/custom/path/to/ipfs')

  return {
    get: getMock
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
})
