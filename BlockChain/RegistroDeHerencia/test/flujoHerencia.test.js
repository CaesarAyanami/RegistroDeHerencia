const Personas = artifacts.require("Personas");
const RegistroPropiedadesHerencia = artifacts.require("RegistroPropiedadesHerencia");

contract("Flujo completo de herencia", accounts => {
  const [testador, heredero1, heredero2] = accounts;

  let personas;
  let herencia;

  before(async () => {
    personas = await Personas.deployed();
    herencia = await RegistroPropiedadesHerencia.deployed();
  });

  it("Registrar personas", async () => {
    await personas.registrarPersonaEsencial("V101", "Juan", "Perez", testador);
    await personas.registrarPersonaEsencial("V102", "Maria", "Lopez", heredero1);
    await personas.registrarPersonaEsencial("V103", "Carlos", "Gomez", heredero2);
  });

  it("Registrar propiedad", async () => {
    await herencia.registrarPropiedad("V101", "Casa en Caracas", { from: testador });
  });

  it("Definir herencia múltiple", async () => {
    await herencia.definirHerencia(
      1, // idPropiedad
      ["V102", "V103"], // CI herederos
      [60, 40], // porcentajes
      { from: testador }
    );
  });

  it("Ejecutar herencia", async () => {
    await herencia.ejecutarHerencia(1, { from: testador });
  });
});
