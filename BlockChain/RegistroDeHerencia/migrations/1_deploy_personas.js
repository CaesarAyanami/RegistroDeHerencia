const Personas = artifacts.require("Personas");

module.exports = function (deployer) {
  deployer.deploy(Personas);
};
