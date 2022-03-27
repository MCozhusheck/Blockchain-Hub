const { expect } = require("chai");

describe("FlashLoan contract", function () {
  it("Create FlashLoan contract", async function () {
    const HappyPathContract = await ethers.getContractFactory("HappyPath");
    const TooMuchContract = await ethers.getContractFactory("TooMuch");
    const TooLowContract = await ethers.getContractFactory("TooLow");
    const FlashLoanContract = await ethers.getContractFactory("FlashLoan");
    const TokenContract = await ethers.getContractFactory("TokenA");
    [owner, user] = await ethers.getSigners();

    const token = await TokenContract.deploy("100000");
    const happyPath = await HappyPathContract.deploy();
    const tooMuch = await TooMuchContract.deploy();
    const tooLow = await TooLowContract.deploy();
    const flashLoan = await FlashLoanContract.deploy(token.address, 1000);
    await token.transfer(flashLoan.address, 1000);
    await token.approve(flashLoan.address, 9000);

    expect(flashLoan.transaction(happyPath.address))
      .to.emit("FlashLoanSucceed")
      .withArgs(10, 10);
    expect(flashLoan.transaction(tooMuch.address)).to.revertedWith(
      "Flashloan failed with too high return"
    );
    expect(flashLoan.transaction(tooLow.address)).to.revertedWith(
      "Flashloan failed with too low return"
    );
  });
});
