const { expect } = require("chai");

describe("Swap contract", function () {
  it("Create Swap contract", async function () {
    const SwapContract = await ethers.getContractFactory("Swap");

    const TokenAContract = await ethers.getContractFactory("TokenA");
    const TokenBContract = await ethers.getContractFactory("TokenB");
    [owner, user] = await ethers.getSigners();

    const TokenA = await TokenAContract.deploy("1000");
    const TokenB = await TokenBContract.deploy("1000");
    const Swap = await SwapContract.deploy(TokenA.address, TokenB.address, 10);
    TokenA.approve(Swap.address, 100);
    TokenB.approve(Swap.address, 100);

    Swap.deposit(TokenB.address, 100);

    TokenA.transfer(user.address, 10);
    TokenA.connect(user).approve(Swap.address, 10);

    expect(await TokenA.balanceOf(user.address)).to.equal(10);
    expect(await TokenB.balanceOf(owner.address)).to.equal(900);
    expect(await TokenA.allowance(owner.address, Swap.address)).to.equal(100);
    expect(await TokenA.allowance(user.address, Swap.address)).to.equal(10);

    await Swap.connect(user).exchange(TokenA.address, 1);
    expect(await TokenB.balanceOf(user.address)).to.equal(10);
  });
});
