import React, { useState } from "react";
import { useWeb3 } from './Loader/MetamaskLoader';
import { useNotification } from '../context/NotificationContext';
import ConfirmTransactionModal from './ConfirmTransactionModal';
import { prepareTransaction } from '../utils/TransactionHandler';

import RegistroPropiedad from './Propiedades/RegistroPropiedad';
import TransferirPropiedad from './Propiedades/TransferirPropiedad';
import VisorPropiedades from './Propiedades/VisorPropiedades';

const Propiedades = () => {
  const { propiedades: contract, account, web3 } = useWeb3();
  const { showNotification } = useNotification();

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [txDetails, setTxDetails] = useState({ gas: 0, eth: 0, method: null });

  const handlePrepare = async (methodFactory) => {
    try {
      const method = methodFactory(contract); // Obtenemos el método desde el subcomponente
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
      showNotification("Registro Blockchain Exitoso", "success");
    } catch (err) {
      showNotification("Transacción rechazada", "error");
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
        <div className="fixed inset-0 bg-white/80 backdrop-blur-xl z-[500] flex flex-col items-center justify-center font-black text-blue-600">
           <div className="w-16 h-16 border-4 border-t-blue-600 border-blue-100 rounded-full animate-spin mb-4"></div>
           PROCESANDO EN LA RED BLOCKCHAIN...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lado Izquierdo: Acciones */}
        <div className="lg:col-span-5 space-y-8">
          <RegistroPropiedad onPrepare={handlePrepare} showNotification={showNotification} />
          <TransferirPropiedad onPrepare={handlePrepare} showNotification={showNotification} />
        </div>

        {/* Lado Derecho: Listado y Consultas */}
        <div className="lg:col-span-7">
          <VisorPropiedades contract={contract} showNotification={showNotification} />
        </div>
      </div>
    </div>
  );
};

export default Propiedades;