import * as daemon from './daemon'
import Settings from 'electron-settings'

jest.mock('electron-settings', () => {
  const getSyncMock = jest.fn()
    .mockReturnValueOnce(null)
    .mockReturnValueOnce(null)
    .mockReturnValueOnce('/custom/path/to/ipfs')

  return {
    getSync: getSyncMock
  }
})

describe('daemon.js', () => {
  describe('getPathIPFSBinary', () => {
    it('should return the default value when the setting is not defined', () => {
      // arrange
      Object.defineProperty(process, 'platform', {
        value: 'win32'
      })
      // act
      const path = daemon.getPathIPFSBinary()
      // assert
      expect(Settings.getSync).toHaveBeenCalledWith('daemon.pathIPFSBinary')
      expect(path).toBe('ipfs')
    })

    it('should return the default value for darwin', () => {
      // arrange
      Object.defineProperty(process, 'platform', {
        value: 'darwin'
      })
      // act
      const path = daemon.getPathIPFSBinary()
      // assert
      expect(Settings.getSync).toHaveBeenCalledWith('daemon.pathIPFSBinary')
      expect(path).toBe('/usr/local/bin/ipfs')
    })

    it('should return the setting when it is defined', () => {
      // act
      const path = daemon.getPathIPFSBinary()
      // assert
      expect(Settings.getSync).toHaveBeenCalledWith('daemon.pathIPFSBinary')
      expect(path).toBe('/custom/path/to/ipfs')
    })
  })

  describe('getSiderusPeers', () => {
    it('should download list of peers, not empty', () => {
      const prom = daemon.getSiderusPeers()

      expect(prom).resolves.not.toContain('')// removes empty lines
    })
  })
})
