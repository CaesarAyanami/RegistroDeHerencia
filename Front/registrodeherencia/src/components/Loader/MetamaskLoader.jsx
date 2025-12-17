import React, { useState, useEffect, createContext, useContext } from 'react';
import Web3 from 'web3';

// IMPORTA TUS ABIS AQUÍ
import PersonasABI from '../../ABI/Personas.json';
import PropiedadesABI from '../../ABI/Propiedades.json';
import RegistroHerenciasABI from '../../ABI/Herencias.json';

const Web3Context = createContext();
export const useWeb3 = () => useContext(Web3Context);

export const MetamaskLoader = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [contracts, setContracts] = useState({
    personas: null,
    propiedades: null,
    herencias: null
  });
  const [status, setStatus] = useState('loading'); // 'loading', 'connected', 'error'
  const [visible, setVisible] = useState(true);

  const initWeb3 = async () => {
    setStatus('loading');
    
    if (window.ethereum) {
      try {
        const web3 = new Web3(window.ethereum);
        
        // 1. Solicitar cuentas
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const userAccount = accounts[0];

        // 2. Obtener Red
        const networkId = await web3.eth.net.getId();

        // 3. Inicializar instancias de contratos
        const initContract = (abiData) => {
          const deployedNetwork = abiData.networks[networkId];
          if (deployedNetwork) {
            return new web3.eth.Contract(abiData.abi, deployedNetwork.address);
          }
          return null;
        };

        const instPersonas = initContract(PersonasABI);
        const instPropiedades = initContract(PropiedadesABI);
        const instHerencias = initContract(RegistroHerenciasABI);

        // Validar si los contratos están en esta red
        if (!instPersonas || !instPropiedades || !instHerencias) {
          console.error("Contratos no detectados en esta red");
          setStatus('error');
          return;
        }

        // 4. Guardar todo en el estado
        setAccount(userAccount);
        setContracts({
          personas: instPersonas,
          propiedades: instPropiedades,
          herencias: instHerencias,
          web3: web3 // También pasamos web3 por si necesitas utilidades como toWei
        });

        setStatus('connected');
        setTimeout(() => setVisible(false), 1500);

      } catch (error) {
        console.error("Error en inicialización:", error);
        setStatus('error');
      }
    } else {
      setStatus('error');
    }
  };

  useEffect(() => {
    initWeb3();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accs) => {
        if (accs.length > 0) setAccount(accs[0]);
        else window.location.reload(); // Recargar si se desconecta
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  return (
    <Web3Context.Provider value={{ account, web3: contracts.web3, ...contracts }}>
      {visible && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm transition-opacity duration-700 ${status === 'connected' ? 'opacity-0' : 'opacity-100'}`}>
          <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm w-full mx-4 border border-gray-100">
            
            {status === 'loading' && (
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16 mb-6">
                  <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 animate-pulse">Conectando Web3...</h3>
                <p className="text-gray-500 mt-2 text-center text-sm">Preparando contratos y cuenta...</p>
              </div>
            )}

            {status === 'connected' && (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">¡Conectado!</h3>
                <p className="text-green-600 font-medium mt-1 text-center">Contratos cargados correctamente.</p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800">Error de inicialización</h3>
                <p className="text-gray-500 mt-2 mb-6 text-sm">Asegúrate de estar en la red correcta y tener MetaMask activo.</p>
                <button 
                  onClick={initWeb3}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-orange-200"
                >
                  Reintentar Conexión
                </button>
              </div>
            )}
            
          </div>
        </div>
      )}
      {!visible && children}
    </Web3Context.Provider>
  );
};