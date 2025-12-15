import React, { useState, useEffect } from "react";
import Web3 from "web3";
import HerenciaABI from "../ABI/RegistroPropiedadesHerencia.json"; // ABI generado por Truffle

const HerenciaComponent = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  // Campos para registrar propiedad
  const [ciDueno, setCiDueno] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // Campos para definir herencia
  const [idPropiedad, setIdPropiedad] = useState("");
  const [herederos, setHerederos] = useState([]); // lista de CI
  const [porcentajes, setPorcentajes] = useState([]); // lista de porcentajes
  const [ciHeredero, setCiHeredero] = useState("");
  const [porcentaje, setPorcentaje] = useState("");

  // Resultados de consulta
  const [propiedad, setPropiedad] = useState(null);
  const [herenciaDefinida, setHerenciaDefinida] = useState([]);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const networkId = await web3.eth.net.getId();
        const deployedNetwork = HerenciaABI.networks[networkId];

        if (!deployedNetwork) {
          alert("Contrato no desplegado en esta red");
          return;
        }

        const instance = new web3.eth.Contract(
          HerenciaABI.abi,
          deployedNetwork.address
        );
        setContract(instance);
      } else {
        alert("MetaMask no detectado");
      }
    };
    init();
  }, []);

  // Registrar propiedad
  const registrarPropiedad = async () => {
    try {
      await contract.methods
        .registrarPropiedad(ciDueno, descripcion)
        .send({ from: account });
      alert("Propiedad registrada con éxito");
    } catch (err) {
      console.error(err);
      alert("Error al registrar propiedad");
    }
  };

  // Agregar heredero a la lista temporal
  const agregarHeredero = () => {
    setHerederos([...herederos, ciHeredero]);
    setPorcentajes([...porcentajes, parseInt(porcentaje)]);
    setCiHeredero("");
    setPorcentaje("");
  };

  // Definir herencia
  const definirHerencia = async () => {
    try {
      await contract.methods
        .definirHerencia(idPropiedad, herederos, porcentajes)
        .send({ from: account });
      alert("Herencia definida con éxito");
    } catch (err) {
      console.error(err);
      alert("Error al definir herencia");
    }
  };

  // Ejecutar herencia
  const ejecutarHerencia = async () => {
    try {
      await contract.methods.ejecutarHerencia(idPropiedad).send({ from: account });
      alert("Herencia ejecutada con éxito");
    } catch (err) {
      console.error(err);
      alert("Error al ejecutar herencia");
    }
  };

  // Consultar propiedad
  const consultarPropiedad = async () => {
    try {
      const result = await contract.methods.obtenerPropiedad(idPropiedad).call();
      setPropiedad(result);
    } catch (err) {
      console.error(err);
      alert("Error al consultar propiedad");
    }
  };

  // Consultar herencia definida
  const consultarHerencia = async () => {
    try {
      const result = await contract.methods.obtenerHerencia(idPropiedad).call();
      setHerenciaDefinida(result);
    } catch (err) {
      console.error(err);
      alert("Error al consultar herencia");
    }
  };

  return (
    <div>
      <h2>Registro de Propiedades con Herencia</h2>
      <p>Cuenta conectada: {account}</p>

      <h3>Registrar Propiedad</h3>
      <input
        type="text"
        placeholder="CI Dueño"
        value={ciDueno}
        onChange={(e) => setCiDueno(e.target.value)}
      />
      <input
        type="text"
        placeholder="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
      />
      <button onClick={registrarPropiedad}>Registrar Propiedad</button>

      <h3>Definir Herencia</h3>
      <input
        type="text"
        placeholder="ID Propiedad"
        value={idPropiedad}
        onChange={(e) => setIdPropiedad(e.target.value)}
      />
      <input
        type="text"
        placeholder="CI Heredero"
        value={ciHeredero}
        onChange={(e) => setCiHeredero(e.target.value)}
      />
      <input
        type="number"
        placeholder="Porcentaje"
        value={porcentaje}
        onChange={(e) => setPorcentaje(e.target.value)}
      />
      <button onClick={agregarHeredero}>Agregar Heredero</button>
      <button onClick={definirHerencia}>Definir Herencia</button>

      <h4>Herederos agregados:</h4>
      <ul>
        {herederos.map((ci, index) => (
          <li key={index}>
            {ci} - {porcentajes[index]}%
          </li>
        ))}
      </ul>

      <h3>Ejecutar Herencia</h3>
      <button onClick={ejecutarHerencia}>Ejecutar Herencia</button>

      <h3>Consultar Propiedad</h3>
      <button onClick={consultarPropiedad}>Consultar Propiedad</button>
      {propiedad && (
        <div>
          <h4>Datos de la Propiedad</h4>
          <p>ID: {propiedad.idPropiedad}</p>
          <p>Descripción: {propiedad.descripcion}</p>
          <p>CI Dueño: {propiedad.ciDueno}</p>
          <p>Wallet Dueño: {propiedad.walletDueno}</p>
          <p>En Herencia: {propiedad.enHerencia ? "Sí" : "No"}</p>
        </div>
      )}

      <h3>Consultar Herencia</h3>
      <button onClick={consultarHerencia}>Consultar Herencia</button>
      {herenciaDefinida.length > 0 && (
        <div>
          <h4>Herencia definida</h4>
          <ul>
            {herenciaDefinida.map((h, index) => (
              <li key={index}>
                CI: {h.ciHeredero}, Wallet: {h.walletHeredero}, Porcentaje: {h.porcentaje}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HerenciaComponent;
