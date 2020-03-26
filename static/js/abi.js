var abi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "_useraddress",
				"type": "address"
			}
		],
		"name": "alreadyRegistred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "_firstName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "_lastName",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "_email",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "enum digiLocker.userType",
				"name": "utype",
				"type": "uint8"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "_useraddress",
				"type": "address"
			}
		],
		"name": "registeredUserEvent",
		"type": "event"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "_maddress",
				"type": "address"
			}
		],
		"name": "isalreadyRegisteredUser",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "string",
				"name": "_firstName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_lastName",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_email",
				"type": "string"
			},
			{
				"internalType": "enum digiLocker.userType",
				"name": "_utype",
				"type": "uint8"
			},
			{
				"internalType": "string",
				"name": "contact",
				"type": "string"
			}
		],
		"name": "registerUser",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	}
]