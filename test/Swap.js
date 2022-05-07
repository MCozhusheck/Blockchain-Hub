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

    tokenA = await TokenAContract.deploy("1000000000000000000"); //10^18
    tokenB = await TokenBContract.deploy("1000000000000"); //10^12
    swap = await SwapContract.deploy(tokenA.address, tokenB.address, 1, 0);
  });

  describe("Deployment", function () {
    it("Should correctly deploy swap contract", async function () {
      await expect(swap.address).to.not.be.null;
    });
    it("Should deploy Token A with 10^18 tokens", async function () {
      await expect(await tokenA.totalSupply()).to.be.equal(
        "1000000000000000000"
      );
    });
    it("Should deploy Token B with 10^12 tokens", async function () {
      await expect(await tokenB.totalSupply()).to.be.equal("1000000000000");
    });
  });

  describe("Swap A tokens for B tokens", function () {
    it("Swap 100 A Tokens for 10 B Tokens", async function () {
      tokenA.approve(swap.address, 100);
      tokenB.approve(swap.address, 100);

      swap.deposit(tokenB.address, 100);

      tokenA.transfer(user.address, 100);
      tokenA.connect(user).approve(swap.address, 100);
      swap.updatePrice(1, 1);

      await expect(await tokenA.balanceOf(user.address)).to.equal(100);

      await swap.connect(user).exchange(tokenA.address, 10);
      await expect(await tokenB.balanceOf(user.address)).to.equal(10);
      await expect(await tokenA.balanceOf(user.address)).to.equal(0);
    });

    it("Swap 10 A Tokens for 10 B Tokens", async function () {
      tokenA.approve(swap.address, 100);
      tokenB.approve(swap.address, 100);

      swap.deposit(tokenB.address, 100);

      tokenA.transfer(user.address, 10);
      tokenA.connect(user).approve(swap.address, 10);

      await expect(await tokenA.balanceOf(user.address)).to.equal(10);

      await swap.connect(user).exchange(tokenA.address, 10);
      await expect(await tokenB.balanceOf(user.address)).to.equal(10);
      await expect(await tokenA.balanceOf(user.address)).to.equal(0);
    });

    it("Swap 10 A Tokens for 100 B Tokens", async function () {
      tokenA.approve(swap.address, 100);
      tokenB.approve(swap.address, 100);

      swap.deposit(tokenB.address, 100);

      tokenA.transfer(user.address, 10);
      tokenA.connect(user).approve(swap.address, 10);
      swap.updatePrice(1, -1);

      await expect(await tokenA.balanceOf(user.address)).to.equal(10);

      await swap.connect(user).exchange(tokenA.address, 100);
      await expect(await tokenB.balanceOf(user.address)).to.equal(100);
      await expect(await tokenA.balanceOf(user.address)).to.equal(0);
    });
  });

  describe("Swap B tokens for A tokens", function () {
    it("Swap 100 B Tokens for 10 A Tokens", async function () {
      tokenA.approve(swap.address, 100);
      tokenB.approve(swap.address, 100);

      swap.deposit(tokenA.address, 100);

      tokenB.transfer(user.address, 100);
      tokenB.connect(user).approve(swap.address, 100);
      swap.updatePrice(1, 1);

      await expect(await tokenB.balanceOf(user.address)).to.equal(100);

      await swap.connect(user).exchange(tokenB.address, 10);
      await expect(await tokenA.balanceOf(user.address)).to.equal(10);
      await expect(await tokenB.balanceOf(user.address)).to.equal(0);
    });

    it("Swap 10 B Tokens for 10 A Tokens", async function () {
      tokenA.approve(swap.address, 100);
      tokenB.approve(swap.address, 100);

      swap.deposit(tokenA.address, 100);

      tokenB.transfer(user.address, 10);
      tokenB.connect(user).approve(swap.address, 10);

      await expect(await tokenB.balanceOf(user.address)).to.equal(10);

      await swap.connect(user).exchange(tokenB.address, 10);
      await expect(await tokenA.balanceOf(user.address)).to.equal(10);
      await expect(await tokenB.balanceOf(user.address)).to.equal(0);
    });

    it("Swap 10 B Tokens for 100 A Tokens", async function () {
      tokenA.approve(swap.address, 100);
      tokenB.approve(swap.address, 100);

      swap.deposit(tokenA.address, 100);

      tokenB.transfer(user.address, 10);
      tokenB.connect(user).approve(swap.address, 10);
      swap.updatePrice(1, -1);

      await expect(await tokenB.balanceOf(user.address)).to.equal(10);

      await swap.connect(user).exchange(tokenB.address, 100);
      await expect(await tokenA.balanceOf(user.address)).to.equal(100);
      await expect(await tokenB.balanceOf(user.address)).to.equal(0);
    });
  });

  describe("Error handling", function () {
    it("Should throw too much", async function () {
      tokenA.approve(swap.address, 100);
      tokenB.approve(swap.address, 100);

      swap.deposit(tokenB.address, 100);

      tokenA.transfer(user.address, 100);
      tokenA.connect(user).approve(swap.address, 100);
      swap.updatePrice(1, 1);

      await expect(await tokenA.balanceOf(user.address)).to.equal(100);

      await expect(
        swap.connect(user).exchange(tokenA.address, 1000)
      ).to.be.revertedWith("Too much tokens to exchange");
    });
    it("Should throw too little", async function () {
      tokenA.approve(swap.address, 100);
      tokenB.approve(swap.address, 100);

      swap.deposit(tokenB.address, 100);

      tokenA.transfer(user.address, 100);
      tokenA.connect(user).approve(swap.address, 100);
      swap.updatePrice(1, -2);

      await expect(await tokenA.balanceOf(user.address)).to.equal(100);

      await expect(
        swap.connect(user).exchange(tokenA.address, 1)
      ).to.be.revertedWith("Too little tokens to exchange");
    });
    it("Should throw wrong token address", async function () {
      tokenA.approve(swap.address, 100);
      tokenB.approve(swap.address, 100);

      swap.deposit(tokenB.address, 100);

      tokenA.transfer(user.address, 100);
      tokenA.connect(user).approve(swap.address, 100);

      await expect(await tokenA.balanceOf(user.address)).to.equal(100);

      await expect(
        swap.connect(user).exchange(swap.address, 1)
      ).to.be.revertedWith("Invalid token address");
    });
  });
});
