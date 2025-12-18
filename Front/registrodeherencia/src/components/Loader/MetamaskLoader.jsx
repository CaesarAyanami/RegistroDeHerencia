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
          web3: web3
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
        else window.location.reload();
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
  }, []);

  return (
    <Web3Context.Provider value={{ account, web3: contracts.web3, ...contracts }}>
      {visible && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gray-900/90 dark:bg-gray-950/90 backdrop-blur-sm transition-all duration-700 ${status === 'connected' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl flex flex-col items-center max-w-sm w-full mx-4 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
            
            {status === 'loading' && (
              <div className="flex flex-col items-center">
                <div className="relative w-14 h-14 md:w-16 md:h-16 mb-4 md:mb-6">
                  <div className="absolute inset-0 border-4 border-emerald-100 dark:border-emerald-900/50 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg md:text-xl font-black text-gray-800 dark:text-gray-200 animate-pulse tracking-tight">
                  Conectando con Blockchain
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-center text-xs md:text-sm">
                  Preparando contratos y cuenta...
                </p>
              </div>
            )}

            {status === 'connected' && (
              <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4 md:mb-6">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-black text-gray-800 dark:text-gray-200 tracking-tight">
                  ¡Conectado!
                </h3>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xs md:text-sm mt-1 text-center uppercase tracking-wider">
                  Contratos cargados correctamente
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center text-center animate-in fade-in duration-300">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4 md:mb-6 text-red-500 dark:text-red-400">
                  <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-black text-gray-800 dark:text-gray-200 tracking-tight">
                  Error de Conexión
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-4 md:mb-6 text-xs md:text-sm px-2">
                  Asegúrate de estar en la red correcta y tener MetaMask activo.
                </p>
                <button 
                  onClick={initWeb3}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors duration-300 focus:ring-2 focus:ring-emerald-400 focus:outline-none shadow-sm w-full"
                >
                  REINTENTAR CONEXIÓN
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