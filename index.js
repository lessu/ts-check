"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Lessu!
var BasicTypes;
(function (BasicTypes) {
    BasicTypes["number"] = "number";
    BasicTypes["string"] = "string";
    BasicTypes["object"] = "object";
    BasicTypes["boolean"] = "boolean";
    BasicTypes["any"] = "any";
    BasicTypes["null"] = "null";
    BasicTypes["undefined"] = "undefined";
})(BasicTypes = exports.BasicTypes || (exports.BasicTypes = {}));
exports.defaultDefinedChecker = {};
const defaultOptions = {
    weakNumber: false
};
// aa[] => true,-1,aa
// aa[3]=> true,3,aa
// aa[invalid => false,0,null
function typeArrayCount(type) {
    const index = type.lastIndexOf('[');
    if (index < 0) {
        return [false, 0, null];
    }
    const indexString = type.substring(index);
    if (indexString == "[]") {
        return [true, -1, type.substring(0, index)];
    }
    if (isNaN(indexString.substring(1, indexString.length - 1))) {
        return [false, 0, null];
    }
    else {
        return [true, parseInt(indexString.substring(1, indexString.length - 1)), type.substring(0, index)];
    }
}
//return [typename, args]
function definedTypesParse(type) {
    const index = type.lastIndexOf("(");
    if (index < 0) {
        return [type, []];
    }
    const typename = type.substring(0, index);
    let argsString = type.substring(index);
    if (argsString == "()") {
        return [typename, []];
    }
    argsString = argsString.substring(1, argsString.length - 1);
    const args = argsString.split(",");
    return [typename, args];
}
function _checkType(value, type, definedTypes, options) {
    if (typeof type == "string") {
        const isArray = typeArrayCount(type);
        if (isArray[0]) {
            if (!(value instanceof Array)) {
                return false;
            }
            if (isArray[1] >= 0 && value.length != isArray[1]) {
                return false;
            }
            for (let i = 0; i < value.length; i++) {
                if (_checkType(value[i], isArray[2], definedTypes, options) == false) {
                    return false;
                }
            }
            return true;
        }
        else {
            if (type == "any")
                return true;
            if (type == "null")
                return value == null;
            if (type == "undefined")
                return value == undefined;
            if (typeof value == type) {
                return true;
            }
            if (options.weakNumber && type == "number" && !isNaN(value)) {
                return true;
            }
            const definedTypeParse = definedTypesParse(type);
            if (definedTypes && definedTypes[definedTypeParse[0]]) {
                const customType = definedTypes[definedTypeParse[0]];
                if (typeof customType == "function") {
                    return customType(value, definedTypeParse[1]);
                }
                else {
                    return _checkType(value, customType, definedTypes, options);
                }
            }
            return false;
        }
    }
    else if (typeof type == "function") {
        //cystom type checker;       
        return type(value);
    }
    else if (typeof type == "object") {
        //type checker;
        return _checkOptions(value, type, definedTypes, options);
    }
    return false;
}
function _checkOptions(object, typeChecker, definedTypes, options) {
    for (let key in typeChecker) {
        if (checkType(object[key], typeChecker[key], definedTypes) == false) {
            return false;
        }
    }
    return true;
}
function checkType(value, type, _definedTypes, _options) {
    let options = {};
    Object.assign(options, defaultOptions, _options);
    let definedTypes = {};
    Object.assign(definedTypes, exports.defaultDefinedChecker, _definedTypes);
    if (typeof type == "object" && type instanceof Array) {
        for (let i = 0; i < type.length; i++) {
            if (_checkType(value, type[i], definedTypes, options)) {
                return true;
            }
        }
        return false;
    }
    return _checkType(value, type, definedTypes, options);
}
exports.checkType = checkType;
//# sourceMappingURL=index.js.map