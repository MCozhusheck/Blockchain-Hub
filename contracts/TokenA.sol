pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenA is ERC20 {
    address owner;

    constructor(uint256 initialSupply) ERC20("TokenA", "TKA") {
        _mint(msg.sender, initialSupply);
        owner = msg.sender;
    }
}
