import React, { useState } from "react";

const EjecutarHerencia = ({ contract, account }) => {
  const [id, setId] = useState("");
  const [ciNuevo, setCiNuevo] = useState("");

  const ejecutar = async () => {
    try {
      await contract.methods.ejecutarHerencia(id, ciNuevo).send({ from: account });
      alert("Transferencia de herencia completada");
    } catch (err) {
      alert("Error en ejecución. Verifique que la herencia esté definida.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-lg border-t-4 border-green-500">
      <h2 className="text-xl font-bold mb-4">⚰️ Ejecutar Traspaso</h2>
      <div className="space-y-3">
        <input 
          placeholder="ID de Propiedad" 
          className="w-full p-2 border rounded-lg"
          onChange={e => setId(e.target.value)}
        />
        <input 
          placeholder="CI del Heredero que toma posesión" 
          className="w-full p-2 border rounded-lg"
          onChange={e => setCiNuevo(e.target.value)}
        />
        <button onClick={ejecutar} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-black transition-all">
          REALIZAR TRANSFERENCIA
        </button>
      </div>
    </div>
  );
};

export default EjecutarHerencia;