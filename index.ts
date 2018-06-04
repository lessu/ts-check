const extend = require("extend");
// Lessu!
export enum BasicTypes{
    number      = "number",
    string      = "string",
    object      = "object",
    boolean     = "boolean",
    any         = "any",
    null        = "null",
    undefined   = "undefined"
}
export const defaultDefinedChecker : DefinedChecker = {}

export type TypeForObject<T> = {
    [K in keyof T]: Type<T[K]>[] | Type<T[K]>
}

export type Type<T> = BasicTypes | ((value:any,args:string[])=>boolean) | TypeForObject<T> | string;

export type DefinedChecker = {
    [ key:string ] : Type<any>;
}

export interface CheckOptions {
    //weak number,"1" is assert success if weakNumber = true,default to false
    weakNumber? : boolean
}
function makeErrorMessage(key:string|null,exceptToBe:string,actual:any){
    if(key && key.length > 0){
        if(actual){
            lastError += `[${key}] except ${exceptToBe},actual = ${JSON.stringify(actual)}\n`;
        }else{
            lastError += `[${key}] ${exceptToBe}\n`;
        }
    }else{
        if(actual){
            lastError += `except ${exceptToBe},actual = ${JSON.stringify(actual)}\n`;
        }else{
            lastError += `${exceptToBe}\n`;
        }
    }
}

const defaultOptions = <CheckOptions>{
    weakNumber : false
}

// aa[] => true,-1,aa
// aa[3]=> true,3,aa
// aa[invalid => false,0,null
function typeArrayCount(type:string) : [boolean,number,string|null]{
    const index = type.lastIndexOf('[');
    if(index < 0){
        return [false,0,null];
    }
    const indexString = type.substring(index);
    if(indexString == "[]"){
        return [true,-1,type.substring(0,index)];
    }
    if( isNaN( <any>indexString.substring(1,indexString.length-1) ) ){
        return [false,0,null];
    }else{
        return [true,parseInt(indexString.substring(1,indexString.length-1)),type.substring(0,index)];
    }
}

//return [typename, args]
function definedTypesParse(type:string) : [string,string[]]{
    const index = type.lastIndexOf("(");
    if(index < 0){
        return [type,[]];
    }
    const typename   = type.substring(0,index);
    let argsString = type.substring(index);
    if(argsString == "()"){
        return [typename,[]];
    }
    argsString = argsString.substring(1,argsString.length -1);
    const args = argsString.split(",");
    return [typename,args];
}

function _checkType<T>(key : string,value:any , type:Type<T> | Type<T>[] ,definedTypes:DefinedChecker,options:CheckOptions) : boolean{
    if(typeof type == "string"){
        const isArray = typeArrayCount(type);
        if(isArray[0]){
            if(!(value instanceof Array)){
                makeErrorMessage(key,"value type to be an array" , value);
                return false
            }
            if(isArray[1]>=0 && value.length != isArray[1]){
                makeErrorMessage(key,"array length="+isArray[1] , value.length);
                return false;
            }
            for(let i = 0; i< value.length;i++){
                if(_checkType(key,value[i] , <BasicTypes>isArray[2] ,definedTypes,options) == false){
                    // makeErrorMessage(`${key}[${i}]`,"value type to be "+isArray[2] , value);
                    return false;
                }
            }
            return true;
        }else{
            if(type == "any") {
                return true;
            }
            if(type == "null"){
                const result = (value == null);
                if(result == false) makeErrorMessage(key,"value to be null" , value);
                return result;
            } 
            if(type == "undefined"){
                const result = (value == undefined);
                if(result == false)if(result == false) makeErrorMessage(key,"value to be undefined" , value);
                return result;
            }
            if(value == undefined){
                makeErrorMessage(key,"is missing",undefined);
                return false;
            }
            if(typeof value == type){
                return true;
            }
            if(options.weakNumber && type == "number" && !isNaN(value)){
                return true;
            }

            // type check with ‘user defined type’
            const definedTypeParse = definedTypesParse(type);
            if(definedTypes && definedTypes[definedTypeParse[0]]){
                const customType = definedTypes[definedTypeParse[0]];
                if(typeof customType == "function"){
                    const result = (<(value:any,arg:string[])=>boolean>customType) (value,definedTypeParse[1]);
                    if(result == false) makeErrorMessage(key,"value type to be " + type, value);
                    return result;
                }else{
                    const result =  _checkType(key , value , customType ,definedTypes,options);
                    if(result == false) makeErrorMessage(key,"value type to be " + type, value);
                    return result;
                }
            }
            return false;
        }
    }else if(typeof type == "function"){
        //cystom type checker;       
        const result = (<(value:any)=>boolean> type)(value);
        if(result == false) makeErrorMessage(key,"value pass function check", value);
        return result;
    }else if(typeof type == "object"){
        if(type instanceof Array){
            for(let i = 0 ;i < type.length;i++){
                if(_checkType(key,value,type[i],definedTypes,options)){
                    return true;
                }
            }
            // makeErrorMessage(key,"value type mismatch", null);
            return false;
        }else{
            //type checker;
            const result = _checkOptions(value,type,definedTypes,options);
            // if(result == false) makeErrorMessage(key,"value type mismatch", null);
            return result;
        }
    }
    return false;
}

function _checkOptions<T>(object : T , typeChecker : TypeForObject<T> , definedTypes:DefinedChecker,options:CheckOptions) : boolean{
    for(let key in typeChecker){
        if(_checkType<T[keyof T]>(key,object[key],typeChecker[key],definedTypes,options) == false){
            // makeErrorMessage(key,"value type mismatch", null);
            return false;
        }
    }
    return true;
}


export function checkType<T extends any>(value:any , type:Type<T> | Type<T>[] ,_definedTypes?:DefinedChecker,_options?:CheckOptions) : boolean{
    lastError = "";
    let options = {};
    extend(options , defaultOptions,_options);
    let definedTypes = {};
    extend(definedTypes , defaultDefinedChecker , _definedTypes);
  
    const result = _checkType("",value,<Type<T>>type,definedTypes,options);

    return result;
}

export let lastError : string|null = null;