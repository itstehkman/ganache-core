var repl = require('repl')
var Web3 = require('web3')
var fs = require('fs')

function interpreter(cmd, replContext, filename, callback) {
  cmd = cmd.trim();
  var originalCmd = cmd;
  var cmdArgs, splitArgs;

  if (cmd == ".exit") {
    cmd = "q";
  } else if (cmd == "help") {
    cmd = "h";
  }

  debugger;
  // Setup smart contract for inspection
  // VM state is not saved, it will use a new one for each function call
  var web3 = Web3.currentWeb3
  var abi = JSON.parse(fs.readFileSync('abi.json'))
  var from = Web3.currentAccount
  let deployed = new web3.eth.Contract(abi, replContext.address);
  var methods = deployed.methods

  //split arguments for commands that want that; split on runs of spaces
  splitArgs=cmd.trim().split(/ +/).slice(1);

  //warning: this bit *alters* cmd!
  if (cmd.length > 0) {
    cmdArgs = cmd.slice(1).trim();
    cmd = cmd[0];
  }

  // Perform commands that require state changes.
  switch (cmd) {
    case "h":
      console.log("h = help\ne = eval\np = print\nn = c = continue\nq = quit\nm = run read only contract method\nTry 'web3.eth.accounts' or 'methods' or 'deployed' for your contract")
      break;
    case "p":
      console.log(replContext.state)
      break;
    case "e":
      console.log(splitArgs)
      var result = eval(splitArgs.join(" "))
      console.log(result)
      break;
    case "m":
      console.log("Calling method...")
      var m = originalCmd.split(" ")[0]
      debugger;
      var F = methods[m]
      var result = callMethod(deployed, from, m)
      console.log(result)
      break;
    case "n":
    case "c":
      console.log("Continuing...")
      return replContext.repl.stop(callback);
    case "q":
      console.log("Quitting...")
      return replContext.repl.stop(callback);
    default:
      console.log(originalCmd)
      var result = eval(originalCmd)
      console.log(result)
  }

  callback();
};

// Evaluates a smart contract's method. Please only call
// read only methods!!! Modifying the smart contract storage
// in the middle of a transaction is dangerous.
//
// NO ARGS SUPPORTED. ENCOURAGED TO USE READ ONLY METHODS.
// @param deployed - smart contract instance
// @param method - function object corresponding to key in contract.methods
function callMethod(deployed, from, F) {
  F().send({ from: from})
}

module.exports = interpreter;
