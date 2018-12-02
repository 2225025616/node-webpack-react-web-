pragma solidity ^0.4.18;


contract Owner {
    address public owner;
    //添加断路器
    bool public stopped = false;

    function Owner() internal {
        owner = msg.sender;
    }

    modifier onlyOwner {
        require (msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require (newOwner != 0x0);
        require (newOwner != owner);
        OwnerUpdate(owner, newOwner);
        owner = newOwner;
    }

    function toggleContractActive() onlyOwner public {
        //可以预置改变状态的条件，如基于投票人数
        stopped = !stopped;
    }

    modifier stopInEmergency {
        require(stopped == false);
        _;
    }

    modifier onlyInEmergency {
        require(stopped == true);
        _;
    }

    event OwnerUpdate(address _prevOwner, address _newOwner);
}

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }
  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }
  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }
  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract Token is Owner{

    using SafeMath for uint256;

    // Public variables of the token
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    address public owner;

    // This creates an array with all balances
    mapping (address => uint256) public balances;

    // mapping bts address 
    mapping (address => string) public btsAccount;

    //代理
    mapping(address => mapping(address => uint)) approved;
    
    // This generates a public event on the blockchain that will notify clients
    event Transfer(address indexed from, address indexed to, uint256 value);

    event Consume(address indexed from,uint256 value);

    event Mint(address indexed from, uint256 value);

    event Exchange(address indexed from, uint256 value);

    event RelateBTS(address indexed from, string btsAccount);

    event Approval(address indexed accountOwner, address indexed spender, uint256 value);


     /**
      *
      * Fix for the ERC20 short address attack
      *
      * http://vessenes.com/the-erc20-short-address-attack-explained/
      */
    modifier onlyPayloadSize(uint256 size) {
        require(msg.data.length == size + 4);
        _;
    }


    //查询账户余额
    function balanceOf(address sender) constant external returns (uint256 balance){
        return balances[sender];
    }

    //允许spender多次取出您的帐户，最高达value金额。value可以设置超过账户余额
    function approve(address spender, uint value) external returns (bool success) {
        approved[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);

        return true;
    }

    //返回spender仍然被允许从accountOwner提取的金额
    function allowance(address accountOwner, address spender) constant external returns (uint remaining) {
        return approved[accountOwner][spender];
    }

    /**
     * Internal transfer, only can be called by this contract
     */
    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_to != 0x0);                               // Prevent transfer to 0x0 address. Use burn() instead
        require(_from != _to);
        require(balances[_from] >= _value);                // Check if the sender has enough
        require(balances[_to].add(_value) > balances[_to]); // Check for overflows
        balances[_from] = balances[_from].sub(_value);                         // Subtract from the sender
        balances[_to] = balances[_to].add(_value);                           // Add the same to the recipient
        emit Transfer(_from, _to, _value);
    }

    /**
     * Transfer tokens
     *
     * Send `_value` tokens to `_to` from your account
     */
    function transfer(address _to, uint256 _value) external stopInEmergency onlyPayloadSize(2 * 32){
        _transfer(msg.sender, _to, _value);
    }

    /**
     * Transfer tokens from other address
     *
     * Send `_value` tokens to `_to` in behalf of `_from`
     */
    function transferFrom(address from, address to, uint256 value) external stopInEmergency returns (bool success) {
        require(value > 0);
        require(value <= approved[from][msg.sender]);
        require(value <= balances[from]);

        approved[from][msg.sender] = approved[from][msg.sender].sub(value);
        _transfer(from, to, value);
        return true;
    }

    /**
    * consume tokens
    */
    function consumeToken(uint256 _value) public{
        require(msg.sender != owner);
        require(_value > 0);
        require(balances[msg.sender] >= _value);      
        require(balances[owner].add(_value) > balances[owner]); 
        balances[msg.sender] = balances[msg.sender].sub(_value);  
        balances[owner] = balances[owner].add(_value); 
        emit Consume(msg.sender , _value);
    }

    /**
    * Mint tokens 
    *
    */
    function mintToken(address target, uint256 mintedAmount) public returns (bool success){
      require(mintedAmount > 0);
      require(msg.sender == owner);
      balances[target] = balances[target].add(mintedAmount);
      totalSupply = totalSupply.add(mintedAmount);
      emit Mint(target, mintedAmount);
      return true;
    }



    /**
    * Relate BTS address
    */
    function relateBTS(string _btsAccount) public returns (bool success){
      require(bytes(_btsAccount).length > 0); 
      btsAccount[msg.sender] = _btsAccount;
      emit RelateBTS(msg.sender, _btsAccount);
      return true;
    }


    /**
    * exchange tokens(equal burn msg.sender)
    */
    function exchange(uint256 _value) public returns (bool success){
      require(bytes(btsAccount[msg.sender]).length > 0); 
      require(balances[msg.sender] >= _value);
      require(totalSupply.sub(_value) >= 0);
      balances[msg.sender] = balances[msg.sender].sub(_value);
      totalSupply = totalSupply.sub(_value);
      emit Exchange(msg.sender, _value);
      return true;
    }


}


contract IntegralToken is Token {

  function IntegralToken() public {
    uint256 initialSupply = 0;
    name = "Integral Tokens";
    symbol = "ZX";
    decimals = 18;
    owner = msg.sender;
    
    totalSupply = initialSupply * 10 ** uint256(decimals);
    require (totalSupply >= initialSupply);

    balances[msg.sender] = totalSupply;
    emit Transfer(0x0, msg.sender, totalSupply);
  }
}
