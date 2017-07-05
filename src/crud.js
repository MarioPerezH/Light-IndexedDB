"use strict";
var IndexedDB;
(function (IndexedDB) {
    var CRUD = (function () {
        function CRUD($q, $transaction, $utils) {
            this.$q = $q;
            this.$transaction = $transaction;
            this.$utils = $utils;
        }
        CRUD.prototype.setConfig = function (name, version) {
            this.config = {
                name: name,
                version: version
            };
        };
        CRUD.prototype.create = function (storeName, data) {
            var defer = this.$q.defer(), callback = function (stores) {
                var store = stores[0], dbRequest = store.add(data);
                dbRequest.onsuccess = function (e) {
                    defer.resolve(e.target["result"]);
                };
                dbRequest.onerror = function (e) {
                    defer.reject(e);
                };
            };
            this.$transaction.getTransactionDB(this.config.name, this.config.version, [storeName], 'readwrite', callback);
            return defer.promise;
        };
        CRUD.prototype.read = function (storeName, predicate) {
            var defer = this.$q.defer(), callback = function (stores) {
                var recordsStores = [], cont = 0, count = stores.length;
                stores.forEach(function (store) {
                    var openCursorRequest = store.openCursor(), records = [];
                    openCursorRequest.onsuccess = function (e) {
                        var cursor = e.target["result"];
                        if (cursor) {
                            records.push(cursor.value);
                            cursor.continue();
                        }
                        else {
                            recordsStores.push(records);
                            cont++;
                            if (cont === count) {
                                if (storeName.length === 1) {
                                    defer.resolve(recordsStores[0].filter(predicate));
                                }
                                else {
                                    defer.resolve(recordsStores);
                                }
                                return;
                            }
                        }
                    };
                    openCursorRequest.onerror = function (e) {
                        defer.reject(e);
                    };
                });
            };
            if (!predicate) {
                predicate = function () { return true; };
            }
            if (!Array.isArray(storeName)) {
                storeName = [storeName];
            }
            this.$transaction.getTransactionDB(this.config.name, this.config.version, storeName, 'readwrite', callback);
            return defer.promise;
        };
        CRUD.prototype.update = function (storeName, predicateOrPKValue, dataNew) {
            var _this = this;
            var defer = this.$q.defer(), callbackUpdateForId = function (stores) {
                var store = stores[0], dbRequest = store.get(predicateOrPKValue);
                dbRequest.onsuccess = function (e) {
                    var data = e.target["result"];
                    if (!data) {
                        defer.reject("IndexedDB: No se logr\u00F3 encontrar el indice " + predicateOrPKValue + " para ser actualizado");
                        return;
                    }
                    _this.$utils.extendObject(data, dataNew);
                    data[store.keyPath] = predicateOrPKValue;
                    var storeRequest = store.put(data);
                    storeRequest.onsuccess = function (e) {
                        defer.resolve(true);
                    };
                    storeRequest.onerror = function (e) {
                        defer.reject(e);
                    };
                };
                dbRequest.onerror = function (e) {
                    defer.reject(e);
                };
            }, callbackUpdateForObject = function (stores) {
                var store = stores[0], count = records.length - 1;
                if (!records.length) {
                    defer.resolve(true);
                    return;
                }
                records.forEach(function (record, index) {
                    _this.$utils.extendObject(record, dataNew);
                    dataNew[store.keyPath] = record[store.keyPath];
                    var storeRequest = store.put(record);
                    storeRequest.onsuccess = function (e) {
                        if (index === count) {
                            defer.resolve(true);
                        }
                    };
                    storeRequest.onerror = function (e) {
                        defer.reject(e);
                        return;
                    };
                });
            }, callback = null, records = [], defer2 = this.$q.defer();
            if (!isNaN(+predicateOrPKValue)) {
                callback = callbackUpdateForId;
                defer2.resolve(true);
            }
            else {
                callback = callbackUpdateForObject;
                this.$q
                    .when(this.read(storeName, predicateOrPKValue))
                    .then(function (result) { return records = result; })
                    .then(function () { return defer2.resolve(true); });
            }
            this.$q
                .when(defer2.promise)
                .then(function (_) { return _this.$transaction.getTransactionDB(_this.config.name, _this.config.version, [storeName], 'readwrite', callback); });
            return defer.promise;
        };
        CRUD.prototype.delete = function (storeName, predicateOrPkValue) {
            var _this = this;
            var defer = this.$q.defer(), callbackDeleteForId = function (stores) {
                var store = stores[0], openCursorRequest = store.openCursor(), storeRequest = store.delete(predicateOrPkValue);
                storeRequest.onsuccess = function (e) {
                    defer.resolve(true);
                };
                storeRequest.onerror = function (e) {
                    defer.reject(e);
                };
            }, callbackDeleteForObject = function (stores) {
                var store = stores[0], openCursorRequest = store.openCursor(), count = records.length - 1;
                if (!records.length) {
                    defer.resolve(true);
                    return;
                }
                records.forEach(function (record, index) {
                    var primaryKeyValue = record[store.keyPath], storeRequest = store.delete(primaryKeyValue);
                    storeRequest.onsuccess = function (e) {
                        if (index === count) {
                            defer.resolve(true);
                        }
                    };
                    storeRequest.onerror = function (e) {
                        defer.reject(e);
                    };
                });
            }, callback = null, records = [], defer2 = this.$q.defer();
            if (!isNaN(+predicateOrPkValue)) {
                callback = callbackDeleteForId;
                defer2.resolve(true);
            }
            else {
                callback = callbackDeleteForObject;
                this.$q
                    .when(this.read(storeName, predicateOrPkValue))
                    .then(function (result) { return records = result; })
                    .then(function () { return defer2.resolve(true); });
            }
            this.$q
                .when(defer2.promise)
                .then(function (_) { return _this.$transaction.getTransactionDB(_this.config.name, _this.config.version, [storeName], 'readwrite', callback); });
            return defer.promise;
        };
        return CRUD;
    }());
    IndexedDB.CRUD = CRUD;
    define(['promise', 'transaction', 'utils'], function (promise, transaction, utils) { return new CRUD(promise, transaction, utils); });
})(IndexedDB || (IndexedDB = {}));
