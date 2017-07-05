"use strict";
var IndexedDB;
(function (IndexedDB) {
    var Factory = (function () {
        function Factory() {
        }
        Factory.prototype.getInstance = function (instance) {
            return Object.create(instance);
        };
        Factory.prototype.getIndexedDB = function () {
            return window.indexedDB || window["mozIndexedDB"] || window["webkitIndexedDB"] || window["msIndexedDB"];
        };
        return Factory;
    }());
    define([], function () { return new Factory(); });
})(IndexedDB || (IndexedDB = {}));
