pragma solidity 0.4.24;

import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";

/**
 * @title SimpleToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `StandardToken` functions.
 */

contract MintableToken is ERC20Mintable {

  string public constant name = "SimpleToken";
  string public constant symbol = "SIM";
  uint8 public constant decimals = 8;

  uint256 public constant INITIAL_SUPPLY = 10000 * (10 ** uint256(decimals));

  /**
   * @dev Constructor that gives msg.sender all of existing tokens.
   */
  constructor() public {
    _mint(msg.sender, INITIAL_SUPPLY);
  }

}
