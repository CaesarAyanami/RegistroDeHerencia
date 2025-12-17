const Personas = artifacts.require("Personas");
const Propiedades = artifacts.require("Propiedades");
const Herencias = artifacts.require("Herencias");

module.exports = async function (deployer) {
  // Recupera las instancias ya desplegadas
  const personasInstance = await Personas.deployed();
  const propiedadesInstance = await Propiedades.deployed();

  // Despliega Herencias pasando las direcciones de Personas y Propiedades
  await deployer.deploy(Herencias, personasInstance.address, propiedadesInstance.address);
};
