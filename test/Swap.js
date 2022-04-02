const { expect } = require("chai");

describe("Swap contract", function () {
  let SwapContract;
  let TokenAContract;
  let TokenBContract;
  let owner;
  let user;
  let tokenA;
  let tokenB;
  let swap;

  beforeEach(async function () {
    SwapContract = await ethers.getContractFactory("Swap");
    TokenAContract = await ethers.getContractFactory("TokenA");
    TokenBContract = await ethers.getContractFactory("TokenB");
    [owner, user] = await ethers.getSigners();

    tokenA = await TokenAContract.deploy("1000");
    tokenB = await TokenBContract.deploy("1000");
    swap = await SwapContract.deploy(tokenA.address, tokenB.address, 1);
  });

  describe("Deployment", function () {
    it("Should correctly deploy swap contract", async function () {
      expect(swap.address).to.not.be.null;
    });
    it("Should deploy Token A with 1000 tokens", async function () {
      expect(await tokenA.totalSupply()).to.be.equal(1000);
    });
    it("Should deploy Token B with 1000 tokens", async function () {
      expect(await tokenB.totalSupply()).to.be.equal(1000);
    });
  });

  describe("Swap tokens", function () {
    it("Swap 10 A Tokens for 10 B Tokens", async function () {
      tokenA.approve(swap.address, 100);
      tokenB.approve(swap.address, 100);

      swap.deposit(tokenB.address, 100);

      tokenA.transfer(user.address, 10);
      tokenA.connect(user).approve(swap.address, 10);

      expect(await tokenA.balanceOf(user.address)).to.equal(10);
      expect(await tokenB.balanceOf(owner.address)).to.equal(900);
      expect(await tokenA.allowance(owner.address, swap.address)).to.equal(100);
      expect(await tokenA.allowance(user.address, swap.address)).to.equal(10);

      await swap.connect(user).exchange(tokenA.address, 10);
      expect(await tokenB.balanceOf(user.address)).to.equal(10);
      expect(await tokenA.balanceOf(user.address)).to.equal(0);
    });
  });
});
