var Ganache = require('.');
var Web3 = require('web3');
var solc = require('solc')
var fs = require('fs')

var web3 = new Web3()
let gasLimit = '0xfffffffffff'

var provider = Ganache.provider({
  gasLimit: gasLimit
});
web3.setProvider(provider);
// ugly, do not do set on module level. is a workaround to save provider
Web3.currentWeb3 = web3

var unlockedAccounts = provider.manager.state.unlocked_accounts
let account = Object.keys(unlockedAccounts)[0]
Web3.currentAccount = account
console.log(account)

//let account = web3.eth.accounts.create()
//web3.eth.accounts.wallet.add(account)

// Setup Contract
var contractPath = 'test/DebugContract.sol'
var contractName = ':DebugContract'

var f = fs.readFileSync(contractPath)
var input = String(f)
var compiledContract = solc.compile(input, 1)

var abi = compiledContract.contracts[contractName].interface;
fs.writeFileSync('abi.json', abi)
abi = JSON.parse(abi)
var bytecode = compiledContract.contracts[contractName].bytecode;

//Patch bytecode with debug opcodes if needed
var debugOpcode = '46'
var occurences = bytecode.split('60b660de55').length - 1
bytecode = bytecode.replace(/60b660de55/gi, '60b660de55' + debugOpcode)
var occurences = bytecode.split('60b660de55').length - 1
console.log(occurences + " debug statements added")

// Deploy Contract
let Contract = new web3.eth.Contract(abi);

let gasEstimate = web3.eth.estimateGas({data: bytecode});

Contract.deploy({
  data: '0x'+ bytecode
}).send({
  from: account,
  gas: '0xffffffffff',
  gasPrice: '0x3000000'
})
.on('error', function(error){
  console.log('error: ' + error)
})
.on('transactionHash', function(transactionHash){
  console.log('txHash: ' + transactionHash)
})
.on('receipt', function(receipt){
  console.log('contractAddress')
  console.log(receipt.contractAddress) // contains the new contract address
})
.on('confirmation', function(confirmationNumber, receipt){
  //console.log('confirmation')
  //console.log(confirmationNumber) // instance with the new contract address
  //console.log(receipt) // instance with the new contract address
})
.then((newContractInstance) => {
  console.log('new contract')
  console.log(newContractInstance.options.address) // instance with the new contract address
  address = newContractInstance.options.address

  Web3.currentContractAddress = address

  // TODO: interactive input
  let method = 'setValue'

  // Call a contract method
  newContractInstance.methods[method](0).send({
    from: account
  }).then(function(receipt) {
    //console.log(receipt);
  })
})
