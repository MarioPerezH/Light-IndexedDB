namespace IndexedDB {
    interface IStore {
        name: string;
        primaryKey: string;
    }

    export interface IDataBase {
        generateDataBase(name: string, version: number, stores: IStore[]): Facades.IPromise<boolean>;
        getDataBase(name: string, version: number): IndexedDB.ICRUD;
        deleteDataBase(name: string): Facades.IPromise<boolean>
    }

    class DataBase {
        constructor(private $q: Facades.IPromiseService,
            private $factory: IndexedDB.IFactory,
            private $crud: IndexedDB.ICRUDConfig) {

        }
        public getDataBase(name: string, version: number): IndexedDB.ICRUD {
            let instance = this.$factory.getInstance(this.$crud);
            instance.setConfig(name, version);
            return instance;
        }

        public generateDataBase(name: string, version: number, stores: IStore[]): Facades.IPromise<boolean> {
            let defer = this.$q.defer<boolean>();

            if (!name || !version) {
                defer.reject('No se ha especificado una configuración para la base de datos');
            }

            if (!(stores || []).length) {
                defer.reject('No se ha especificado stores a crear');
            }

            let openDB: IDBOpenDBRequest = this.$factory.getIndexedDB().open(name, version);

            openDB.onsuccess = (e) => {
                defer.resolve(true);

            }

            openDB.onupgradeneeded = (e: IDBVersionChangeEvent) => {
                let db: IDBDatabase = e.target["result"];

                this.updateDataBase(db, stores);

                defer.resolve(true);
            }

            openDB.onerror = (e) => {
                defer.reject(e);
            }

            return defer.promise;
        }

        public updateDataBase(db: IDBDatabase, stores: IStore[]) {
            if (!db.objectStoreNames.length) {
                stores.forEach(store => {
                    db.createObjectStore(store.name, { keyPath: store.primaryKey, autoIncrement: true });
                });
                return;
            }

            stores.forEach(store => {
                if (!db.objectStoreNames.contains(store.name)) {
                    db.createObjectStore(store.name, { keyPath: store.primaryKey, autoIncrement: true });
                }
            });

            let i = 0,
                count = db.objectStoreNames.length - 1;

            for (; i <= count; i++) {
                let name: string = db.objectStoreNames.item(i) || '',
                    storage = stores.filter(store => store.name === name)[0];

                if (!storage) {
                    db.deleteObjectStore(name);
                }
            }
        }

        public deleteDataBase(name: string): Facades.IPromise<boolean> {
            let openDB: IDBOpenDBRequest = this.$factory.getIndexedDB().deleteDatabase(name),
                defer = this.$q.defer<boolean>();

            openDB.onsuccess = (e) => {
                defer.resolve(true);
            }

            openDB.onerror = (e) => {
                defer.reject(e);
            }
            return defer.promise;
        }
    }
    define(['promise', 'factory', 'crud'], (promise, factory, crud) => new DataBase(promise, factory, crud));
}