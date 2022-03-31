pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract FlashLoan {
    address private owner;
    address private token;
    uint256 private maxAmount;
    bool internal locked;

    constructor(address newToken, uint256 newMaxAmount) {
        owner = msg.sender;
        maxAmount = newMaxAmount;
        token = newToken;
    }

    modifier isOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    modifier noReentrant() {
        if (locked) {
            revert("No re-entrancy");
        }
        locked = true;
        _;
        locked = false;
    }

    event FlashLoanSucceed(uint256 amountBefore, uint256 amountAfter);
    event FlashLoanFailed(uint256 amountBefore, uint256 amountAfter);

    function transaction(address _contract) public noReentrant {
        uint256 amountBefore = ERC20(token).balanceOf(address(this));
        uint256 onePercentage = SafeMath.div(amountBefore, 100);
        (bool success, bytes memory data) = _contract.delegatecall(
            abi.encodeWithSignature(
                "flashLoan(address,uint256)",
                token,
                maxAmount
            )
        );
        if (!success) {
            revert("Flashloan transaction failed");
        }

        uint256 amountAfter = ERC20(token).balanceOf(address(this));
        uint256 diff = SafeMath.sub(amountAfter, amountBefore);
        if (diff == onePercentage) {
            emit FlashLoanSucceed(amountBefore, amountAfter);
        } else if (diff > onePercentage) {
            emit FlashLoanFailed(amountBefore, amountAfter);
            revert("Flashloan failed with too high return");
        } else {
            emit FlashLoanFailed(amountBefore, amountAfter);
            revert("Flashloan failed with too low return");
        }
    }
}
