module.exports = {
  // Set contract ABI here:
  abi: require('./MultiToken.json').abi,
  // List contracts for different networks here:
  contracts: [
    'none',
    '0xc124b6ef86917d79d7dbdb6c53dd176a5d33ee5e',   // Mainnet
    'Morden',
    'Ropsten',
    '0x02a2f8482658a3da0bbe078f3c0316e94d00a148',   // Rinkeby
  ],
  // Set intervals in miliseconds
  intervals: {
    tokenFetch: 10000,
    pendingsFetch: 5000,
  }
}
