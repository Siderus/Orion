import * as daemon from './daemon'
import Settings from 'electron-settings'

jest.mock('electron-settings', function () {
  const getSyncMock = jest.fn()
    .mockReturnValueOnce(null)
    .mockReturnValueOnce('/custom/path/to/ipfs')

  return {
    getSync: getSyncMock
  }
})

describe('daemon.js', function () {
  describe('getPathIPFSBinary', function () {
    it('should return the default value when the setting is not defined', () => {
      // act
      const path = daemon.getPathIPFSBinary()
      // assert
      expect(Settings.getSync).toHaveBeenCalledWith('daemon.pathIPFSBinary')
      expect(path).toBe('/usr/local/bin/ipfs')
    })

    it('should return the setting when it is defined', function () {
      // act
      const path = daemon.getPathIPFSBinary()
      // assert
      expect(Settings.getSync).toHaveBeenCalledWith('daemon.pathIPFSBinary')
      expect(path).toBe('/custom/path/to/ipfs')
    })
  })
})
