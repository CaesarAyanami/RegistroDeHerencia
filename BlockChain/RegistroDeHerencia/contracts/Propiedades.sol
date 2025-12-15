// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./IPersonas.sol";

contract Propiedades {
    IPersonas private personasContract;

    constructor(address _personasAddress) {
        personasContract = IPersonas(_personasAddress);
    }

    struct Propiedad {
        uint256 idPropiedad;
        string descripcion;
        string ciDueno;
        address walletDueno;
        bool enHerencia;
    }

    uint256 private nextPropId = 1;
    mapping(uint256 => Propiedad) private propiedades;
    mapping(string => uint256[]) private propiedadesPorCI;

    event PropiedadRegistrada(uint256 idPropiedad, string ciDueno, address walletDueno);
    event PropiedadTransferida(uint256 idPropiedad, string ciAnteriorDueno, string ciNuevoDueno);

    // Registrar propiedad VALIDANDO CI contra Personas
    function registrarPropiedad(string memory _ciDueno, string memory _descripcion) public {
        uint256 idPersona = personasContract.obtenerIdPorCi(_ciDueno);
        (, address wallet) = personasContract.obtenerIdentidad(idPersona);

        require(wallet == msg.sender, "Solo el dueno puede registrar su propiedad");

        uint256 idProp = nextPropId++;
        propiedades[idProp] = Propiedad({
            idPropiedad: idProp,
            descripcion: _descripcion,
            ciDueno: _ciDueno,
            walletDueno: wallet,
            enHerencia: false
        });

        propiedadesPorCI[_ciDueno].push(idProp);

        emit PropiedadRegistrada(idProp, _ciDueno, wallet);
    }

    // Transferir propiedad SOLO con CI (wallet se mantiene como msg.sender)
    function transferirPropiedad(uint256 _idPropiedad, string memory _ciNuevoDueno) public {
        Propiedad storage prop = propiedades[_idPropiedad];
        require(prop.idPropiedad != 0, "Propiedad no existe");
        require(prop.walletDueno == msg.sender, "No eres el dueno actual");

        string memory ciAnteriorDueno = prop.ciDueno;

        prop.ciDueno = _ciNuevoDueno;
        prop.walletDueno = msg.sender; // se mantiene la misma cuenta

        propiedadesPorCI[_ciNuevoDueno].push(_idPropiedad);

        emit PropiedadTransferida(_idPropiedad, ciAnteriorDueno, _ciNuevoDueno);
    }

    // Consultar propiedad por ID
    function obtenerPropiedad(uint256 _idPropiedad) public view returns (Propiedad memory) {
        require(propiedades[_idPropiedad].idPropiedad != 0, "Propiedad no encontrada");
        return propiedades[_idPropiedad];
    }

    // Listar todas las propiedades de un usuario según su CI
    function listarPropiedadesPorCI(string memory _ciPersona) public view returns (Propiedad[] memory) {
        uint256[] memory ids = propiedadesPorCI[_ciPersona];
        Propiedad[] memory result = new Propiedad[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = propiedades[ids[i]];
        }
        return result;
    }

    // Contar propiedades de un usuario por CI
    function contarPropiedadesPorCI(string memory _ciPersona) public view returns (uint256) {
        return propiedadesPorCI[_ciPersona].length;
    }

    // Marcar propiedad como en herencia
    function marcarEnHerencia(uint256 _idPropiedad) public {
        require(propiedades[_idPropiedad].idPropiedad != 0, "Propiedad no existe");
        propiedades[_idPropiedad].enHerencia = true;
    }
}