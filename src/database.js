"use strict";
var IndexedDB;
(function (IndexedDB) {
    var DataBase = (function () {
        function DataBase($q, $factory, $crud) {
            this.$q = $q;
            this.$factory = $factory;
            this.$crud = $crud;
        }
        DataBase.prototype.getDataBase = function (name, version) {
            var instance = this.$factory.getInstance(this.$crud);
            instance.setConfig(name, version);
            return instance;
        };
        DataBase.prototype.generateDataBase = function (name, version, stores) {
            var _this = this;
            var defer = this.$q.defer();
            if (!name || !version) {
                defer.reject('No se ha especificado una configuración para la base de datos');
            }
            if (!(stores || []).length) {
                defer.reject('No se ha especificado stores a crear');
            }
            var openDB = this.$factory.getIndexedDB().open(name, version);
            openDB.onsuccess = function (e) {
                defer.resolve(true);
            };
            openDB.onupgradeneeded = function (e) {
                var db = e.target["result"];
                _this.updateDataBase(db, stores);
                defer.resolve(true);
            };
            openDB.onerror = function (e) {
                defer.reject(e);
            };
            return defer.promise;
        };
        DataBase.prototype.updateDataBase = function (db, stores) {
            if (!db.objectStoreNames.length) {
                stores.forEach(function (store) {
                    db.createObjectStore(store.name, { keyPath: store.primaryKey, autoIncrement: true });
                });
                return;
            }
            stores.forEach(function (store) {
                if (!db.objectStoreNames.contains(store.name)) {
                    db.createObjectStore(store.name, { keyPath: store.primaryKey, autoIncrement: true });
                }
            });
            var i = 0, count = db.objectStoreNames.length - 1;
            var _loop_1 = function () {
                var name_1 = db.objectStoreNames.item(i) || '', storage = stores.filter(function (store) { return store.name === name_1; })[0];
                if (!storage) {
                    db.deleteObjectStore(name_1);
                }
            };
            for (; i <= count; i++) {
                _loop_1();
            }
        };
        DataBase.prototype.deleteDataBase = function (name) {
            var openDB = this.$factory.getIndexedDB().deleteDatabase(name), defer = this.$q.defer();
            openDB.onsuccess = function (e) {
                defer.resolve(true);
            };
            openDB.onerror = function (e) {
                defer.reject(e);
            };
            return defer.promise;
        };
        return DataBase;
    }());
    define(['promise', 'factory', 'crud'], function (promise, factory, crud) { return new DataBase(promise, factory, crud); });
})(IndexedDB || (IndexedDB = {}));
