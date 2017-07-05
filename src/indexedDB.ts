//namespace IndexedDB {
//    interface IConfig {
//        name: string;
//        version: number;
//    }
//    interface IStorage {
//        name: string;
//        primaryKey: string;
//    }

//    export interface IDB {
//        createDB(name: string, version: number): void;
//        run(callback?: Function): void;
//        callbackNewVersion(callback: Function): void;
//        createStorage(name: string | number, primaryKey: string): void;
//        addRecord<TObject>(name: string | number, data: TObject, callbackResult?: (primaryKeyValue: any) => void): void;
//        getById<T>(name: string | number, primaryKeyValue: any, callbackResult: (data: T) => void);
//        getAll<T>(name: string | number, callbackResult: (data: T[]) => void): void;
//        getRecords<T>(name: string | number, predicate: (item: T) => boolean, callbackResult: (data: T[]) => void): void;
//        updateRecord<T>(name: string | number, primaryKeyValue: any, newData: T): void;
//        deleteRecords<T>(name: string | number, predicate: (item: T) => boolean): void;
//        joinStorage(names: string[] | number[], callbackResult: (...records) => void): void;
//    }

//    export class DB implements IDB {
//        private indexedDB: IDBFactory = null;
//        private storages: IStorage[] = null;
//        private callback: Function = null;
//        private config: IConfig = null;

//        constructor() {
//            this.storages = [];
//            this.indexedDB = this.getIndexedDB();
//        }

//        public getIndexedDB(): IDBFactory {
//            return window.indexedDB || window["mozIndexedDB"] || window["webkitIndexedDB"] || window["msIndexedDB"];
//        }

//        public createDB(name: string, version: number): void {
//            this.config = {
//                name: name,
//                version: version
//            };
//        }

//        public callbackNewVersion(callback: Function) {
//            this.callback = callback;
//        }

//        public createStorage(name: string | number, primaryKey: string): void {
//            this.storages.push({ name: name.toString(), primaryKey: primaryKey });
//        }

//        public run(callback?: Function) {
//            let openDB: IDBOpenDBRequest = this.indexedDB.open(this.config.name, this.config.version),
//                clearData: boolean = false;

//            openDB.onupgradeneeded = (e: IDBVersionChangeEvent) => {
//                console.log('IndexedDB: Esquema creado');

//                let db: IDBDatabase = e.target["result"];

//                this.updateStores(db);

//                if (!!this.callback) {
//                    this.callback();

//                    console.log('IndexedDB: callback ejecutado');
//                }

//                clearData = true;
//            }

//            openDB.onsuccess = (e) => {
//                if (clearData) {
//                    let db: IDBDatabase = e.target["result"];

//                    this.storages.forEach(storage => {
//                        let store = db.transaction(storage.name, "readwrite")
//                            .objectStore(storage.name);

//                        store.clear();
//                    });
//                }

//                if (!!callback) {
//                    callback();
//                }
//            }
//        }

//        public updateStores(db: IDBDatabase) {
//            if (db.objectStoreNames.length === 0) {
//                this.storages.forEach(storage => {
//                    db.createObjectStore(storage.name, { keyPath: storage.primaryKey, autoIncrement: true });
//                });
//                return;
//            }

//            this.storages.forEach(storage => {
//                if (!db.objectStoreNames.contains(storage.name)) {
//                    db.createObjectStore(storage.name, { keyPath: storage.primaryKey, autoIncrement: true });
//                }
//            });

//            for (var i = 0; i <= db.objectStoreNames.length - 1; i++) {
//                let name = db.objectStoreNames.item(i),
//                    storage = this.storages.filter(store => store.name === name)[0];
//                if (!storage) {
//                    db.deleteObjectStore(name);
//                }
//            }
//        }

//        public deleteDB(name: string, callback: Function) {
//            let openDB: IDBOpenDBRequest = this.indexedDB.deleteDatabase(name);
//            openDB.onsuccess = (e) => {
//                callback();
//            }
//        }

//        public openTransactionDB(nameStores: string[], mode: string, callback?: (store: IDBObjectStore | IDBObjectStore[]) => void) {
//            let openDB: IDBOpenDBRequest = this.indexedDB.open(this.config.name, this.config.version);
//            openDB.onsuccess = (e) => {
//                let db: IDBDatabase = e.target["result"],
//                    transaction = db.transaction(nameStores, mode),
//                    stores: IDBObjectStore[] = [];

//                nameStores.forEach(nameStore => {
//                    stores.push(transaction.objectStore(nameStore));
//                })

//                callback(stores.length > 1 ? stores : stores[0]);
//            }
//            openDB.onerror = (e) => {
//                console.error("IndexedDB: No se ha logrado conectar", e);
//            }
//        }

//        public existStorage(name: string | number): boolean {
//            return !!this.storages.filter(storage => storage.name === name.toString())[0];
//        }

//        public addRecord<T>(name: string | number, data: T, callbackResult: (primaryKeyValue: any) => void): void {
//            if (!this.existStorage(name)) {
//                console.log(`IndexedDB: No existe el almacen ${name}`);
//                return;
//            }

//            this.openTransactionDB([name.toString()], "readwrite", (store: IDBObjectStore) => {
//                let dbRequest = store.add(data);

//                if (!!callbackResult) {
//                    dbRequest.onsuccess = (e: Event) => { callbackResult(e.target["result"]); }
//                    dbRequest.onerror = (e: Event) => { callbackResult(null); }
//                }
//            });
//        }

//        public getById<T>(name: string | number, primaryKeyValue: any, callbackResult: (data: T) => void) {
//            if (!this.existStorage(name)) {
//                console.log(`IndexedDB: No existe el almacen ${name}`);
//                return;
//            }

//            this.openTransactionDB([name.toString()], "readonly", (store: IDBObjectStore) => {
//                let dbRequest = store.get(primaryKeyValue);

//                dbRequest.onsuccess = (e) => {
//                    let result = e.target["result"];
//                    if (result !== null && result !== undefined) {
//                        callbackResult(result);
//                    } else {
//                        callbackResult(null);
//                    }
//                }
//            });
//        }

//        public getAll<T>(name: string | number, callbackResult: (data: T[]) => void): void {
//            if (!this.existStorage(name)) {
//                console.log(`IndexedDB: No existe el almacen ${name}`);
//                return;
//            }

//            this.getRecords(name.toString(), (data) => true, callbackResult);
//        }

//        public getRecords<T>(name: string | number, predicate: (item: T) => boolean, callbackResult: (data: T[]) => void): void {
//            if (!this.existStorage(name)) {
//                console.log(`IndexedDB: No existe el almacen ${name}`);
//                return;
//            }

//            this.openTransactionDB([name.toString()], "readonly", (store: IDBObjectStore) => {
//                let openCursorRequest = store.openCursor(),
//                    records: T[] = [];

//                openCursorRequest.onsuccess = (e) => {
//                    let cursor: IDBCursorWithValue = e.target["result"];
//                    if (cursor) {
//                        records.push(cursor.value);
//                        cursor.continue();
//                    } else {
//                        callbackResult(records.filter(predicate));
//                    }
//                }
//                openCursorRequest.onerror = (e) => {
//                    callbackResult(null);
//                }
//            });
//        }

//        public updateRecord<T>(name: string | number, primaryKeyValue: any, newData: T): void {
//            if (!this.existStorage(name)) {
//                console.log(`IndexedDB: No existe el almacen ${name}`);
//                return;
//            }

//            this.openTransactionDB([name.toString()], "readwrite", (store: IDBObjectStore) => {
//                let dbRequest = store.get(primaryKeyValue);

//                dbRequest.onsuccess = (e) => {
//                    let data: T = e.target["result"];
//                    if (!data) {
//                        console.error(`IndexedDB: No se logró encontrar el indice ${primaryKeyValue} para ser actualizado`);
//                        return;
//                    }

//                    data = newData;
//                    data[<string>store.keyPath] = primaryKeyValue;

//                    let storeRequest = store.put(data);
//                    storeRequest.onerror = (e) => {
//                        console.log(`IndexedDB: No se logró actualizar el indice ${primaryKeyValue}`);
//                    }
//                }
//            });
//        }

//        public deleteRecords<T>(name: string | number, predicate: (item: T) => boolean) {
//            if (!this.existStorage(name)) {
//                console.log(`IndexedDB: No existe el almacen ${name}`);
//                return;
//            }

//            this.getRecords(name.toString(), predicate, (datas: T[]) => {
//                this.openTransactionDB([name.toString()], "readwrite", (store: IDBObjectStore) => {
//                    datas.forEach(data => {
//                        let primaryKeyValue = data[<string>store.keyPath],
//                            storeRequest = store.delete(primaryKeyValue);
                        
//                        storeRequest.onerror = (e) => {
//                            console.error(`IndexedDB: No se logró eliminar el indice ${primaryKeyValue}`);
//                        }
//                    });
//                });
//            });
//        }

//        public joinStorage(names: string[] | number[], callbackResult: (records) => void): void {
//            let time: number = 10,
//                index: number = -1,
//                flagFinish: boolean = true,
//                datas: any[] = [],
//                notExistsStorages: string[] = [];

//            (<string[]>names)
//                .map(t => t.toString())
//                .forEach(name => {
//                    if (!this.existStorage(name)) {
//                        notExistsStorages.push(name);
//                    }
//                });

//            if (!!notExistsStorages[0]) {
//                console.error(`IndexedDB: Los almacenes :${notExistsStorages.reduce((prev, current) => prev + ', ' + current)} no se encuetran registrados`);
//                return;
//            }

//            let intervalID = setInterval(() => {
//                if (flagFinish) {
//                    index++;
//                    if (names[index] === undefined) {
//                        clearInterval(intervalID);

//                        callbackResult.apply(this, datas);
//                        return;
//                    }

//                    flagFinish = false;

//                    this.getAll(names[index], (data: any[]) => {
//                        flagFinish = true;
//                        datas.push(data);
//                    });
//                }
//            }, time);
//        }
//    }
//}