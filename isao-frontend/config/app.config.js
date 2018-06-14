module.exports = {
  // Set contract ABI here:
  abi: require('./ISAOTest.json').abi,
  // List contracts for different networks here:
  contracts: {
    1 : '0x', // Mainnet
    2 : '0x', // Morden
    3 : '0x', // Ropsten
    4 : '0x02a2f8482658a3da0bbe078f3c0316e94d00a148',   // Rinkeby
    5777: '0x75c35c980c0d37ef46df04d31a140b65503c0eed'  // Ganache
  },
  // Set intervals in miliseconds
  intervals: {
    stageFetch: 5000,
    //pendingsFetch: 5000,
  }
}
