var repl = require('repl')
var Web3 = require('web3')
var fs = require('fs')

function interpreter(input, replContext, filename, callback) {
  input = input.trim();
  // cmd refers to one letter command
  var cmd, cmdArgs;
  let cmds = "hpemncq"

  // Figure out which command to execute
  if (input == ".exit") {
    cmd = "q";
  } else if (input == "help") {
    cmd = "h";
  // If second elem is not whitespace, assume its pure JS
  } else if (input.length > 1 && input[1] != " ") {
    cmd = "e"
    cmdArgs = input
  //warning: this bit *alters* cmd!
  } else if (input.length == 1 || input[1] == " ") {
    cmd = input[0];
    cmdArgs = input.slice(2).trim();
  }

  // Setup smart contract for inspection
  // VM state is not saved, it will use a new one for each function call
  var web3 = Web3.currentWeb3
  var abi = JSON.parse(fs.readFileSync('abi.json'))
  var from = Web3.currentAccount
  let deployed = new web3.eth.Contract(abi, replContext.address);
  var methods = deployed.methods

  // Perform commands that require state changes.
  switch (cmd) {
    case "h":
      console.log("h = help\ne = eval\np = print\nn = c = continue\nq = quit\nm <method> = run contract method\nTry 'web3.eth.accounts' or 'methods' or 'deployed' for your contract")
      break;
    case "p":
      console.log(replContext.state)
      break;
    case "e":
      var result = eval(cmdArgs)
      console.log(result)
      break;
    case "m":
      var method = input.split(" ")[1]
      console.log(methods)
      console.log(method)
      if (method) {
        console.log("Calling method...")
        var F = methods[method]
        console.log(F)
        callMethod(deployed, from, F, (res) => {
          console.log("\n--- RETURN VALUE ---")
          console.log(res)
          console.log("--------------------")
        })
      } else {

      }
      break;
    case "n":
    case "c":
      console.log("Continuing...")
      return replContext.repl.stop(callback);
    case "q":
      console.log("Quitting...")
      return replContext.repl.stop(callback);
  }

  callback();
};

// Evaluates a smart contract's method. Please only call
// read only methods!!! Modifying the smart contract storage
// in the middle of a transaction is dangerous.
//
// NO ARGS SUPPORTED. ENCOURAGED TO USE READ ONLY METHODS.
// @param deployed - smart contract instance
// @param from - address it is coming from
// @param method - function object corresponding to key in contract.methods
// @param cb - callback that takes result object
function callMethod(deployed, from, F, cb) {
  return F()
    .call({ from: from })
    .then((res) => {
      cb(res)
    })
}

module.exports = interpreter;
