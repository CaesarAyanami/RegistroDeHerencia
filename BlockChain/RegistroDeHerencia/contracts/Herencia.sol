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

    mapping(uint256 => Distribucion[]) public herenciaPorPropiedad;
    mapping(uint256 => mapping(string => uint256)) public participacionesPorPropiedad;
    mapping(uint256 => string[]) public ciConParticipacion;

    event HerenciaDefinida(uint256 idPropiedad, string ciDueno, string[] herederos);
    event HerenciaEjecutada(uint256 idPropiedad, string ciAnterior, string ciNuevo);

    constructor(address _direccionPersonas, address _direccionPropiedades) {
        require(_direccionPersonas != address(0), "Direccion del contrato Personas invalida");
        require(_direccionPropiedades != address(0), "Direccion del contrato Propiedades invalida");
        registroCivil = IPersonas(_direccionPersonas);
        registroPropiedades = Propiedades(_direccionPropiedades);
    }

    function definirHerencia(
        uint256 _idPropiedad,
        string[] memory _ciHerederos,
        uint256[] memory _porcentajes
    ) public {
        Propiedades.Propiedad memory prop = registroPropiedades.obtenerPropiedad(_idPropiedad);
        require(msg.sender == prop.walletDueno, "Solo el dueno actual puede definir la herencia");
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

    function ejecutarHerencia(uint256 _idPropiedad, string memory _ciNuevoDueno) public {
        Propiedades.Propiedad memory prop = registroPropiedades.obtenerPropiedad(_idPropiedad);
        require(herenciaPorPropiedad[_idPropiedad].length > 0, "Herencia no definida");

        string memory ciAnterior = prop.ciDueno;

        registroPropiedades.transferirPropiedad(_idPropiedad, _ciNuevoDueno);

        emit HerenciaEjecutada(_idPropiedad, ciAnterior, _ciNuevoDueno);
    }

    function obtenerHerencia(uint256 _idPropiedad) public view returns (Distribucion[] memory) {
        return herenciaPorPropiedad[_idPropiedad];
    }

    function obtenerParticipacion(uint256 _idPropiedad, string memory _ci) public view returns (uint256) {
        return participacionesPorPropiedad[_idPropiedad][_ci];
    }

    function obtenerCiConParticipacion(uint256 _idPropiedad) public view returns (string[] memory) {
        return ciConParticipacion[_idPropiedad];
    }
}
