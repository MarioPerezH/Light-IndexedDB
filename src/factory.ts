namespace IndexedDB {
    export interface IFactory {
        getInstance<T>(instance: T): T;
        getIndexedDB(): IDBFactory;
    }

    class Factory implements IFactory {
        public getInstance<T>(instance: T): T {
            return Object.create(<any>instance);
        }
        public getIndexedDB(): IDBFactory {
            return window.indexedDB || window["mozIndexedDB"] || window["webkitIndexedDB"] || window["msIndexedDB"];
        }
    }
    define([], () => new Factory());
}