pragma solidity ^0.4.18;


contract IntegralToken {
  //string public name;
  function name() public pure returns (string);

  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);

  function balanceOf(address sender) constant external returns (uint256 balance);

  function transfer(address _to, uint256 _value) external;
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

contract Game {

  using SafeMath for uint256;

  string public name;
  address public owner;
  IntegralToken token;

  struct GameInfo {
    uint256  maxAmount;
    uint  startTime;
    uint  endTime;
    uint  result;
    uint256  countUp;
    uint256  countDown;
  }

  struct PlayerGuess {
    uint256  amount;
    uint  value;
  }

//  uint gameID;
  mapping(uint => GameInfo) public games;

  mapping(uint => mapping(address => PlayerGuess)) public GuessAttempts;

  event Guess(uint gameID, address indexed from, uint value);
  event End(uint gameID, address indexed from, uint value);
  event Create(uint gameID, uint _startTime , uint _endTime , uint256 _amount);
  event GetCandy(uint gameID,address indexed from,address indexed to,uint256 _amount);

  function createGame(uint gameID, uint _startTime , uint _endTime , uint256 _amount) public returns (bool success){
    require(msg.sender == owner);
    require(_startTime < _endTime);
    games[gameID] = GameInfo(_amount,_startTime,_endTime,0,0,0);
    emit Create(gameID,_startTime,_endTime,_amount);
    return true;
  }


  function guess(uint _gameID, uint _value, uint256 _amount) public returns (bool success){
    require(_amount > 0);
    GameInfo storage game = games[_gameID];

    require(game.endTime > now && now >= game.startTime, "Game not start or already ended");
    require(game.result == 0, "Game stopped");
    require(_amount <= game.maxAmount, "Too much token");
    require(_value == 1 || _value == 2, "Guess wrong");
    require(GuessAttempts[_gameID][msg.sender].value == 0, "User already guessed");
    require(token.balanceOf(msg.sender) >= _amount, "Not enough token");

    GuessAttempts[_gameID][msg.sender] = PlayerGuess(_amount, _value);

    if (_value == 1){
      game.countUp = game.countUp.add(_amount);
    } else {
      game.countDown = game.countDown.add(_amount);
    }
    
    uint beforeAmount = token.balanceOf(msg.sender);
    token.transferFrom(msg.sender, address(this) ,_amount);
    uint afterAmount = token.balanceOf(msg.sender);
    assert(beforeAmount == afterAmount.add(_amount));

    emit Guess(_gameID, msg.sender, _value);
    return true;
  }

  function endGame(uint _gameID, uint _value) public returns(bool success){
    require(msg.sender == owner);
    require(games[_gameID].result==0, "Game already stopped");
    require(_value == 1 || _value == 2);
    games[_gameID].result = _value;
    emit End(_gameID, msg.sender, _value);
    return true;
  }

  function getCandy (uint _gameID) public returns(uint256) {
    GameInfo storage game = games[_gameID];
    require(game.result>0, "Game is still running");
    require(GuessAttempts[_gameID][msg.sender].value == game.result, "You guessed wrong");
    uint256 candy;
    if (game.result == 1){
      candy = ((game.countUp.add(game.countDown)).mul(GuessAttempts[_gameID][msg.sender].amount)).div(game.countUp);
    } else {
      candy = ((game.countUp.add(game.countDown)).mul(GuessAttempts[_gameID][msg.sender].amount)).div(game.countDown);
    }

    uint beforeAmount = token.balanceOf(msg.sender);
    token.transfer(msg.sender,candy);
    uint afterAmount = token.balanceOf(msg.sender);
    assert(beforeAmount == afterAmount.sub(candy));

    GuessAttempts[_gameID][msg.sender].amount = 0;
    emit GetCandy(_gameID,address(this),msg.sender,candy);
    return candy;
  }

}

contract GuessGame is Game{
  function GuessGame(address tokenAddress) public {
    name = "Number Guess Game";
    owner = msg.sender;
    token = IntegralToken(tokenAddress);
    bytes memory contractName = bytes(token.name());
    string memory tokenN = "Integral Tokens";
    bytes memory tokenName = bytes(tokenN);

    require (contractName.length == tokenName.length);

    for (uint i = 0; i < contractName.length; i ++){
      require (contractName[i] == tokenName[i]);
    }
  }
}
