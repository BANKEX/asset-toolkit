module.exports = {
  // Set contract ABI here:
  abi: require('./ISAOTest.json').abi,
  // Test factory settings:
  factoryAbi: require('./ISAOTestFactory.json').abi,
  factoryCode: require('./ISAOTestFactoryCode.json').bytecode,
  // List contracts for different networks here:
  contracts: {
    1 : '0x', // Mainnet
    2 : '0x', // Morden
    3 : '0x', // Ropsten
    //4 : '0x02a2f8482658a3da0bbe078f3c0316e94d00a148',   // Rinkeby
    // 5777: '0x51adcb8824579e930f3208e0d083f027b36ddd3f', // Ganache
    1528968107874: '0xe84e342b2e0322c1747c837d1fde231021391784' // Geth
  },
  // Set intervals in miliseconds
  intervals: {
    stageFetch: 5000,
    //pendingsFetch: 5000,
  }
}
