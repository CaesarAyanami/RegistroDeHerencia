// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IPersonas.sol";
import "./Propiedades.sol";

contract Herencias {
    IPersonas public registroCivil;
    Propiedades public registroPropiedades;

    struct Distribucion {
        string ciHeredero;
        uint256 porcentaje;
    }

    // Herencia definida por propiedad
    mapping(uint256 => Distribucion[]) public herenciaPorPropiedad;

    // Participaciones directas: propiedad → CI → porcentaje
    mapping(uint256 => mapping(string => uint256)) public participacionesPorPropiedad;

    // Listado de CIs con participación en cada propiedad
    mapping(uint256 => string[]) public ciConParticipacion;

    // Eventos
    event HerenciaDefinida(uint256 idPropiedad, string ciDueno, string[] herederos);
    event HerenciaEjecutada(uint256 idPropiedad, string ciAnterior, string ciNuevo);

    constructor(address _direccionPersonas, address _direccionPropiedades) {
        require(_direccionPersonas != address(0), "Direccion del contrato Personas invalida");
        require(_direccionPropiedades != address(0), "Direccion del contrato Propiedades invalida");
        registroCivil = IPersonas(_direccionPersonas);
        registroPropiedades = Propiedades(_direccionPropiedades);
    }

    // Definir herederos y porcentajes de distribución sobre una propiedad existente
    function definirHerencia(
        uint256 _idPropiedad,
        string memory _ciDueno,
        string[] memory _ciHerederos,
        uint256[] memory _porcentajes
    ) public {
        Propiedades.Propiedad memory prop = registroPropiedades.obtenerPropiedad(_idPropiedad);

        // 🔹 Validación por CI, no por wallet
        require(
            keccak256(bytes(prop.ciDueno)) == keccak256(bytes(_ciDueno)),
            "Solo el dueno actual puede definir la herencia"
        );
        require(_ciHerederos.length == _porcentajes.length, "Datos inconsistentes");

        delete herenciaPorPropiedad[_idPropiedad];
        delete ciConParticipacion[_idPropiedad];

        uint256 total = 0;
        for (uint256 i = 0; i < _ciHerederos.length; i++) {
            herenciaPorPropiedad[_idPropiedad].push(Distribucion({
                ciHeredero: _ciHerederos[i],
                porcentaje: _porcentajes[i]
            }));

            participacionesPorPropiedad[_idPropiedad][_ciHerederos[i]] = _porcentajes[i];
            ciConParticipacion[_idPropiedad].push(_ciHerederos[i]);

            total += _porcentajes[i];
        }

        require(total == 100, "La suma de porcentajes debe ser 100");

        emit HerenciaDefinida(_idPropiedad, prop.ciDueno, _ciHerederos);
    }

    // Ejecutar herencia: transferir propiedad completa a un heredero principal
    function ejecutarHerencia(uint256 _idPropiedad, string memory _ciNuevoDueno) public {
        Propiedades.Propiedad memory prop = registroPropiedades.obtenerPropiedad(_idPropiedad);
        require(herenciaPorPropiedad[_idPropiedad].length > 0, "Herencia no definida");

        string memory ciAnterior = prop.ciDueno;

        // 🔹 Ahora pasamos CI actual y CI nuevo
        registroPropiedades.transferirPropiedad(_idPropiedad, ciAnterior, _ciNuevoDueno);

        emit HerenciaEjecutada(_idPropiedad, ciAnterior, _ciNuevoDueno);
    }

    // Consultar toda la herencia de una propiedad
    function obtenerHerencia(uint256 _idPropiedad) public view returns (Distribucion[] memory) {
        return herenciaPorPropiedad[_idPropiedad];
    }

    // Consultar porcentaje de participación de un CI en una propiedad
    function obtenerParticipacion(uint256 _idPropiedad, string memory _ci) public view returns (uint256) {
        return participacionesPorPropiedad[_idPropiedad][_ci];
    }

    // Consultar todas las CIs con participación en una propiedad
    function obtenerCiConParticipacion(uint256 _idPropiedad) public view returns (string[] memory) {
        return ciConParticipacion[_idPropiedad];
    }
}
