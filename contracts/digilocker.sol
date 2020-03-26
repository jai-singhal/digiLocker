pragma solidity ^0.5.0;

contract digiLocker {
    //structures and other variable declrn
    struct document{
        string docName;
        uint256 timestamp; //
        bytes32 accessKey; // user public key
        string ipfsHash; //doc hash
    }
    struct UserDetails{
        string firstName;
        string lastName;
        string email;
        string contact;
    }
    struct User{
        uint256 timestamp;
        userType utype;
        bool valid;
        UserDetails details;
    }
    ///////////////////////-- enums here -- ///////////////////////////////////
    enum userType { Issuer, Resident, Requester, Admin }
    ///////////////////////-- events here -- ///////////////////////////////////
    event registeredUserEvent(string _firstName,
        string _lastName,
        string _email,
        string _contact,
        userType utype,
        address _useraddress
    );
    event alreadyRegistred(
        address _useraddress
    );
    ///////////////////////-- mapping here -- ///////////////////////////////////
    mapping(address => User) registerUsers;

    ///////////////////////-- modifier here -- ///////////////////////////////////
    // modifier isalreadyRegisteredUserModifier(){
    //     if(isalreadyRegisteredUser()){
    //         _;
    //     }
    //     else{
    //         emit alreadyRegistred(msg.sender);
    //     }
    // }

    ///////////////////////-- functions here -- ///////////////////////////////////
    function isalreadyRegisteredUser() public view returns(bool){
        if(registerUsers[msg.sender].valid == false){
            return false;
        }
        else{
            return true;
        }
    }
    // temp function
    function getRegisteredUser() public view returns(uint256, address){
       return (registerUsers[msg.sender].timestamp, msg.sender);
    }
    //register user
    function registerUser(string memory _firstName,
            string memory _lastName,
            string memory _email,
            uint8 _utype,
            string memory _contact) public  {
            if (!isalreadyRegisteredUser()){
                UserDetails memory d = UserDetails(_firstName,_lastName, _email, _contact);
                unit timestamp = now;
                User memory newuser = User(timestamp, userType(_utype), true, d);
                registerUsers[msg.sender] = newuser;
                emit registeredUserEvent(_firstName,_lastName,_email, _contact, userType(_utype), msg.sender);
            }
            else{
                emit alreadyRegistred(msg.sender);
            }
    }

    // function addDocument(string docName,uint256 timestamp,bytes32 accessKey,string ipfsHash) public{
        
    // }

    // function getTotalSharedDocsByOthers() public{}
    
    // function getOwnerDocInfoByDocId(uint256 docId)public view returns (string,string,bytes32){
        
    //         return(ipfsHash,docName,accessKey);
        
    // }
    
    // function getSharedDocByDocId(uint256 docId) public view returns(uint256,string docName, Permission){
    //         return(,,);
    // }
    
}