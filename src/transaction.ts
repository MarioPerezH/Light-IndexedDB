namespace IndexedDB {
    export interface ITransaction {
        getTransactionDB(dataBaseName: string, version: number, nameStores: string[], mode: "versionchange" | "readonly" | "readwrite" | undefined, callback: (stores: IDBObjectStore[]) => void): void;
    }

    class Transaction implements ITransaction {
        constructor(private $factory: IndexedDB.IFactory) {
        }

        public getTransactionDB(dataBaseName: string, version: number, nameStores: string[], mode: "versionchange" | "readonly" | "readwrite" | undefined, callback: (stores: IDBObjectStore[]) => void): void {
            let openDB: IDBOpenDBRequest = this.$factory.getIndexedDB().open(dataBaseName, version);

            openDB.onsuccess = (e) => {
                let db: IDBDatabase = e.target["result"],
                    transaction = db.transaction(nameStores, mode);

                callback(<any>nameStores.map(storeName => transaction.objectStore(storeName)));
            };

            openDB.onerror = (e) => {
                console.error(`No se ha logrado conectar con ${dataBaseName}-${nameStores}`, e);
            }
        }
    }
    define(['factory'], ($factory) => new Transaction($factory));
}