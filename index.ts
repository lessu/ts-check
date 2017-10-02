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
export const defaultDefinedChecker : DefinedChecker<any> = {}

export type TypeForObject<T> = {
    [K in keyof T]: Type<T>[] | Type<T>
}

export type Type<T> = BasicTypes | ((value:any)=>boolean) | TypeForObject<T> | string;

export type DefinedChecker<T> = {
    [key : string] : Type<T>;
}

export interface CheckOptions {
    //weak number,"1" is assert success if weakNumber = true,default to false
    weakNumber? : boolean
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

function _checkType<T>(value:any , type:Type<T>,definedTypes:DefinedChecker<T>,options:CheckOptions) : boolean{
    if(typeof type == "string"){
        const isArray = typeArrayCount(type);
        if(isArray[0]){
            if(!(value instanceof Array)){
                return false
            }
            if(isArray[1]>=0 && value.length != isArray[1]){
                return false;
            }
            for(let i = 0; i< value.length;i++){
                if(_checkType(value[i] , <BasicTypes>isArray[2] ,definedTypes,options) == false){
                    return false;
                }
            }
            return true;
        }else{
            if(type == "any") return true;
            if(type == "null") return value == null;
            if(type == "undefined") return value == undefined;
            if(typeof value == type){
                return true;
            }
            if(options.weakNumber && type == "number" && !isNaN(value)){
                return true;
            }
            const definedTypeParse = definedTypesParse(type);
            if(definedTypes && definedTypes[definedTypeParse[0]]){
                const customType = definedTypes[definedTypeParse[0]];
                if(typeof customType == "function"){
                    return (<(value:any,arg:string[])=>boolean>customType) (value,definedTypeParse[1]);
                }else{
                    return _checkType<T>(value , customType ,definedTypes,options);
                }
            }
            return false;
        }
    }else if(typeof type == "function"){
        //cystom type checker;       
        return (<(value:any)=>boolean> type)(value);
    }else if(typeof type == "object"){
        //type checker;
        return _checkOptions(value,type,definedTypes,options);
    }
    return false;
}

function _checkOptions<T>(object : T , typeChecker : TypeForObject<T> , definedTypes:DefinedChecker<T>,options:CheckOptions) : boolean{
    for(let key in typeChecker){
        if(checkType<T>(object[key],typeChecker[key],definedTypes) == false){
            return false;
        }
    }
    return true;
}


export function checkType<T>(value:any , type:Type<T> | Type<T>[] ,_definedTypes?:DefinedChecker<T>,_options?:CheckOptions) : boolean{
    let options = {};
    Object.assign(options , defaultOptions,_options);
    let definedTypes = {};
    Object.assign(definedTypes , defaultDefinedChecker , _definedTypes);
    
    if(typeof type == "object" && type instanceof Array){
        for(let i = 0 ;i < type.length;i++){
            if(_checkType(value,type[i],definedTypes,options)){
                return true;
            }
        }
        return false;
    }
    return _checkType(value,<Type<T>>type,definedTypes,options);
}