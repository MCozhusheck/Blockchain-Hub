const { expect } = require("chai");

describe("FlashLoan contract", function () {
  let flashLoan;

  it("Deploys contract", async function () {
    const FlashLoanContract = await ethers.getContractFactory("FlashLoan");
    const TokenContract = await ethers.getContractFactory("TokenA");
    [owner, user] = await ethers.getSigners();
    const token = await TokenContract.deploy("100000");
    flashLoan = await FlashLoanContract.deploy(token.address, 1000);
    await token.transfer(flashLoan.address, 1000);
    await token.approve(flashLoan.address, 9000);
    expect(flashLoan.address).to.not.be.null;
  });

  it("Contract returns exactly 1%", async function () {
    const HappyPathContract = await ethers.getContractFactory("HappyPath");
    const happyPath = await HappyPathContract.deploy();
    expect(flashLoan.transaction(happyPath.address))
      .to.emit("FlashLoanSucceed")
      .withArgs(10, 10);
  });

  it("Contract returns more than 1%", async function () {
    const TooMuchContract = await ethers.getContractFactory("TooMuch");
    const tooMuch = await TooMuchContract.deploy();
    expect(flashLoan.transaction(tooMuch.address)).to.revertedWith(
      "Flashloan failed with too high return"
    );
  });

  it("Contract returns less than 1%", async function () {
    const TooLowContract = await ethers.getContractFactory("TooLow");
    const tooLow = await TooLowContract.deploy();
    expect(flashLoan.transaction(tooLow.address)).to.revertedWith(
      "Flashloan failed with too low return"
    );
  });

  it("Contract doesn't allow reentrency", async function () {
    const ReentrantContract = await ethers.getContractFactory("Reentrant");
    const reentrant = await ReentrantContract.deploy();
    expect(flashLoan.transaction(reentrant.address)).to.revertedWith(
      "No re-entrancy"
    );
  });
});
