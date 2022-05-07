pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Swap {
    address private owner;
    address private tokenA;
    address private tokenB;
    uint256 public priceExponent;
    int256 public mantissa;
    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    event Deposit(address indexed from, uint256 value);
    event Exchange(address indexed from, address token, uint256 value);

    constructor(
        address firstToken,
        address secondToken,
        uint256 _priceExponent,
        int256 _mantissa
    ) {
        owner = msg.sender;
        tokenA = firstToken;
        tokenB = secondToken;
        priceExponent = _priceExponent;
        mantissa = _mantissa;
    }

    function updatePrice(uint256 _priceExponent, int256 _mantissa)
        public
        isOwner
    {
        priceExponent = _priceExponent;
        mantissa = _mantissa;
    }

    function deposit(address tokenAddress, uint256 amount) public isOwner {
        ERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, amount);
    }

    function absVal(int256 integer) private returns (uint256) {
        return uint256(integer < 0 ? -integer : integer);
    }

    function exchange(address tokenAddress, uint256 amount) public {
        uint256 price;
        uint256 totalAmount;
        address boughtToken;
        address soldToken;
        if (tokenAddress == tokenA) {
            boughtToken = tokenA;
            soldToken = tokenB;
            price = SafeMath.mul(priceExponent, amount);
            if (mantissa >= 0) {
                totalAmount = SafeMath.mul(price, 10**absVal(mantissa));
            } else {
                totalAmount = SafeMath.div(price, 10**absVal(mantissa));
            }
        } else if (tokenAddress == tokenB) {
            boughtToken = tokenB;
            soldToken = tokenA;
            price = SafeMath.div(amount, priceExponent);
            if (mantissa >= 0) {
                totalAmount = SafeMath.mul(price, 10**absVal(mantissa));
            } else {
                totalAmount = SafeMath.div(price, 10**absVal(mantissa));
            }
        } else {
            revert("Invalid token address");
        }
        require(
            totalAmount <= ERC20(soldToken).balanceOf(address(this)),
            "Too much tokens to exchange"
        );
        require(totalAmount > 0, "Too little tokens to exchange");
        ERC20(boughtToken).transferFrom(msg.sender, address(this), totalAmount);
        ERC20(soldToken).transfer(msg.sender, amount);
        emit Exchange(msg.sender, boughtToken, totalAmount);
    }
}
