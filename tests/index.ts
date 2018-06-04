import * as TypeCheker from "../index";
import * as mocha from "mocha";
import * as assert from "assert";


describe("Basic Check",function(){
    it("undefined",function(){
        assert(TypeCheker.checkType(undefined,"undefined"));
    });
    it("null",function(){
        assert(TypeCheker.checkType(null,"null"));
    });
    it("string",function(){
        assert(TypeCheker.checkType("asd","string"));
    });
    it("number",function(){
        assert(TypeCheker.checkType(1,"number"));
    });
    it("weak number",function(){
        assert(TypeCheker.checkType("1","number",{},{weakNumber:true}));
    });

    it("object",function(){
        assert(TypeCheker.checkType(1,{}));
    });

    it("any",function(){
        assert(TypeCheker.checkType(function(){},"any"));
        assert(TypeCheker.checkType([],"any"));
        assert(TypeCheker.checkType({},"any"));
        assert(TypeCheker.checkType("a","any"));
        assert(TypeCheker.checkType(1,"any"));
        assert(TypeCheker.checkType(null,"any"));
        assert(TypeCheker.checkType(undefined,"any"));
    });
    it("array",function(){
        assert(TypeCheker.checkType([],"number[]"));
        assert(TypeCheker.checkType([],"string[]"));
        assert(TypeCheker.checkType([1,2,3],"number[]"));
        assert(TypeCheker.checkType([1,2,3],"number[3]"));
        assert(!TypeCheker.checkType([1,2,3],"number[2]"));
        assert(TypeCheker.checkType(["1","2","3"],"string[]"));
        assert(!TypeCheker.checkType([1,"2",3],"number[]"));
        assert(!TypeCheker.checkType([1,"2",{}],"object[]"));
        assert(TypeCheker.checkType([{},[],{}],"object[]"));
        assert(TypeCheker.checkType([{},1,{},"1"],"any[]"));
    });
    it("nest array",function(){
        assert(TypeCheker.checkType([[1],[2],[3]],"number[][]"));
        assert(TypeCheker.checkType([[1],[2],[3]],"number[1][]"));
        assert(TypeCheker.checkType([[1],[2],[3]],"number[1][3]"));
        assert(TypeCheker.checkType([[1],[2],[3]],"number[][3]"));
    });
    it("check function",function(){
        assert(TypeCheker.checkType({a:"1"},function(value){
            return typeof value["a"] == "string";
        }));
        assert(!TypeCheker.checkType({a:"1"},function(value){
            return typeof value["a"] == "number";
        }));
    });
    it("check type",function(){
        assert(TypeCheker.checkType({a:"1"},{
            a : "string"
        }));
        assert(!TypeCheker.checkType({a:"1"},{
            a : "number"
        }));
    });

    it("check missing key",function(){
        assert(!TypeCheker.checkType({},{
            a : "string"
        }));
        console.log(TypeCheker.lastError);
    });
    it("nested type",function(){
        assert(TypeCheker.checkType({a:"1"},{
            a : "string"
        }));
        assert(TypeCheker.checkType({
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
        }));
    });
});
describe("Multi typed",function(){
    it("multi type array",function(){
        assert(TypeCheker.checkType({a:"1"},["string","object"]));

        assert(TypeCheker.checkType({a:"1"},["string",function(value){
            return typeof value.a == "string";
        }]));

        assert(!TypeCheker.checkType({a:1},["string","number"]));

        assert(TypeCheker.checkType({a:1},["string","number",<any>{
            a : "number"
        }]));

        assert(!TypeCheker.checkType({a:1},["string","number",<any>{
            a : "string"
        }]));
    });
});

describe("Customized types",function(){
    it(">0",function(){
        assert(
            TypeCheker.checkType({
                biggerThan0 : 2
            },<any>{
                biggerThan0 : ">0"
            },{
                ">0" : function( value : any ){
                    if(typeof value == "number"){
                        return value > 0;
                    }else{
                        return parseInt(value) > 0
                    }
                }
            })
        );
        assert(
            TypeCheker.checkType({
                biggerThan0 : "2"
            },<any>{
                biggerThan0 : ">0"
            },{
                ">0" : function(value:any){
                    if(typeof value == "number"){
                        return value > 0;
                    }else{
                        return parseInt(value) > 0
                    }
                }
            })
        );
        assert(!
            TypeCheker.checkType({
                biggerThan0 : -1
            },<any>{
                biggerThan0 : ">0"
            },{
                ">0" : function(value:any){
                    if(typeof value == "number"){
                        return value > 0;
                    }else{
                        return parseInt(value) > 0
                    }
                }
            })
        );
    });
    it("with args",function(){
        assert(
            TypeCheker.checkType({
                biggerThan0 : 3
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
    });
});
describe("Customized types with array",function(){
    it(">0",function(){
        assert(
            TypeCheker.checkType({
                biggerThan0 : [1,2,3,4]
            },<any>{
                biggerThan0 : ">0[]"
            },{
                ">0" : function(value:any){
                    if(typeof value == "number"){
                        return value > 0;
                    }else{
                        return parseInt(value) > 0
                    }
                }
            })
        );
        assert(!
            TypeCheker.checkType({
                biggerThan0 : [1,-1,3,4]
            },<any>{
                biggerThan0 : ">0[]"
            },{
                ">0" : function(value:any){
                    if(typeof value == "number"){
                        return value > 0;
                    }else{
                        return parseInt(value) > 0
                    }
                }
            })
        );
    });
});

describe("Type synax",function(){
    it("type should pass compile",function(){
        const CheckObject = {
            a : 1,
            b : 2,
            c : "10"
        }
        const CustomizedType = {
            ">0" : function(value:any){
                if(typeof value == "number"){
                    return value > 0;
                }else{
                    return parseInt(value) > 0
                }
            }
        }
        const check : TypeCheker.TypeForObject<typeof CheckObject>= {
            a : "number",
            b : "number",
            c : ">0"
        };
        assert(TypeCheker.checkType(CheckObject,check,CustomizedType));
    });
});


describe("Default defined type",function(){
    it("type should pass compile",function(){
        TypeCheker.defaultDefinedChecker[">0"] = function(value:any){
            if(typeof value == "number"){
                return value > 0;
            }else{
                return parseInt(value) > 0
            }
        };

        
        assert(TypeCheker.checkType({a:1},{a:">0"}));
        assert(!TypeCheker.checkType({a:-1},{a:">0"}));
    });
});