require('dotenv').config();
var HDWalletProvider = require("truffle-hdwallet-provider");
var NEMONIC = process.env["NEMONIC"];
var tokenKey = process.env["ENDPOINT_KEY"];

module.exports = {
     contracts_directory: "./contracts/",
     networks: {
          rinkeby:{
               host: "localhost",
               provider: function() {
                 return new HDWalletProvider(NEMONIC, "https://rinkeby.infura.io/v3/" + tokenKey);
               },
               network_id: 4, 
               gas : 6700000,
               gasPrice : 10000000000
          },
          development: {
               host: "localhost",
               port: 8545,
               network_id: "*" // Match any network id
          }
     },
     compilers: {
     solc: {
          optimizer: {
               enabled: true,
               runs: 200
          },
          version: "0.5.17"  // ex:  "0.4.20". (Default: Truffle's installed solc)
     }
  }
};
