pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Swap {
    address private owner;
    address private tokenA;
    address private tokenB;
    uint256 public price;
    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    event Deposit(address indexed from, uint256 value);
    event Exchange(
        address indexed from,
        address token,
        uint256 value,
        uint256 price
    );

    constructor(
        address firstToken,
        address secondToken,
        uint256 newPrice
    ) {
        owner = msg.sender;
        price = newPrice;
        tokenA = firstToken;
        tokenB = secondToken;
    }

    function updatePrice(uint256 newPrice) public isOwner {
        price = newPrice;
    }

    function deposit(address tokenAddress, uint256 amount) public isOwner {
        ERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, amount);
    }

    function exchange(address tokenAddress, uint256 amount) public {
        if (tokenAddress == tokenA) {
            uint256 totalAmount = SafeMath.mul(amount, price);
            require(
                totalAmount < ERC20(tokenB).balanceOf(address(this)),
                "Not enought tokens to exchange"
            );
            ERC20(tokenA).transferFrom(msg.sender, address(this), amount);
            ERC20(tokenB).transfer(msg.sender, totalAmount);
            emit Exchange(msg.sender, tokenA, amount, price);
        } else if (tokenAddress == tokenB) {
            uint256 totalAmount = SafeMath.div(amount, price);
            require(
                totalAmount < ERC20(tokenA).balanceOf(address(this)),
                "Not enought tokens to exchange"
            );
            ERC20(tokenB).transferFrom(msg.sender, address(this), amount);
            ERC20(tokenA).transfer(msg.sender, totalAmount);
            emit Exchange(msg.sender, tokenB, amount, price);
        }
    }
}
