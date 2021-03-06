pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./FlashLoan.sol";

interface Borrow {
    function flashLoan(address token, uint256 amount) external;
}

contract HappyPath is Borrow {
    address private owner;

    constructor() {
        owner = msg.sender;
    }

    function flashLoan(address token, uint256 amount) public override {
        uint256 test = SafeMath.mul(amount, 101);
        uint256 test2 = SafeMath.div(test, 100);
        uint256 result = SafeMath.sub(test2, amount);
        ERC20(token).transferFrom(owner, address(this), result);
    }
}

contract TooMuch is Borrow {
    address private owner;

    constructor() {
        owner = msg.sender;
    }

    function flashLoan(address token, uint256 amount) public override {
        uint256 test = SafeMath.mul(amount, 105);
        uint256 test2 = SafeMath.div(test, 100);
        uint256 result = SafeMath.sub(test2, amount);

        ERC20(token).transferFrom(owner, address(this), result);
    }
}

contract TooLow is Borrow {
    address private owner;

    constructor() {
        owner = msg.sender;
    }

    function flashLoan(address token, uint256 amount) public override {
        uint256 test = SafeMath.mul(amount, 1001);
        uint256 test2 = SafeMath.div(test, 1000);
        uint256 result = SafeMath.sub(test2, amount);

        ERC20(token).transferFrom(owner, address(this), result);
    }
}

contract Reentrant is Borrow {
    address private owner;

    constructor() {
        owner = msg.sender;
    }

    function flashLoan(address token, uint256 amount) public override {
        FlashLoan(address(this)).transaction(address(this));
    }
}
