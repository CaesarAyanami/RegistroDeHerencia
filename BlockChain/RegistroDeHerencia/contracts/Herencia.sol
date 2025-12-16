// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IPersonas.sol";

contract RegistroPropiedadesHerencia {
    struct Propiedad {
        uint256 idPropiedad;
        string descripcion;
        string ciDueno;
        address walletDueno;
        bool enHerencia;
        bool heredada; // Nuevo: indica si ya fue transferida por herencia
    }

    struct Distribucion {
        string ciHeredero;
        address walletHeredero;
        uint256 porcentaje;
    }

    uint256 private nextPropId = 1;
    mapping(uint256 => Propiedad) public propiedades;
    mapping(uint256 => Distribucion[]) public herenciaPorPropiedad;
    mapping(uint256 => bool) public herenciaEjecutada; // Control de ejecución única

    IPersonas public registroCivil;

    // Eventos
    event PropiedadRegistrada(uint256 idPropiedad, string ciDueno, address walletDueno, string descripcion);
    event HerenciaDefinida(uint256 idPropiedad, string ciDueno, string[] herederos);
    event PropiedadTransferida(uint256 idPropiedad, string ciAnterior, address walletAnterior, string ciNuevo, address walletNuevo);
    event HerenciaEjecutada(uint256 idPropiedad);

    constructor(address _direccionPersonas) {
        require(_direccionPersonas != address(0), "Direccion del contrato Personas invalida");
        registroCivil = IPersonas(_direccionPersonas);
    }

    // Registrar nueva propiedad (SOLO el dueño puede registrar)
    function registrarPropiedad(string memory _ciDueno, string memory _descripcion) public {
        uint256 idPersona = registroCivil.obtenerIdPorCi(_ciDueno);
        (string memory ci, address wallet) = registroCivil.obtenerIdentidad(idPersona);
        
        // IMPORTANTE: Validar que quien registra es el dueño
        require(msg.sender == wallet, "Solo el dueno puede registrar su propiedad");

        uint256 id = nextPropId++;
        propiedades[id] = Propiedad(id, _descripcion, ci, wallet, false, false);

        emit PropiedadRegistrada(id, ci, wallet, _descripcion);
    }

    // Definir herederos (SOLO dueño actual)
    function definirHerencia(uint256 _idPropiedad, string[] memory _ciHerederos, uint256[] memory _porcentajes) public {
        Propiedad storage prop = propiedades[_idPropiedad];
        require(prop.idPropiedad != 0, "Propiedad no existe");
        require(msg.sender == prop.walletDueno, "Solo el dueno actual puede definir la herencia");
        require(!prop.heredada, "Propiedad ya fue transferida por herencia");
        require(_ciHerederos.length == _porcentajes.length, "Datos inconsistentes");
        require(_ciHerederos.length > 0, "Debe haber al menos un heredero");

        delete herenciaPorPropiedad[_idPropiedad];

        uint256 total = 0;
        for (uint256 i = 0; i < _ciHerederos.length; i++) {
            uint256 idPersona = registroCivil.obtenerIdPorCi(_ciHerederos[i]);
            (string memory ci, address wallet) = registroCivil.obtenerIdentidad(idPersona);
            
            // Validar que el heredero no sea el mismo dueño
            require(keccak256(bytes(ci)) != keccak256(bytes(prop.ciDueno)), 
                "El dueno no puede ser su propio heredero");

            herenciaPorPropiedad[_idPropiedad].push(Distribucion({
                ciHeredero: ci,
                walletHeredero: wallet,
                porcentaje: _porcentajes[i]
            }));

            total += _porcentajes[i];
        }

        require(total == 100, "La suma de porcentajes debe ser 100");
        prop.enHerencia = true;

        emit HerenciaDefinida(_idPropiedad, prop.ciDueno, _ciHerederos);
    }

    // Ejecutar herencia (SOLO dueño o herederos después de fallecimiento)
    function ejecutarHerencia(uint256 _idPropiedad) public {
        Propiedad storage prop = propiedades[_idPropiedad];
        require(prop.idPropiedad != 0, "Propiedad no existe");
        require(prop.enHerencia, "Herencia no definida para esta propiedad");
        require(!herenciaEjecutada[_idPropiedad], "Herencia ya ejecutada");
        
        // En un sistema real, aquí habría validación de fallecimiento
        // Por ahora, solo el dueño o un executor autorizado puede ejecutar
        require(msg.sender == prop.walletDueno, "No autorizado para ejecutar herencia");

        string memory ciAnterior = prop.ciDueno;
        address walletAnterior = prop.walletDueno;

        // IMPORTANTE: Actualizar propiedad (en este caso se marca como heredada)
        prop.heredada = true;
        prop.enHerencia = false;
        herenciaEjecutada[_idPropiedad] = true;

        // Notificar transferencia a cada heredero
        for (uint256 i = 0; i < herenciaPorPropiedad[_idPropiedad].length; i++) {
            Distribucion memory dist = herenciaPorPropiedad[_idPropiedad][i];
            
            // En un sistema real aquí se actualizarían los registros de propiedad
            // Por ahora solo emitimos el evento
            emit PropiedadTransferida(_idPropiedad, ciAnterior, walletAnterior, 
                                     dist.ciHeredero, dist.walletHeredero);
        }

        emit HerenciaEjecutada(_idPropiedad);
    }

    // Nuevo: Para sistemas reales, necesitarías
    function transferirPropiedadCompleta(uint256 _idPropiedad, string memory _ciNuevoDueno, address _walletNuevo) public {
        // Esta función realmente transferiría la propiedad completa
        // Solo para demostración de cómo sería
    }

    // Consultar propiedad
    function obtenerPropiedad(uint256 _idPropiedad) public view returns (Propiedad memory) {
        require(_idPropiedad > 0 && _idPropiedad < nextPropId, "ID no valido");
        return propiedades[_idPropiedad];
    }

    // Consultar herencia definida
    function obtenerHerencia(uint256 _idPropiedad) public view returns (Distribucion[] memory) {
        return herenciaPorPropiedad[_idPropiedad];
    }
}