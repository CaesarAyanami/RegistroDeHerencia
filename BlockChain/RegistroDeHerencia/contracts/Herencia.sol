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
    }

    struct Distribucion {
        string ciHeredero;
        address walletHeredero;
        uint256 porcentaje; // porcentaje de la propiedad
    }

    uint256 private nextPropId = 1;

    // Propiedades y distribución definida
    mapping(uint256 => Propiedad) public propiedades;
    mapping(uint256 => Distribucion[]) public herenciaPorPropiedad;

    // Participaciones por propiedad
    mapping(uint256 => mapping(address => uint256)) public participacionesPorPropiedad;
    mapping(uint256 => address[]) public walletsConParticipacion;

    IPersonas public registroCivil;

    // Eventos
    event PropiedadRegistrada(uint256 idPropiedad, string ciDueno, address walletDueno, string descripcion);
    event HerenciaDefinida(uint256 idPropiedad, string ciDueno, string[] herederos);
    event PropiedadTransferida(uint256 idPropiedad, string ciAnterior, string ciNuevo, address walletNuevo);

    constructor(address _direccionPersonas) {
        require(_direccionPersonas != address(0), "Direccion del contrato Personas invalida");
        registroCivil = IPersonas(_direccionPersonas);
    }

    // Registrar nueva propiedad vinculada a una persona existente
    function registrarPropiedad(string memory _ciDueno, string memory _descripcion) public {
        uint256 idPersona = registroCivil.obtenerIdPorCi(_ciDueno);
        (string memory ci, address wallet) = registroCivil.obtenerIdentidad(idPersona);

        uint256 id = nextPropId++;
        propiedades[id] = Propiedad(id, _descripcion, ci, wallet, false);

        emit PropiedadRegistrada(id, ci, wallet, _descripcion);
    }

    // Definir herederos y porcentajes de distribución
    function definirHerencia(uint256 _idPropiedad, string[] memory _ciHerederos, uint256[] memory _porcentajes) public {
        Propiedad storage prop = propiedades[_idPropiedad];
        require(msg.sender == prop.walletDueno, "Solo el dueno actual puede definir la herencia");
        require(_ciHerederos.length == _porcentajes.length, "Datos inconsistentes");

        delete herenciaPorPropiedad[_idPropiedad]; // limpiar herencia previa
        delete walletsConParticipacion[_idPropiedad]; // limpiar lista previa

        uint256 total = 0;
        for (uint256 i = 0; i < _ciHerederos.length; i++) {
            uint256 idPersona = registroCivil.obtenerIdPorCi(_ciHerederos[i]);
            (string memory ci, address wallet) = registroCivil.obtenerIdentidad(idPersona);

            herenciaPorPropiedad[_idPropiedad].push(Distribucion({
                ciHeredero: ci,
                walletHeredero: wallet,
                porcentaje: _porcentajes[i]
            }));

            // Guardar participación propuesta
            participacionesPorPropiedad[_idPropiedad][wallet] = _porcentajes[i];
            walletsConParticipacion[_idPropiedad].push(wallet);

            total += _porcentajes[i];
        }

        require(total == 100, "La suma de porcentajes debe ser 100");

        prop.enHerencia = true;

        emit HerenciaDefinida(_idPropiedad, prop.ciDueno, _ciHerederos);
    }

    // Transferir propiedad según herencia definida
    function ejecutarHerencia(uint256 _idPropiedad) public {
        Propiedad storage prop = propiedades[_idPropiedad];
        require(prop.enHerencia, "Herencia no definida para esta propiedad");

        string memory ciAnterior = prop.ciDueno;

        // Distribuir la propiedad entre los herederos
        for (uint256 i = 0; i < herenciaPorPropiedad[_idPropiedad].length; i++) {
            Distribucion memory dist = herenciaPorPropiedad[_idPropiedad][i];
            emit PropiedadTransferida(_idPropiedad, ciAnterior, dist.ciHeredero, dist.walletHeredero);
        }

        prop.enHerencia = false;
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

    // Consultar porcentaje de participación de un wallet en una propiedad
    function obtenerParticipacion(uint256 _idPropiedad, address _wallet) public view returns (uint256) {
        return participacionesPorPropiedad[_idPropiedad][_wallet];
    }

    // Consultar todas las wallets con participación en una propiedad
    function obtenerWalletsConParticipacion(uint256 _idPropiedad) public view returns (address[] memory) {
        return walletsConParticipacion[_idPropiedad];
    }
}
