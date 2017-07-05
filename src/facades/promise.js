"use strict";
var Facades;
(function (Facades) {
    var PromiseService = (function () {
        function PromiseService($q) {
            this.$q = $q;
        }
        PromiseService.prototype.when = function (value) {
            if (!!value) {
                return this.$q.when(value);
            }
            return this.$q.when();
        };
        PromiseService.prototype.then = function (successCallback) {
            return this.when(successCallback);
        };
        PromiseService.prototype.catch = function (onRejected) {
            return this.$q.when().catch(onRejected);
        };
        PromiseService.prototype.defer = function () {
            return this.$q.defer();
        };
        return PromiseService;
    }());
    define(['q'], function (q) { return new PromiseService(q); });
})(Facades || (Facades = {}));
