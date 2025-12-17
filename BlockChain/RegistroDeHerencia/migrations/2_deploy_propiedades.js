const Personas = artifacts.require("Personas");
const Propiedades = artifacts.require("Propiedades");

module.exports = async function (deployer) {
  // Recupera la instancia de Personas ya desplegada
  const personasInstance = await Personas.deployed();

  // Despliega Propiedades pasando la dirección de Personas
  await deployer.deploy(Propiedades, personasInstance.address);
};
