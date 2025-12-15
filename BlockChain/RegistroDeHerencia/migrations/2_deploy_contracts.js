const Personas = artifacts.require("Personas");
const Herencia = artifacts.require("HerenciaConRegistro");

module.exports = async function (deployer, network, accounts) {
  // -----------------------------------------------------------
  // 1. DEFINICIÓN DE ROLES Y PARÁMETROS
  // -----------------------------------------------------------
  const walletTestador = accounts[0]; // Cuenta 0: Quien despliega y Testador
  const walletHeredero = accounts[1]; // Cuenta 1: El Heredero

  const ciTestador = "V10123456";
  const ciHeredero = "V20987654";
  const periodoEsperaDias = 7;
  const etherInicial = web3.utils.toWei("5", "ether");

  // -----------------------------------------------------------
  // 2. DESPLIEGUE DEL REGISTRO CIVIL (PERSONAS)
  // -----------------------------------------------------------
  await deployer.deploy(Personas, { from: walletTestador });
  const personasInstance = await Personas.deployed();

  console.log(`\n✅ Contrato Personas desplegado en: ${personasInstance.address}\n`);

  // --- PASO CRÍTICO: REGISTRAR PERSONAS ---
  console.log("...Registrando Testador y Heredero en el Registro Civil...");

  await personasInstance.registrarPersonaEsencial(
    ciTestador,
    "Testador Nombre",
    "Testador Apellido",
    { from: walletTestador }
  );

  await personasInstance.registrarPersonaEsencial(
    ciHeredero,
    "Heredero Nombre",
    "Heredero Apellido",
    { from: walletTestador }
  );

  // -----------------------------------------------------------
  // 3. DESPLIEGUE DE HERENCIA (Usa la dirección de Personas)
  // -----------------------------------------------------------
  await deployer.deploy(
    Herencia,
    personasInstance.address, // Dirección del contrato Personas
    ciTestador,
    ciHeredero,
    walletHeredero,
    periodoEsperaDias,
    {
      from: walletTestador,
      value: etherInicial,
    }
  );

  const herenciaInstance = await Herencia.deployed();

  console.log(`\n💰 Contrato Herencia desplegado en: ${herenciaInstance.address}`);
  console.log(`Heredero Wallet: ${walletHeredero}`);
  console.log(`Monto inicial depositado: 5 ETH\n`);
};
