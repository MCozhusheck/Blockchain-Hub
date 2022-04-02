const { expect } = require("chai");

describe("FlashLoan contract", function () {
  let FlashLoanContract;
  let TokenContract;
  let flashLoan;
  let token;
  let owner;
  let user;

  beforeEach(async function () {
    FlashLoanContract = await ethers.getContractFactory("FlashLoan");
    TokenContract = await ethers.getContractFactory("TokenA");
    [owner, user] = await ethers.getSigners();
    owner = owner;
    user = user;
    token = await TokenContract.deploy("1000000000");
    flashLoan = await FlashLoanContract.deploy(token.address, 1000);
    await token.transfer(flashLoan.address, 1000);
    await token.approve(flashLoan.address, 9000);
  });

  describe("Deployment", function () {
    it("Should correctly deploy flashLoan", async function () {
      expect(flashLoan.address).to.not.be.null;
    });
    it("Should transfer tokens to flashloan contract", async function () {
      expect(await token.balanceOf(flashLoan.address)).to.equal(1000);
    });
    it("Should set allowance of tokens to flashloan contract", async function () {
      expect(await token.allowance(owner.address, flashLoan.address)).to.equal(
        9000
      );
    });
  });

  describe("Flashloan transaction", function () {
    it("Should return exactly 1%", async function () {
      const HappyPathContract = await ethers.getContractFactory("HappyPath");
      const happyPath = await HappyPathContract.deploy();
      await flashLoan.transaction(happyPath.address);
      expect(await token.balanceOf(flashLoan.address)).to.equal(1010);
    });
    it("Should return more than 1%", async function () {
      const TooMuchContract = await ethers.getContractFactory("TooMuch");
      const tooMuch = await TooMuchContract.deploy();
      expect(flashLoan.transaction(tooMuch.address)).to.revertedWith(
        "Flashloan failed with too high return"
      );
    });
    it("Should return less than 1%", async function () {
      const TooLowContract = await ethers.getContractFactory("TooLow");
      const tooLow = await TooLowContract.deploy();
      expect(flashLoan.transaction(tooLow.address)).to.revertedWith(
        "Flashloan failed with too low return"
      );
    });
  });

  describe("Flashloan contract error handling", function () {
    it("Should revert when reentrancy occurs", async function () {
      const ReentrantContract = await ethers.getContractFactory("Reentrant");
      const reentrant = await ReentrantContract.deploy();
      expect(flashLoan.transaction(reentrant.address)).to.revertedWith(
        "Flashloan transaction failed"
      );
    });

    it("Should revert when passed incorrect interface", async function () {
      expect(flashLoan.transaction(token.address)).to.revertedWith(
        "Flashloan transaction failed"
      );
    });
  });
});
