export declare enum BasicTypes {
    number = "number",
    string = "string",
    object = "object",
    boolean = "boolean",
    any = "any",
    null = "null",
    undefined = "undefined",
}
export declare const defaultDefinedChecker: DefinedChecker;
export declare type TypeForObject<T> = {
    [K in keyof T]: Type<T[K]>[] | Type<T[K]>;
};
export declare type Type<T> = BasicTypes | ((value: any, args: string[]) => boolean) | TypeForObject<T> | string;
export declare type DefinedChecker = {
    [key: string]: Type<any>;
};
export interface CheckOptions {
    weakNumber?: boolean;
}
export declare function checkType<T extends any>(value: any, type: Type<T> | Type<T>[], _definedTypes?: DefinedChecker, _options?: CheckOptions): boolean;
export declare let lastError: string | null;
