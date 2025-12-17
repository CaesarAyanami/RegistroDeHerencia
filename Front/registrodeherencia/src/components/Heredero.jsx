import React, { useState } from "react";
import { useWeb3 } from "./Loader/MetamaskLoader";
import { useNotification } from "../context/NotificationContext";
import ConfirmTransactionModal from "./ConfirmTransactionModal";
import { prepareTransaction } from "../utils/TransactionHandler";

// Subcomponentes que crearemos
import DefinirHerencia from "./Herencias/DefinirHerencia";
import EjecutarHerencia from "./Herencias/EjecutarHerencia";
import ConsultarPlanHerencia from "./Herencias/ConsultarPlan";

const Herencias = () => {
  // Obtenemos los contratos necesarios desde tu Loader
  const { herencias: contract, propiedades: propContract, account, web3 } = useWeb3();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [txDetails, setTxDetails] = useState({ gas: 0, eth: 0, method: null });

  // Manejador de preparación de transacciones (Igual al de Personas)
  const handlePrepare = async (method) => {
    try {
      const res = await prepareTransaction(web3, method, account);
      if (res.success) {
        setTxDetails(res);
        setShowConfirm(true);
      } else {
        showNotification(res.error, "error");
      }
    } catch (err) {
      showNotification("Error al preparar la transacción de herencia", "error");
    }
  };

  const confirmarTransaccion = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await txDetails.method.send({ from: account });
      showNotification("Operación de herencia procesada con éxito", "success");
    } catch (err) {
      showNotification("La transacción falló en la red", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
      {/* Modal de Confirmación Único */}
      <ConfirmTransactionModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmarTransaccion}
        details={txDetails}
        loading={loading}
      />

      {/* Overlay de Carga */}
      {loading && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-md z-[500] flex flex-col items-center justify-center font-black text-purple-600 uppercase tracking-widest">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          Esperando Firma en MetaMask...
        </div>
      )}

      {/* Título de Sección */}
      <div className="border-l-8 border-purple-600 pl-6 mb-12">
        <h1 className="text-5xl font-black text-gray-900 italic uppercase">Herencia Digital</h1>
        <p className="text-gray-400 font-bold">GESTIÓN DE ACTIVOS Y SUCESIÓN BLOCKCHAIN</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Columna Izquierda: Definición (Formulario Principal) */}
        <div className="lg:col-span-7">
          <DefinirHerencia
            contract={contract}
            propContract={propContract}
            account={account}
            onPrepare={handlePrepare}
            showNotification={showNotification}
          />
        </div>

        {/* Columna Derecha: Ejecución y Búsqueda */}
        <div className="lg:col-span-5 space-y-8">
          <EjecutarHerencia
            contract={contract}
            propContract={propContract}
            account={account}
            onPrepare={handlePrepare}
            showNotification={showNotification}
          />
          
          <ConsultarPlanHerencia
            contract={contract}
            propContract={propContract}
            showNotification={showNotification}
          />
        </div>
      </div>
    </div>
  );
};

export default Herencias;