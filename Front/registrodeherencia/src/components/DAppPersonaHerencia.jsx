import React, { useState, useEffect } from "react";
import Web3 from "web3";
import HerenciaContract from "../ABI/HerenciaConRegistro.json";

export default function DAppPersonaHerencia() {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [datosContrato, setDatosContrato] = useState(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accs = await web3Instance.eth.getAccounts();

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = HerenciaContract.networks[networkId];
        const instance = new web3Instance.eth.Contract(
          HerenciaContract.abi,
          deployedNetwork && deployedNetwork.address
        );

        setWeb3(web3Instance);
        setAccounts(accs);
        setContract(instance);

        // Cargar datos iniciales del contrato
        const datos = await instance.methods.obtenerDatosContrato().call();
        setDatosContrato(datos);
      } else {
        alert("MetaMask no detectado");
      }
    };
    init();
  }, []);

  // Activar prueba de fallecimiento
  const activarPrueba = async () => {
    await contract.methods.activarPruebaFallecimiento().send({ from: accounts[0] });
    alert("Prueba de fallecimiento activada!");
    const datos = await contract.methods.obtenerDatosContrato().call();
    setDatosContrato(datos);
  };

  // Reclamar herencia
  const reclamarHerencia = async () => {
    await contract.methods.reclamarHerencia().send({ from: accounts[0] });
    alert("Herencia reclamada!");
    const datos = await contract.methods.obtenerDatosContrato().call();
    setDatosContrato(datos);
  };

  // Retirar fondos
  const retirarFondos = async () => {
    await contract.methods.retirarFondos().send({ from: accounts[0] });
    alert("Fondos retirados por el testador!");
    const datos = await contract.methods.obtenerDatosContrato().call();
    setDatosContrato(datos);
  };

  return (
    <div className="bg-white p-6 rounded shadow mt-6">
      <h2 className="text-xl font-bold mb-4">Contrato de Herencia</h2>

      {datosContrato && (
        <div className="p-4 border rounded bg-gray-50 mb-4">
          <p><strong>CI Testador:</strong> {datosContrato[0]}</p>
          <p><strong>Wallet Testador:</strong> {datosContrato[1]}</p>
          <p><strong>Prueba Fallecimiento:</strong> {datosContrato[2] ? "Activada" : "No activada"}</p>
          <p><strong>Balance:</strong> {web3.utils.fromWei(datosContrato[3], "ether")} ETH</p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={activarPrueba}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Activar Prueba Fallecimiento
        </button>

        <button
          onClick={reclamarHerencia}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Reclamar Herencia
        </button>

        <button
          onClick={retirarFondos}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Retirar Fondos
        </button>
      </div>
    </div>
  );
}
