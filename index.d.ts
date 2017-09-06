export declare enum BasicTypes {
    number = "number",
    string = "string",
    object = "object",
    boolean = "boolean",
    any = "any",
    null = "null",
    undefined = "undefined",
}
export declare const defaultDefinedChecker: DefinedChecker<any>;
export declare type TypeForObject<T> = {
    [K in keyof T]: Type<T>[] | Type<T>;
};
export declare type Type<T> = BasicTypes | ((value: any) => boolean) | TypeForObject<T> | string;
export declare type DefinedChecker<T> = {
    [key: string]: Type<T>;
};
export declare function checkType<T>(value: any, type: Type<T> | Type<T>[], definedTypes?: DefinedChecker<T>): boolean;
