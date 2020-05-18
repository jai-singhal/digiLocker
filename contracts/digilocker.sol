pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;


contract digiLocker {
    //structures and other variable declrn
    
    struct Document{
        bytes32 docid; //doc id
        string docName;
        string timestamp; //
        bytes32 docHash; //doc hash
    }
    struct UserDetails{
        string firstName;
        string lastName;
        string email;
        string contact;
    }
    
    struct User{
        userType utype;
        bool valid;
        UserDetails details;
        address _useraddress;
        bytes32 accessKey; // user master key Hash
        string pubKey; // Public key of user
    }
    uint usercount = 0;
    address[] _glbluseraddress;
    ///////////////////////-- enums here -- ///////////////////////////////////
    enum userType { Issuer, Resident, Requester, Admin }
    enum Permission {READ, MODIFY}
    
    
    ///////////////////////-- events here -- ///////////////////////////////////
    event registeredUserEvent(string _email,userType utype,address indexed _useraddress);
    event uploadDocumentEvent(bytes32 indexed docid, bytes32 docHash, address indexed user_addr);
    event sharedDocumentEvent(bytes32 indexed docid, address indexed docOwner,address indexed sharedWith, uint32 permission);
    event verifyDocumentEvent(bytes32 indexed docid, address indexed docOwner, address indexed sharedWith);
    
    
    ///////////////////////-- mapping here -- ///////////////////////////////////
    mapping(address => User) registerUsers;
    mapping (address => Document[])  ownerDocuments;
    mapping (string => address)  emailAddressMapping;
    

    ///////////////////////-- functions here -- ///////////////////////////////////
    function isalreadyRegisteredUser() public view returns(bool){
        if(registerUsers[msg.sender]._useraddress == 0x0000000000000000000000000000000000000000){
            return false;
        }
        else{
            return true;
        }
    }
    // temp function
    function getUseraccessKey() public view returns(bytes32){
       return (registerUsers[msg.sender].accessKey);
    }
    
    function getUserType() public view returns(uint)
    {
        return uint(registerUsers[msg.sender].utype);
    }
    
    function getRegisteredUser() public view returns(bytes32, address, string memory){
       return (registerUsers[msg.sender].accessKey, 
       registerUsers[msg.sender]._useraddress,
       registerUsers[msg.sender].details.firstName
       );
    }
    
    //register user
    function registerUser(string memory _firstName,
            string memory _lastName,
            string memory _email, uint8 _utype,
            string memory _contact, bytes32 accessKey,
            string memory pubKey) public returns(bool) {
            UserDetails memory d = UserDetails(_firstName,_lastName, _email, _contact);
                User memory newuser = User(
                    userType(_utype), true, d, 
                    msg.sender, accessKey, pubKey
                );
                
                emailAddressMapping[_email] = msg.sender;
                
                registerUsers[msg.sender] = newuser;
                emit registeredUserEvent(_email, userType(_utype), msg.sender);
                _glbluseraddress.push(msg.sender);
                usercount++;
                return true;
    }
 
    function checkAlreadyUpload(bytes32 docId)public view returns(bool){
        for(uint i = 0; i<ownerDocuments[msg.sender].length; i++)
            if(ownerDocuments[msg.sender][i].docid == docId)
                return true;
        return false;
    }

    function getDocCountByUserId() public view returns(uint256){
        return ownerDocuments[msg.sender].length;
    }
    
    function uploadDocument(string memory docName, bytes32 docId, bytes32 docHash, string memory timestamp) public returns(bool){
        Document memory d = Document(docId, docName, timestamp, docHash);
        ownerDocuments[msg.sender].push(d);
        emit uploadDocumentEvent(docId, docHash, msg.sender);
        return true;
    }

    function shareDocumentwithUser(bytes32 docid, address  _owner, uint32 permission,address _requester) public{
           // sharedDoc memory d = sharedDoc(docid, _owner, Permission(permission));
            // sharedDocuments[_requester].push(d);
            emit sharedDocumentEvent(docid, _owner, _requester, permission);  
    }
    
    function verifyUserDocument(bytes32 docid, address  _owner, address _requester) public{
        
        emit verifyDocumentEvent(docid,_owner,_requester);
    }
    

    function isValidSharableUser(string memory email_) public view returns(bool){
        if(emailAddressMapping[email_] != 0x0000000000000000000000000000000000000000 &&
            uint(registerUsers[emailAddressMapping[email_]].utype) == 2){
            return true;
        }
        else{
            return false;
        }
    }

    function getOwnerDocInfoByDocId(bytes32 docId)public view returns (string memory, string memory){
        
        for(uint i = 0; i < ownerDocuments[msg.sender].length; i++){
            if(ownerDocuments[msg.sender][i].docid == docId)
                return (ownerDocuments[msg.sender][i].docName,
                    ownerDocuments[msg.sender][i].timestamp
                );
            
        }   
    }
    
    function getOwnerDocumetList()public view returns (
        string[] memory, string[] memory, bytes32[] memory) {
        return getDocumetList(msg.sender);
    }
    
    function getDocumetList(address _useradd)public view returns (
        string[] memory, string[] memory, bytes32[] memory) {

      string[] memory _docName = new string[](ownerDocuments[_useradd].length);
      string[] memory _timestamp = new string[](ownerDocuments[_useradd].length);
      bytes32[] memory _docid = new bytes32[](ownerDocuments[_useradd].length);

      
      for(uint i=0;i<ownerDocuments[_useradd].length;i++){
         _timestamp[i] = ownerDocuments[_useradd][i].timestamp;
         _docName[i] = ownerDocuments[_useradd][i].docName;
         _docid[i] = ownerDocuments[_useradd][i].docid;
   
      }
      
      return (_docName,_timestamp, _docid);
    }
    
    
    function getDocumentListbyDocId(bytes32 _docId) public view returns(
        bytes32, 
        string memory, 
        string memory, 
        bytes32, 
        string memory, 
        string memory, 
        string memory, 
        string memory){
        for(uint i=0;i<usercount;i++){
            for(uint j=0;j < ownerDocuments[_glbluseraddress[i]].length;j++){
                
                if(ownerDocuments[_glbluseraddress[i]][j].docid == _docId)
                    
                    return (
                        ownerDocuments[_glbluseraddress[i]][j].docid,
                        ownerDocuments[_glbluseraddress[i]][j].docName,
                        ownerDocuments[_glbluseraddress[i]][j].timestamp,
                        ownerDocuments[_glbluseraddress[i]][j].docHash,
                        registerUsers[_glbluseraddress[i]].details.firstName,
                        registerUsers[_glbluseraddress[i]].details.email,
                        registerUsers[_glbluseraddress[i]].details.lastName,
                        registerUsers[_glbluseraddress[i]].details.contact
                    );
                
            }
            
        }
        
    }

    function getEmailIdByAddrss()public view returns(string memory,string memory,string memory){
        return (registerUsers[msg.sender].details.email,
                registerUsers[msg.sender].details.firstName,
                registerUsers[msg.sender].details.lastName);
    }
    
    function getAddressByEmail(string memory _email)public view returns(address){
        return emailAddressMapping[_email];
    }
    
    //To find owners details
    function getEmailIdByUsrAddr(address _usraddrs)public view returns(string memory,string memory,string memory)
    {
        return (registerUsers[_usraddrs].details.email,
                registerUsers[_usraddrs].details.firstName,
                registerUsers[_usraddrs].details.lastName);
    }   
    
    function getDocIndex(bytes32 _docid_,address _uaddr_)public view returns(uint256){
       
       for(uint i=0;i < ownerDocuments[_uaddr_].length ;i++)
       {
           
           if(ownerDocuments[_uaddr_][i].docid == _docid_)
           {
               
               return i;
           }
       }
        
    }
    
    function getPublicKey(address _uaddr_)public view returns(string memory){
        return registerUsers[_uaddr_].pubKey;
    }
    
    
    function getDocumentName(bytes32 _docId, address docOwner) public view returns(string memory){
        for(uint j=0;j < ownerDocuments[docOwner].length;j++){
            if(ownerDocuments[docOwner][j].docid == _docId)
                return (ownerDocuments[docOwner][j].docName);
        }
    }
    
}