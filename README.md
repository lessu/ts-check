# TypeChecker for Typescript

<!-- [![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url] -->

Author : lessu

Description
-----------
A flexable type checker.

tested under typescript 2.3.4;

## Installation
Not published to npm yet.

1.download or clone.

2.tsc


## Features
Flexable,easy type checker for complex object.

## Usage

### import
```
import * as TypeChecker from "type-checker";
```

### Basic Type
Basic type include
```typescript
export enum BasicTypes{
    number      = "number",
    string      = "string",
    object      = "object",
    any         = "any",
    null        = "null",
    undefined   = "undefined"
}
```
Check basic types :
```typescript
TypeCheker.checkType(undefined,"undefined");

TypeCheker.checkType(null,"any");

TypeCheker.checkType(123,"number");

```

### Check Array

```typescript
assert(TypeCheker.checkType([1,2,3,4,5,6],"number[]"));
assert(TypeCheker.checkType([1,2,3],"number[3]"));
assert(!TypeCheker.checkType([1,2,3],"number[2]"));

assert(TypeCheker.checkType([[1],[2],[3]],"number[1][3]"));
assert(TypeCheker.checkType([[1],[2],[3]],"number[][3]"));
```

### Check function
Signature
```typescript 
((value:any)=>boolean);
```
```typescript 
TypeCheker.checkType( { a : "1" },(value)=>{
    return typeof value["a"] == "string";
});
```

### Nested Check
```typescript 
TypeCheker.checkType({a:"1"},{
    a : "string"
});

TypeCheker.checkType({
    a:"1",
    b:{c:1},
    c:{
        d:{
            e:1
        }
    }
},{
    a : "string",
    b : function(value:any){
        return typeof value.c == "number";
    },
    c : {
        d : {
            e : "number"
        }
    }
});
```

### Type array
The checked type can be string number or {a:number};

```typescript
TypeCheker.checkType({a:1},["string","number",{
    a : "number"
}]);
```


### Customized types

```typescript
TypeCheker.checkType(
//to check
{
    biggerThan0 : 2
},
//type
{
    biggerThan0 : ">0"
},
//custom type
{
    ">0" : function( value : any ){
        if(typeof value == "number"){
            return value > 0;
        }else{
            return parseInt(value) > 0
        }
    }
});


TypeCheker.checkType({
    biggerThan0 : [1,2,3,4]
},{
    biggerThan0 : ">0[]"
},{
    ">0" : function(value:any){
        if(typeof value == "number"){
            return value > 0;
        }else{
            return parseInt(value) > 0
        }
    }
});

//or

TypeChecker.checkType(sku,"SetSkuItem[]",{
    SetSkuItem : {
        key         : "string",
        stock       : "number",
        unit        : "number",
        price       : "number",
        cost_price  : "number",
        options     : "number[]"
    }
});
```

### DefinedType With args
If a DefinedType is a function, args are supported;

However,Args will be convert to pure string ; every `,` is recognized as a splitor,
So DO NOT call like CustomType(a,"1,2,3"), It will convert to 
```
"a",
"\"1",
"2",
"3\"
```

```typescript
assert(!
    TypeCheker.checkType({
        biggerThan0 : 6
    },<any>{
        biggerThan0 : "range(0,5)"
    },{
        "range" : function(value:any,args:string[]){
            if(args.length==0){
                return false;
            }else if(args.length == 1){
                return value> parseFloat(args[0]);
            }else{
                return value >= parseFloat(args[0]) && value <= parseFloat(args[1]);
            }
        }
    })
);
```

### Default defined type
```typescript
TypeCheker.defaultDefinedChecker[">0"] = function(value:any){
    if(typeof value == "number"){
        return value > 0;
    }else{
        return parseInt(value) > 0
    }
};
assert(TypeCheker.checkType({a:1},{a:">0"}));
assert(!TypeCheker.checkType({a:-1},{a:">0"}));
```
## Test

mocha tests/index.js

## License
MIT


<!-- [travis-image]: https://img.shields.io/travis/TypeStrong/ts-node.svg?style=flat
[travis-url]: https://travis-ci.org/TypeStrong/ts-node
[coveralls-image]: https://img.shields.io/coveralls/TypeStrong/ts-node.svg?style=flat
[coveralls-url]: https://coveralls.io/r/TypeStrong/ts-node?branch=master -->