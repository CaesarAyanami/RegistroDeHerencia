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
        bool heredada; // indica si ya fue transferida por herencia
    }

    struct Distribucion {
        string ciHeredero;
        address walletHeredero;
        uint256 porcentaje;
    }

    uint256 private nextPropId = 1;

    // Propiedades y distribución definida
    mapping(uint256 => Propiedad) public propiedades;
    mapping(uint256 => Distribucion[]) public herenciaPorPropiedad;
    mapping(uint256 => bool) public herenciaEjecutada;

    // NUEVO: participaciones e índices para consultas
    // porcentaje por propiedad y wallet heredera
    mapping(uint256 => mapping(address => uint256)) public participacionesPorPropiedad;
    // listado de wallets con participación por propiedad (para iterar)
    mapping(uint256 => address[]) public walletsConParticipacion;
    // índice de propiedades por persona (dueño o heredero)
    mapping(address => uint256[]) public propiedadesPorPersona;

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

        require(msg.sender == wallet, "Solo el dueno puede registrar su propiedad");

        uint256 id = nextPropId++;
        propiedades[id] = Propiedad(id, _descripcion, ci, wallet, false, false);

        // Indexar la propiedad para el dueno
        propiedadesPorPersona[wallet].push(id);

        emit PropiedadRegistrada(id, ci, wallet, _descripcion);
    }

    // Definir herederos (SOLO dueno actual)
    function definirHerencia(uint256 _idPropiedad, string[] memory _ciHerederos, uint256[] memory _porcentajes) public {
        Propiedad storage prop = propiedades[_idPropiedad];
        require(prop.idPropiedad != 0, "Propiedad no existe");
        require(msg.sender == prop.walletDueno, "Solo el dueno actual puede definir la herencia");
        require(!prop.heredada, "Propiedad ya fue transferida por herencia");
        require(_ciHerederos.length == _porcentajes.length, "Datos inconsistentes");
        require(_ciHerederos.length > 0, "Debe haber al menos un heredero");

        // Limpiar definiciones previas
        delete herenciaPorPropiedad[_idPropiedad];
        delete walletsConParticipacion[_idPropiedad];

        // Limpiar participaciones previas
        // Nota: no podemos iterar y borrar mapping anidado sin conocer claves.
        // Se sobrescribira al volver a definir. Para seguridad, dejamos en 0 al final si fuese necesario.

        uint256 total = 0;
        for (uint256 i = 0; i < _ciHerederos.length; i++) {
            uint256 idPersona = registroCivil.obtenerIdPorCi(_ciHerederos[i]);
            (string memory ci, address wallet) = registroCivil.obtenerIdentidad(idPersona);

            require(wallet != address(0), "Heredero sin wallet valida");
            require(keccak256(bytes(ci)) != keccak256(bytes(prop.ciDueno)), "El dueno no puede ser su propio heredero");

            herenciaPorPropiedad[_idPropiedad].push(Distribucion({
                ciHeredero: ci,
                walletHeredero: wallet,
                porcentaje: _porcentajes[i]
            }));

            // Guardar participacion propuesta
            participacionesPorPropiedad[_idPropiedad][wallet] = _porcentajes[i];
            walletsConParticipacion[_idPropiedad].push(wallet);

            total += _porcentajes[i];
        }

        require(total == 100, "La suma de porcentajes debe ser 100");
        prop.enHerencia = true;

        emit HerenciaDefinida(_idPropiedad, prop.ciDueno, _ciHerederos);
    }

    // Ejecutar herencia (SOLO dueno por ahora)
    function ejecutarHerencia(uint256 _idPropiedad) public {
        Propiedad storage prop = propiedades[_idPropiedad];
        require(prop.idPropiedad != 0, "Propiedad no existe");
        require(prop.enHerencia, "Herencia no definida para esta propiedad");
        require(!herenciaEjecutada[_idPropiedad], "Herencia ya ejecutada");
        require(msg.sender == prop.walletDueno, "No autorizado para ejecutar herencia");

        string memory ciAnterior = prop.ciDueno;
        address walletAnterior = prop.walletDueno;

        // Marcar estado
        prop.heredada = true;
        prop.enHerencia = false;
        herenciaEjecutada[_idPropiedad] = true;

        // Indexar la propiedad para cada heredero (si no estaba indexada)
        address[] memory wlts = walletsConParticipacion[_idPropiedad];
        for (uint256 i = 0; i < wlts.length; i++) {
            address w = wlts[i];
            // Indexar: el heredero vera esta propiedad en sus consultas
            propiedadesPorPersona[w].push(_idPropiedad);

            // Emitir transferencia (trazabilidad)
            Distribucion memory dist = herenciaPorPropiedad[_idPropiedad][i];
            emit PropiedadTransferida(_idPropiedad, ciAnterior, walletAnterior, dist.ciHeredero, dist.walletHeredero);
        }

        emit HerenciaEjecutada(_idPropiedad);
    }

    // Consultar propiedad
    function obtenerPropiedad(uint256 _idPropiedad) public view returns (Propiedad memory) {
        require(_idPropiedad > 0 && _idPropiedad < nextPropId, "ID no valido");
        return propiedades[_idPropiedad];
    }

    // Consultar herencia definida (lista detallada)
    function obtenerHerencia(uint256 _idPropiedad) public view returns (Distribucion[] memory) {
        return herenciaPorPropiedad[_idPropiedad];
    }

    // NUEVO: consultar participaciones (wallets + porcentajes) de una propiedad
    function obtenerParticipaciones(uint256 _idPropiedad)
        public
        view
        returns (address[] memory wallets, uint256[] memory porcentajes)
    {
        address[] memory wlts = walletsConParticipacion[_idPropiedad];
        uint256[] memory perc = new uint256[](wlts.length);
        for (uint256 i = 0; i < wlts.length; i++) {
            perc[i] = participacionesPorPropiedad[_idPropiedad][wlts[i]];
        }
        return (wlts, perc);
    }

    // NUEVO: propiedades en las que participa una persona (como dueno o heredero)
    function obtenerPropiedadesPorPersona(address _wallet) public view returns (uint256[] memory) {
        return propiedadesPorPersona[_wallet];
    }

    // NUEVO: porcentaje de una persona en una propiedad concreta
    function obtenerPorcentajeDePersonaEnPropiedad(uint256 _idPropiedad, address _wallet) public view returns (uint256) {
        return participacionesPorPropiedad[_idPropiedad][_wallet];
    }
}
