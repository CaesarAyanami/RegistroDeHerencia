import React, { useState } from "react";
import { useWeb3 } from "./Loader/MetamaskLoader";
import { useNotification } from "../context/NotificationContext";
import ConfirmTransactionModal from "./ConfirmTransactionModal";
import { prepareTransaction } from "../utils/TransactionHandler";

// Importamos los subcomponentes
import RegistroEsencial from "./Personas/RegistroEsencial";
import BuscadorPersona from "./Personas/BuscadorPersona";
import EditorDetallado from "./Personas/EditorDetallado";

const Personas = () => {
  const { personas: contract, account, web3 } = useWeb3();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [txDetails, setTxDetails] = useState({ gas: 0, eth: 0, method: null });

  // Estado compartido para el editor
  const [datosEdicion, setDatosEdicion] = useState(null);

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
      showNotification("Error al preparar transacción", "error");
    }
  };

  const confirmarTransaccion = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await txDetails.method.send({ from: account });
      showNotification("Transacción confirmada con éxito", "success");
      setDatosEdicion(null); // Limpiar editor tras éxito
    } catch (err) {
      showNotification("Transacción fallida", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
      <ConfirmTransactionModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmarTransaccion}
        details={txDetails}
        loading={loading}
      />

      {loading && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-md z-[500] flex flex-col items-center justify-center font-black text-blue-600">
          Esperando Confirmación en el Metamask...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-8">
          <RegistroEsencial
            contract={contract}
            account={account}
            onPrepare={handlePrepare}
            showNotification={showNotification}
          />
          <EditorDetallado
            contract={contract}
            account={account}
            data={datosEdicion}
            onCancel={() => setDatosEdicion(null)}
            onPrepare={handlePrepare}
            showNotification={showNotification}
          />
          
          <BuscadorPersona
            contract={contract}
            onEdit={(data) => setDatosEdicion(data)}
            showNotification={showNotification}
          />
        </div>
      </div>
    </div>
  );
};

export default Personas;
