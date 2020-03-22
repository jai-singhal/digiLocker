pragma solidity ^0.5.0;

contract digiLocker {
    uint256 userscount;
    
    struct document{
        string docName;
        uint256 timestamp; // 
        bytes32 accessKey; // user public key
        string ipfsHash; //doc hash
    }    
    
    enum userType { Issuer, Resident, Requester, Admin }
    
    struct UserDetails{
        string firstName;
        string lastName;
        string email;
        bool valid;
        userType utype; 
    }
    
    struct User{
        address id; //public key
        uint256 timestamp;
        UserDetails [] details;
    }
    
    
    //events here
    
    event registeredUserEvent(string _firstName,
        string _lastName,
        string _email,
        userType utype,
        address _useraddress
    );
    
    
    // mapping here
    mapping(address => User) users;


    function registerUser(string memory _firstName,
            string memory _lastName,
            string memory _email,
            userType _utype,
            address _useraddress) public{
    
        UserDetails memory d = UserDetails(_firstName,_lastName, _email, true, _utype);
        
        users[_useraddress].details.push(d);
        users[_useraddress].id=_useraddress;
        userscount++;
        
        emit registeredUserEvent(_firstName,_lastName,_email, _utype, _useraddress);
    }

    function addDocument(string memory docName,
        uint256 timestamp,
        bytes32 accessKey, 
        string memory ipfsHash) public{
        
    }

    function getTotalSharedDocsByOthers() public{}
    
    function getOwnerDocInfoByDocId() public{}
    
    function getSharedDocByDocId() public{}


}