var Ganache = require('.');
var Web3 = require('web3');
var solc = require('solc');
var fs = require('fs');
var VM = require('ethereumjs-vm')

let gasLimit = '0xfffffffffff'

var vm = new VM()

// web 3 setup
var web3 = new Web3()
var provider = Ganache.provider({
  gasLimit: gasLimit
})
web3.setProvider(provider);

// accounts setup
var unlockedAccounts = provider.manager.state.unlocked_accounts
let account = Object.keys(unlockedAccounts)[0]
console.log(account)

// Setup Contract
var contractPath = 'test/DebugContract.sol'
var contractName = ':DebugContract'

var f = fs.readFileSync(contractPath)
var input = String(f)
var compiledContract = solc.compile(input, 1)

var abi = compiledContract.contracts[contractName].interface;
abi = JSON.parse(abi)
var bytecode = compiledContract.contracts[contractName].bytecode;

// deploy contract
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
