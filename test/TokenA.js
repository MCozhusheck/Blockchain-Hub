const { expect } = require("chai");

describe("Token contract", function () {
  let TokenA;
  let owner;
  let hardhatTokenA;
  beforeEach(async function () {
    TokenA = await ethers.getContractFactory("TokenA");
    [owner] = await ethers.getSigners();
    hardhatTokenA = await TokenA.deploy("1000000");
    console.log("Token address:", hardhatTokenA.address);
  });

  describe("Deployment", function () {
    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await hardhatTokenA.balanceOf(owner.address);
      expect(await hardhatTokenA.totalSupply()).to.equal(ownerBalance);
    });
  });
});
