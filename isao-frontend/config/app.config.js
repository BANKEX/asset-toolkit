module.exports = {
  // Set contract ABI here:
  abi: require('./ISAOTest.json').abi,
  // List contracts for different networks here:
  contracts: {
    1 : '0x', // Mainnet
    2 : '0x', // Morden
    3 : '0x', // Ropsten
    4 : '0x02a2f8482658a3da0bbe078f3c0316e94d00a148',   // Rinkeby
    5777: '0x345ca3e014aaf5dca488057592ee47305d9b3e10'  // Ganache
  },
  // Set intervals in miliseconds
  intervals: {
    //tokenFetch: 10000,
    //pendingsFetch: 5000,
  }
}
