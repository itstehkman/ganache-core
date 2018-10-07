var Ganache = require('.');
var Web3 = require('web3');
var solc = require('solc')
var fs = require('fs')
var VM = require('ethereumjs-vm')

var web3 = new Web3()
var vm = new VM()
//let gasLimit = parseInt('0xfffffffffff')
let gasLimit = '0xfffffffffff'

var provider = Ganache.provider({
  vm: vm,
  gasLimit: gasLimit
});
web3.setProvider(provider);

var unlockedAccounts = provider.manager.state.unlocked_accounts
let account = Object.keys(unlockedAccounts)[0]
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
abi = JSON.parse(abi)
var bytecode = compiledContract.contracts[contractName].bytecode;
debugger;

// Patch bytecode with debug opcodes if needed
// var debugOpcode = '46'
// var occurences = bytecode.split('60b660de55').length - 1
// bytecode = bytecode.replace(/60b660de55/gi, '60b660de55' + debugOpcode)
// var occurences = bytecode.split('60b660de55').length - 1
// console.log(occurences + " debug statements added")

// Deploy Contract
let Contract = new web3.eth.Contract(abi);

let gasEstimate = web3.eth.estimateGas({data: bytecode});

gasEstimate.then(function(estimate) {
  console.log(estimate)
  Contract.deploy({
    data: '0x'+ bytecode
  }).send({
    from: account,
    gas: '0xffffffffff',
    gasPrice: '0x3000000'
  })
})

//gasEstimate.then(function(estimate) {
//  Contract.deploy({
//    data: '0x'+ bytecode,
//    //gas: Buffer.from(Number(estimate).toString('16'), 'hex')
//  }).send({
//    from: account,
//    gas: 1500000,
//    gasPrice: '30000'
//  }, function(error, transactionHash){
//    console.log('error txHash')
//    console.log(error)
//    console.log(transactionHash)
//  })
//    .on('error', function(error){ console.log('error: ' + error) })
//    .on('transactionHash', function(transactionHash){
//      console.log('txHash: ' + transactionHash)
//    })
//    .on('receipt', function(receipt){
//      console.log('contractAddress')
//      console.log(receipt.contractAddress) // contains the new contract address
//    })
//    .on('confirmation', function(confirmationNumber, receipt){
//      console.log(newContractInstance.options.address) // instance with the new contract address
//    })
//    .then(function(newContractInstance){
//      console.log(newContractInstance.options.address) // instance with the new contract address
//    });
//})
