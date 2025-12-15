const Propiedades = artifacts.require("Propiedades");
const Personas = artifacts.require("Personas");

module.exports = async function (deployer) {
  const personas = await Personas.deployed();
  await deployer.deploy(Propiedades, personas.address);
};
