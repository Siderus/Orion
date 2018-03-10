import * as api from './api'
import * as daemon from './daemon'
import ipfsApi from 'ipfs-api'
import multiaddr from 'multiaddr'

jest.mock('./daemon', ()=>{
  return {
    getMultiAddrIPFSDaemon: jest.fn().mockReturnValue('my-address')
  }
})
jest.mock('ipfs-api', ()=>{
  return jest.fn().mockReturnValue('new-instance')
})

const ERROR_IPFS_UNAVAILABLE = 'IPFS NOT AVAILABLE'

describe('api.js', ()=>{
  describe('startIPFS', ()=>{
    it('should return the existing instance if it is defined', ()=>{
      // arrange
      api.setClientInstance('existing-instance')
      // act
      return api.startIPFS()
        .then(result => {
          // assert
          expect(result).toBe('existing-instance')
        })
    })

    it('should create a new instance', ()=>{
      // arrange
      api.setClientInstance(null)
      // act
      return api.startIPFS()
        .then(result => {
          // assert
          expect(daemon.getMultiAddrIPFSDaemon).toHaveBeenCalled()
          expect(ipfsApi).toBeCalledWith('my-address')
          expect(result).toBe('new-instance')
        })
    })
  })

  describe('unpinObject', ()=>{
    it('should reject when IPFS is not started', ()=>{
      // arrange
      api.setClientInstance(null)
      // act
      return api.unpinObject()
        .catch(err => {
          // assert
          expect(err).toBe(ERROR_IPFS_UNAVAILABLE)
        })
    })

    it('should unpin the hash recursively', ()=>{
      // arrange
      const pinRmMock = jest.fn().mockReturnValue(Promise.resolve('removed'))
      api.setClientInstance({
        pin: {
          rm: pinRmMock,
        }
      })
      // act
      return api.unpinObject('fake-hash')
        .then(result => {
          // assert
          expect(result).toBe('removed')
          expect(pinRmMock).toHaveBeenCalledWith('fake-hash', { recursive: true })
        })
    })
  })

  describe('connectTo', ()=>{
    it('should reject when IPFS is not started', ()=>{
      api.setClientInstance(null)
      return api.connectTo('/ip4/0.0.0.0/tcp/4001/')
        .catch(err => {
          expect(err).toBe(ERROR_IPFS_UNAVAILABLE)
        })
    })

    it('should connect to a node given a multiaddr', ()=>{
      const address = "/ip4/0.0.0.0/tcp/4001/ipfs/QmXbUn6BD4"

      // mock
      const connect = jest.fn().mockReturnValue(Promise.resolve())
      api.setClientInstance({
        swarm: {
          connect
        }
      })

      // run
      return api.connectTo(address).then(()=>{
        expect(connect).toHaveBeenCalledWith(multiaddr(address))
      })
    })
  })

  describe('addFileFromFSPath', ()=>{
    it('should reject when IPFS is not started', ()=>{
      // arrange
      api.setClientInstance(null)
      // act
      return api.addFileFromFSPath('./fake-path')
        .catch(err => {
          // assert
          expect(err).toBe(ERROR_IPFS_UNAVAILABLE)
        })
    })

    it('should add the file/dir recursively and with a wrapper', ()=>{
      // arrange
      const addFromFsMock = jest.fn()
        .mockReturnValue(Promise.resolve([
          {
            hash: 'QmRgutAxd8t7oGkSm4wmeuByG6M51wcTso6cubDdQtu001',
            path: 'textfiles/foo.txt',
            size: 30
          }, {
            hash: 'QmRgutAxd8t7oGkSm4wmeuByG6M51wcTso6cubDdQtu002',
            path: 'textfiles',
            size: 50
          }
        ]))

      const objectPutMock = jest.fn()
        .mockReturnValue(Promise.resolve({
          toJSON: ()=>{

            return {
              multihash: 'QmRgutAxd8t7oGkSm4wmeuByG6M51wcTso6cubDdQtu003',
              size: 60
            }
          }
        }))

      const pinAddMock = jest.fn().mockReturnValue(Promise.resolve())
      const pinRmMock = jest.fn().mockReturnValue(Promise.resolve())

      api.setClientInstance({
        util: {
          addFromFs: addFromFsMock
        },
        object: {
          put: objectPutMock
        },
        pin: {
          add: pinAddMock,
          rm: pinRmMock
        }
      })
      // act
      return api.addFileFromFSPath('./textfiles')
        .then(result => {
          // assert
          expect(addFromFsMock).toHaveBeenCalledWith('./textfiles', { recursive: true })
          expect(objectPutMock).toHaveBeenCalledWith({
            Data: new Buffer('\u0008\u0001'),
            Links: [{
              Hash: 'QmRgutAxd8t7oGkSm4wmeuByG6M51wcTso6cubDdQtu002',
              Name: 'textfiles',
              Size: 50
            }]
          })
          expect(pinAddMock).toHaveBeenCalledWith('QmRgutAxd8t7oGkSm4wmeuByG6M51wcTso6cubDdQtu003')
          expect(pinRmMock).toHaveBeenCalledWith('QmRgutAxd8t7oGkSm4wmeuByG6M51wcTso6cubDdQtu002')
          expect(result).toEqual([
            {
              hash: 'QmRgutAxd8t7oGkSm4wmeuByG6M51wcTso6cubDdQtu001',
              path: 'textfiles/foo.txt',
              size: 30
            }, {
              hash: 'QmRgutAxd8t7oGkSm4wmeuByG6M51wcTso6cubDdQtu002',
              path: 'textfiles',
              size: 50
            }, {
              hash: 'QmRgutAxd8t7oGkSm4wmeuByG6M51wcTso6cubDdQtu003',
              path: '',
              size: 60
            }
          ])
        })
    })
  })

  describe('promiseIPFSReady', ()=>{
    it('It should times out', ()=>{
      const id = jest.fn().mockImplementation(function() {
        return Promise.reject()
      })
      api.setClientInstance({id})
      let prom = api.promiseIPFSReady(5)
      expect(prom).rejects.toThrow(api.ERROR_IPFS_TIMEOUT)
      return
    })

    it('It should return if API available', ()=>{
      const id = jest.fn().mockImplementation(function() {
        return Promise.resolve()
      })
      api.setClientInstance({id})
      let prom = api.promiseIPFSReady(5)
      expect(prom).rejects
      return
    })
  })
})
