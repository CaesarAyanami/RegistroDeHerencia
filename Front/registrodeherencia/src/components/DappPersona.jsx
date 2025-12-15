import React, { useState, useEffect } from "react";
import Web3 from "web3";
import PersonasContract from "../ABI/Persona.json" // ruta al artefacto

export default function DAppPersona() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);

  // Inputs
  const [cedula, setCedula] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [consultaCI, setConsultaCI] = useState("");
  const [persona, setPersona] = useState(null);

  useEffect(() => {
    const init = async () => {
      // Conectar a MetaMask
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accs = await web3Instance.eth.getAccounts();

        // Red de Ganache
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = PersonasContract.networks[networkId];
        const instance = new web3Instance.eth.Contract(
          PersonasContract.abi,
          deployedNetwork && deployedNetwork.address
        );

        setWeb3(web3Instance);
        setAccounts(accs);
        setContract(instance);
      } else {
        alert("MetaMask no detectado");
      }
    };
    init();
  }, []);

  // Registrar persona esencial
  const registrarPersona = async () => {
    await contract.methods
      .registrarPersonaEsencial(cedula, nombres, apellidos)
      .send({ from: accounts[0] });
    alert("Persona registrada!");
  };

  // Consultar persona por CI
  const consultarPersona = async () => {
    try {
      const datos = await contract.methods
        .obtenerPersonaPorCI(consultaCI)
        .call();
      setPersona(datos);
    } catch (err) {
      alert("No encontrada");
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow mt-6">
      <h2 className="text-xl font-bold mb-4">Registro Civil DApp</h2>

      {/* Registro */}
      <div className="mb-6">
        <h3 className="font-semibold">Registrar Persona</h3>
        <input
          type="text"
          placeholder="Cédula"
          value={cedula}
          onChange={(e) => setCedula(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Nombres"
          value={nombres}
          onChange={(e) => setNombres(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Apellidos"
          value={apellidos}
          onChange={(e) => setApellidos(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={registrarPersona}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Registrar
        </button>
      </div>

      {/* Consulta */}
      <div className="mb-6">
        <h3 className="font-semibold">Consultar Persona por CI</h3>
        <input
          type="text"
          placeholder="Cédula"
          value={consultaCI}
          onChange={(e) => setConsultaCI(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={consultarPersona}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Consultar
        </button>
      </div>

      {/* Resultado */}
      {persona && (
        <div className="p-4 border rounded bg-gray-50">
          <p><strong>Nombres:</strong> {persona.nombres}</p>
          <p><strong>Apellidos:</strong> {persona.apellidos}</p>
          <p><strong>Cédula:</strong> {persona.cedula}</p>
        </div>
      )}
    </div>
  );
}
