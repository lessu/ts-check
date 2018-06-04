"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var extend = require("extend");
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
function makeErrorMessage(key, exceptToBe, actual) {
    if (key && key.length > 0) {
        if (actual) {
            exports.lastError += "[" + key + "] except " + exceptToBe + ",actual = " + JSON.stringify(actual) + "\n";
        }
        else {
            exports.lastError += "[" + key + "] " + exceptToBe + "\n";
        }
    }
    else {
        if (actual) {
            exports.lastError += "except " + exceptToBe + ",actual = " + JSON.stringify(actual) + "\n";
        }
        else {
            exports.lastError += exceptToBe + "\n";
        }
    }
}
var defaultOptions = {
    weakNumber: false
};
// aa[] => true,-1,aa
// aa[3]=> true,3,aa
// aa[invalid => false,0,null
function typeArrayCount(type) {
    var index = type.lastIndexOf('[');
    if (index < 0) {
        return [false, 0, null];
    }
    var indexString = type.substring(index);
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
    var index = type.lastIndexOf("(");
    if (index < 0) {
        return [type, []];
    }
    var typename = type.substring(0, index);
    var argsString = type.substring(index);
    if (argsString == "()") {
        return [typename, []];
    }
    argsString = argsString.substring(1, argsString.length - 1);
    var args = argsString.split(",");
    return [typename, args];
}
function _checkType(key, value, type, definedTypes, options) {
    if (typeof type == "string") {
        var isArray = typeArrayCount(type);
        if (isArray[0]) {
            if (!(value instanceof Array)) {
                makeErrorMessage(key, "value type to be an array", value);
                return false;
            }
            if (isArray[1] >= 0 && value.length != isArray[1]) {
                makeErrorMessage(key, "array length=" + isArray[1], value.length);
                return false;
            }
            for (var i = 0; i < value.length; i++) {
                if (_checkType(key, value[i], isArray[2], definedTypes, options) == false) {
                    // makeErrorMessage(`${key}[${i}]`,"value type to be "+isArray[2] , value);
                    return false;
                }
            }
            return true;
        }
        else {
            if (type == "any") {
                return true;
            }
            if (type == "null") {
                var result = (value == null);
                if (result == false)
                    makeErrorMessage(key, "value to be null", value);
                return result;
            }
            if (type == "undefined") {
                var result = (value == undefined);
                if (result == false)
                    if (result == false)
                        makeErrorMessage(key, "value to be undefined", value);
                return result;
            }
            if (value == undefined) {
                makeErrorMessage(key, "is missing", undefined);
                return false;
            }
            if (typeof value == type) {
                return true;
            }
            if (options.weakNumber && type == "number" && !isNaN(value)) {
                return true;
            }
            // type check with ‘user defined type’
            var definedTypeParse = definedTypesParse(type);
            if (definedTypes && definedTypes[definedTypeParse[0]]) {
                var customType = definedTypes[definedTypeParse[0]];
                if (typeof customType == "function") {
                    var result = customType(value, definedTypeParse[1]);
                    if (result == false)
                        makeErrorMessage(key, "value type to be " + type, value);
                    return result;
                }
                else {
                    var result = _checkType(key, value, customType, definedTypes, options);
                    if (result == false)
                        makeErrorMessage(key, "value type to be " + type, value);
                    return result;
                }
            }
            return false;
        }
    }
    else if (typeof type == "function") {
        //cystom type checker;       
        var result = type(value);
        if (result == false)
            makeErrorMessage(key, "value pass function check", value);
        return result;
    }
    else if (typeof type == "object") {
        if (type instanceof Array) {
            for (var i = 0; i < type.length; i++) {
                if (_checkType(key, value, type[i], definedTypes, options)) {
                    return true;
                }
            }
            // makeErrorMessage(key,"value type mismatch", null);
            return false;
        }
        else {
            //type checker;
            var result = _checkOptions(value, type, definedTypes, options);
            // if(result == false) makeErrorMessage(key,"value type mismatch", null);
            return result;
        }
    }
    return false;
}
function _checkOptions(object, typeChecker, definedTypes, options) {
    for (var key in typeChecker) {
        if (_checkType(key, object[key], typeChecker[key], definedTypes, options) == false) {
            // makeErrorMessage(key,"value type mismatch", null);
            return false;
        }
    }
    return true;
}
function checkType(value, type, _definedTypes, _options) {
    exports.lastError = "";
    var options = {};
    extend(options, defaultOptions, _options);
    var definedTypes = {};
    extend(definedTypes, exports.defaultDefinedChecker, _definedTypes);
    var result = _checkType("", value, type, definedTypes, options);
    return result;
}
exports.checkType = checkType;
exports.lastError = null;
//# sourceMappingURL=index.js.map