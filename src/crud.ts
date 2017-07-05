namespace IndexedDB {
    interface IConfig {
        name: string,
        version: number
    }

    export interface ICRUD {
        create<T>(storeName: string, data: T): Facades.IPromise<number>;
        read<T1>(storeName: string[]): Facades.IPromise<[T1]>;
        read<T1, T2>(storeName: string[]): Facades.IPromise<[T1, T2]>;
        read<T1, T2, T3>(storeName: string[]): Facades.IPromise<[T1, T2, T3]>;
        read<T1, T2, T3, T4>(storeName: string[]): Facades.IPromise<[T1, T2, T3, T4]>;
        read<T1, T2, T3, T4, T5>(storeName: string[]): Facades.IPromise<[T1, T2, T3, T4, T5]>;
        read<TResult, TItem>(storeName: string, predicate: (item: TItem) => boolean): Facades.IPromise<TResult>;
        update<T>(storeName: string, primaryKeyValue: number | any, data: T): Facades.IPromise<boolean>;
        update<T>(storeName: string, predicate: (item: T) => boolean | any, data: T): Facades.IPromise<boolean>;
        delete(storeName: string, primaryKeyValue: number | any): Facades.IPromise<boolean>;
        delete<T>(storeName: string, predicate: (item: T) => boolean): Facades.IPromise<boolean>;
    }

    export interface ICRUDConfig extends ICRUD {
        setConfig(name: string, version: number);
    }

    export class CRUD implements ICRUDConfig {
        private config: IConfig;

        constructor(private $q: Facades.IPromiseService,
            private $transaction: IndexedDB.ITransaction,
            private $utils: IndexedDB.IUtil) {
        }

        public setConfig(name: string, version: number) {
            this.config = {
                name: name,
                version: version
            };
        }

        public create<T>(storeName: string, data: T): Facades.IPromise<number> {
            let defer = this.$q.defer<number>(),
                callback = (stores: IDBObjectStore[]) => {
                    let store = stores[0],
                        dbRequest = store.add(data);

                    dbRequest.onsuccess = (e: Event) => {
                        defer.resolve(e.target["result"]);
                    };

                    dbRequest.onerror = (e: Event) => {
                        defer.reject(e);
                    };
                };

            this.$transaction.getTransactionDB(this.config.name, this.config.version, [storeName], 'readwrite', callback);

            return defer.promise;
        }

        public read<T, TItem>(storeName: string | string[], predicate?: (item: TItem) => boolean): Facades.IPromise<T> {
            let defer = this.$q.defer<T>(),
                callback = (stores: IDBObjectStore[]) => {
                    let recordsStores: any[] = [],
                        cont: number = 0,
                        count: number = stores.length;

                    stores.forEach(store => {

                        let openCursorRequest = store.openCursor(),
                            records: T[] = [];

                        openCursorRequest.onsuccess = (e) => {
                            let cursor: IDBCursorWithValue = e.target["result"];

                            if (cursor) {
                                records.push(cursor.value);
                                cursor.continue();
                            } else {
                                recordsStores.push(records);
                                cont++;

                                if (cont === count) {
                                    if (storeName.length === 1) {
                                        defer.resolve(recordsStores[0].filter(<any>predicate));
                                    } else {
                                        defer.resolve(<any>recordsStores);
                                    }
                                    return;
                                }
                            }
                        }

                        openCursorRequest.onerror = (e) => {
                            defer.reject(e);
                        }
                    });
                }

            if (!predicate) {
                predicate = () => true;
            }

            if (!Array.isArray(storeName)) {
                storeName = [storeName];
            }

            this.$transaction.getTransactionDB(this.config.name, this.config.version, storeName, 'readwrite', callback);

            return defer.promise;
        }

        public update<T>(storeName: string, predicateOrPKValue: number | Function, dataNew: T): Facades.IPromise<boolean> {
            let defer = this.$q.defer<boolean>(),
                callbackUpdateForId = (stores: IDBObjectStore[]) => {
                    let store = stores[0],
                        dbRequest = store.get(predicateOrPKValue);

                    dbRequest.onsuccess = (e) => {
                        let data: T = e.target["result"];
                        if (!data) {
                            defer.reject(`IndexedDB: No se logró encontrar el indice ${predicateOrPKValue} para ser actualizado`);
                            return;
                        }

                        this.$utils.extendObject(data, dataNew);

                        data[<string>store.keyPath] = predicateOrPKValue;

                        let storeRequest = store.put(data);

                        storeRequest.onsuccess = (e) => {
                            defer.resolve(true);
                        }

                        storeRequest.onerror = (e) => {
                            defer.reject(e);
                        }
                    }

                    dbRequest.onerror = (e) => {
                        defer.reject(e);
                    }
                },
                callbackUpdateForObject = (stores: IDBObjectStore[]) => {
                    let store = stores[0],
                        count = records.length - 1;

                    if (!records.length) {
                        defer.resolve(true);
                        return;
                    }

                    records.forEach((record, index) => {
                        this.$utils.extendObject(record, dataNew);

                        dataNew[<string>store.keyPath] = record[<string>store.keyPath];

                        let storeRequest = store.put(record);

                        storeRequest.onsuccess = (e) => {
                            if (index === count) {
                                defer.resolve(true);
                            }
                        }

                        storeRequest.onerror = (e) => {
                            defer.reject(e);
                            return;
                        }
                    });
                },
                callback : any = null,
                records: any[] = [],
                defer2 = this.$q.defer<boolean>();

            if (!isNaN(+predicateOrPKValue)) {
                callback = callbackUpdateForId;
                defer2.resolve(true);
            } else {
                callback = callbackUpdateForObject;
                this.$q
                    .when(this.read(storeName, <any>predicateOrPKValue))
                    .then((result: any[]) => records = result)
                    .then(() => defer2.resolve(true));
            }

            this.$q
                .when(defer2.promise)
                .then(_ => this.$transaction.getTransactionDB(this.config.name, this.config.version, [storeName], 'readwrite', callback));

            return defer.promise;
        } 

        public delete<TItem>(storeName: string, predicateOrPkValue: number | Function): Facades.IPromise<boolean> {
            let defer = this.$q.defer<boolean>(),
                callbackDeleteForId = (stores: IDBObjectStore[]) => {
                    let store = stores[0],
                        openCursorRequest = store.openCursor(),
                        storeRequest = store.delete(<any>predicateOrPkValue);

                    storeRequest.onsuccess = (e) => {
                        defer.resolve(true);
                    }

                    storeRequest.onerror = (e) => {
                        defer.reject(e);
                    }
                },
                callbackDeleteForObject = (stores: IDBObjectStore[]) => {
                    let store = stores[0],
                        openCursorRequest = store.openCursor(),
                        count = records.length - 1;

                    if (!records.length) {
                        defer.resolve(true);
                        return;
                    }

                    records.forEach((record, index) => {
                        let primaryKeyValue = record[<string>store.keyPath],
                            storeRequest = store.delete(primaryKeyValue);

                        storeRequest.onsuccess = (e) => {
                            if (index === count) {
                                defer.resolve(true);
                            }
                        }

                        storeRequest.onerror = (e) => {
                            defer.reject(e);
                        }
                    });
                },
                callback : any= null,
                records: any[] = [],
                defer2 = this.$q.defer();

            if (!isNaN(+predicateOrPkValue)) {
                callback = callbackDeleteForId;
                defer2.resolve(true);
            } else {
                callback = callbackDeleteForObject;
                this.$q
                    .when(this.read(storeName, <any>predicateOrPkValue))
                    .then((result: any[]) => records = result)
                    .then(() => defer2.resolve(true));
            }

            this.$q
                .when(defer2.promise)
                .then(_ => this.$transaction.getTransactionDB(this.config.name, this.config.version, [storeName], 'readwrite', callback));

            return defer.promise;
        }
    }
    define(['promise', 'transaction', 'utils'], (promise, transaction, utils) => new CRUD(promise, transaction, utils));
}