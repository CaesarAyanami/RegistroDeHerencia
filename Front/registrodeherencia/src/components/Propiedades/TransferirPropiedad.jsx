import React, { useState } from "react";

const TransferirPropiedad = ({ onPrepare, showNotification }) => {
  const [ciActual, setCiActual] = useState("");
  const [id, setId] = useState("");
  const [ciNueva, setCiNueva] = useState("");

  const ejecutarTransferencia = () => {
    // 1. Validaciones básicas
    if (!id || !ciNueva || !ciActual) {
      return showNotification("Faltan datos para la transferencia", "alert");
    }

    if (ciActual.trim() === ciNueva.trim()) {
      return showNotification("No puedes transferir a la misma cédula", "alert");
    }

    try {
      // 2. Ejecución directa
      // Pasamos la lógica al onPrepare como una función simple de una sola línea
      onPrepare(contract => 
        contract.methods.transferirPropiedad(id, ciNueva)
      );

      // 3. Feedback y limpieza
      showNotification("Traspaso enviado a la Blockchain", "success");
      
      // Limpiamos después de un pequeño delay para asegurar que no interfiera con el envío
      setTimeout(() => {
        setCiActual("");
        setId("");
        setCiNueva("");
      }, 1000);

    } catch (error) {
      console.error("Error al preparar transferencia:", error);
      showNotification("Error al conectar con el contrato", "alert");
    }
  };

  return (
    <section className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
          <span className="material-icons text-lg">swap_horiz</span>
        </div>
        <h2 className="text-xl font-black italic text-gray-800 tracking-tight uppercase">Transferencia</h2>
      </div>

      <div className="space-y-4">
        <input 
          className="w-full bg-gray-50 border-2 border-transparent focus:border-red-200 outline-none p-4 rounded-2xl font-bold text-gray-600"
          placeholder="Cédula Origen"
          value={ciActual}
          onChange={e => setCiActual(e.target.value)}
        />

        <input 
          type="number"
          className="w-full bg-red-50/50 border-2 border-transparent focus:border-red-200 outline-none p-4 rounded-2xl font-bold text-gray-600"
          placeholder="ID Propiedad #"
          value={id}
          onChange={e => setId(e.target.value)}
        />

        <input 
          className="w-full bg-gray-50 border-2 border-transparent focus:border-red-200 outline-none p-4 rounded-2xl font-bold text-gray-600"
          placeholder="Cédula Destino"
          value={ciNueva}
          onChange={e => setCiNueva(e.target.value)}
        />
        
        <button 
          onClick={ejecutarTransferencia}
          className="w-full py-4 bg-red-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
        >
          EJECUTAR TRASPASO
        </button>
      </div>
    </section>
  );
};

export default TransferirPropiedad;