"use strict";
var IndexedDB;
(function (IndexedDB) {
    var Util = (function () {
        function Util() {
        }
        Util.prototype.extendObject = function (currentObject, updateObject) {
            var _this = this;
            Object.keys(updateObject).forEach(function (key) {
                // delete property if set to undefined or null
                if (undefined === updateObject[key] || null === updateObject[key]) {
                    delete currentObject[key];
                }
                else if ('object' === typeof updateObject[key]
                    && !Array.isArray(updateObject[key])) {
                    // target property not object, overwrite with empty object
                    if (!('object' === typeof currentObject[key]
                        && !Array.isArray(currentObject[key]))) {
                        currentObject[key] = {};
                    }
                    // recurse
                    _this.extendObject(currentObject[key], updateObject[key]);
                }
                else {
                    currentObject[key] = updateObject[key];
                }
            });
            return currentObject;
        };
        return Util;
    }());
    define([], function () { return new Util(); });
})(IndexedDB || (IndexedDB = {}));
