import React, { useState, useEffect } from "react";
import Web3 from "web3";
import PropiedadesABI from "../ABI/Propiedades.json"; // ABI generado por Truffle

const PropiedadesComponent = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  // Estados para registrar propiedad
  const [ci, setCi] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Estados para listar propiedades
  const [propiedades, setPropiedades] = useState([]);

  // Estados para consultar propiedad
  const [propiedadId, setPropiedadId] = useState("");
  const [propiedadDetalle, setPropiedadDetalle] = useState(null);

  // Estados para transferir propiedad
  const [ciNuevo, setCiNuevo] = useState("");

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          setAccount(accounts[0]);

          const networkId = await web3.eth.net.getId();
          const deployedNetwork = PropiedadesABI.networks[networkId];

          if (!deployedNetwork) {
            alert("Contrato Propiedades no desplegado en esta red.");
            return;
          }

          const instance = new web3.eth.Contract(
            PropiedadesABI.abi,
            deployedNetwork.address
          );
          setContract(instance);
        } catch (error) {
          console.error("Error al inicializar:", error);
          alert("Error al conectar con MetaMask o cargar el contrato Propiedades.");
        }
      } else {
        alert("MetaMask no detectado.");
      }
    };
    init();
  }, []);

  // Registrar propiedad
  const registrarPropiedad = async () => {
    try {
      await contract.methods
        .registrarPropiedad(ci, descripcion)
        .send({ from: account });
      alert("Propiedad registrada ✅");
    } catch (err) {
      console.error(err);
      alert("Error al registrar propiedad ❌");
    }
  };

  // Listar propiedades por CI
  const listarPropiedades = async () => {
    try {
      const result = await contract.methods.listarPropiedadesPorCI(ci).call();
      setPropiedades(result);
    } catch (err) {
      console.error(err);
    }
  };

  // Consultar propiedad por ID
  const consultarPropiedad = async () => {
    try {
      const result = await contract.methods.obtenerPropiedad(propiedadId).call();
      setPropiedadDetalle(result);
    } catch (err) {
      console.error(err);
    }
  };

  // Transferir propiedad
  const transferirPropiedad = async () => {
    try {
      await contract.methods
        .transferirPropiedad(propiedadId, ciNuevo)
        .send({ from: account });
      alert("Propiedad transferida ✅");
    } catch (err) {
      console.error(err);
      alert("Error al transferir propiedad ❌");
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Gestión de Propiedades 🏠</h2>
      <p>Cuenta conectada: {account}</p>

      {/* Registrar propiedad */}
      <div className="mb-4">
        <h3 className="font-semibold">Registrar Propiedad</h3>
        <input
          type="text"
          placeholder="CI del dueño"
          value={ci}
          onChange={(e) => setCi(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={registrarPropiedad}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Registrar
        </button>
      </div>

      {/* Listar propiedades */}
      <div className="mb-4">
        <h3 className="font-semibold">Listar Propiedades por CI</h3>
        <button
          onClick={listarPropiedades}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Listar
        </button>
        <ul className="mt-2">
          {propiedades.map((p, idx) => (
            <li key={idx} className="border p-2 mb-2">
              ID: {p.idPropiedad} | CI: {p.ciDueno} | Desc: {p.descripcion}
            </li>
          ))}
        </ul>
      </div>

      {/* Consultar propiedad */}
      <div className="mb-4">
        <h3 className="font-semibold">Consultar Propiedad por ID</h3>
        <input
          type="text"
          placeholder="ID Propiedad"
          value={propiedadId}
          onChange={(e) => setPropiedadId(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={consultarPropiedad}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Consultar
        </button>
        {propiedadDetalle && (
          <div className="mt-2 border p-2">
            <p>ID: {propiedadDetalle.idPropiedad}</p>
            <p>CI Dueño: {propiedadDetalle.ciDueno}</p>
            <p>Descripción: {propiedadDetalle.descripcion}</p>
            <p>Wallet: {propiedadDetalle.walletDueno}</p>
            <p>En Herencia: {propiedadDetalle.enHerencia ? "Sí" : "No"}</p>
          </div>
        )}
      </div>

      {/* Transferir propiedad */}
      <div className="mb-4">
        <h3 className="font-semibold">Transferir Propiedad</h3>
        <input
          type="text"
          placeholder="ID Propiedad"
          value={propiedadId}
          onChange={(e) => setPropiedadId(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="CI Nuevo Dueño"
          value={ciNuevo}
          onChange={(e) => setCiNuevo(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={transferirPropiedad}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Transferir
        </button>
      </div>
    </div>
  );
};

export default PropiedadesComponent;
