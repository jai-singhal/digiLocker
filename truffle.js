module.exports = {
     // See <http://truffleframework.com/docs/advanced/configuration>
     // to customize your Truffle configuration!
     networks: {
          // ganache: {
          //      host: "172.18.16.108",
          //      port: 7545,
          //      network_id: "*" // Match any network id
          // },
          development: {
               host: "localhost",
               port: 8545,
               network_id: "*" // Match any network id
          }
     },
     compilers: {
     solc: {
       version: "0.4.18"  // ex:  "0.4.20". (Default: Truffle's installed solc)
     }
  }
};
