import React, { useState } from "react";

export default function DAppPersona() {
  const [cedula, setCedula] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");

  const registrarPersona = () => {
    alert(
      `Mock: Persona registrada\nCI: ${cedula}\nNombre: ${nombres} ${apellidos}`
    );
  };

  return (
    <div className="bg-white p-6 rounded shadow mt-6">
      <h2 className="text-xl font-bold mb-4">Registro de Testador</h2>
      <input
        type="text"
        placeholder="Cédula"
        value={cedula}
        onChange={(e) => setCedula(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="text"
        placeholder="Nombres"
        value={nombres}
        onChange={(e) => setNombres(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <input
        type="text"
        placeholder="Apellidos"
        value={apellidos}
        onChange={(e) => setApellidos(e.target.value)}
        className="border p-2 mb-2 w-full"
      />
      <button
        onClick={registrarPersona}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Registrar Testador
      </button>
    </div>
  );
}
