const RegistroPropiedadesHerencia = artifacts.require("RegistroPropiedadesHerencia");
const Personas = artifacts.require("Personas");

module.exports = async function (deployer) {
  const personas = await Personas.deployed();
  await deployer.deploy(RegistroPropiedadesHerencia, personas.address);
};
