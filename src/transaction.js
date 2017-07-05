"use strict";
var IndexedDB;
(function (IndexedDB) {
    var Transaction = (function () {
        function Transaction($factory) {
            this.$factory = $factory;
        }
        Transaction.prototype.getTransactionDB = function (dataBaseName, version, nameStores, mode, callback) {
            var openDB = this.$factory.getIndexedDB().open(dataBaseName, version);
            openDB.onsuccess = function (e) {
                var db = e.target["result"], transaction = db.transaction(nameStores, mode);
                callback(nameStores.map(function (storeName) { return transaction.objectStore(storeName); }));
            };
            openDB.onerror = function (e) {
                console.error("No se ha logrado conectar con " + dataBaseName + "-" + nameStores, e);
            };
        };
        return Transaction;
    }());
    define(['factory'], function ($factory) { return new Transaction($factory); });
})(IndexedDB || (IndexedDB = {}));
