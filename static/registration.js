var contract = new web3.eth.Contract(abi, contractAddress, {
    from: address,
    gasLimit: 3000000,
});

contract.methods.isalreadyRegisteredUser().call().then(function(obj){
});