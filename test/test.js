"use strict";
var IndexedDB;
(function (IndexedDB) {
    var Test;
    (function (Test_1) {
        var Test = (function () {
            function Test($indexeddb, $q) {
                this.$indexeddb = $indexeddb;
                this.$q = $q;
                this.name = 'DataBaseTest';
                this.version = 1;
                this.eliminarDB();
                this.generarEstructuraDB();
                this.obtenerDB();
                this.crearRegistro();
                this.leerRegistro();
                this.leerRegistrosVariosStores();
                this.actualizarRegistroPorPK();
                this.actualizarRegistroPorFiltro();
                this.eliminarRegistroPorPK();
                this.eliminarRegistroPorFiltro();
            }
            Test.prototype.eliminarDB = function () {
                var _this = this;
                QUnit.test('Eliminar estructura DB en IndexedDB', function (assert) {
                    var done = assert.async();
                    _this.$indexeddb.deleteDataBase(_this.name)
                        .then(function (result) {
                        assert.ok(result);
                        done();
                    }).catch(function (reason) {
                        assert.ok(false, reason);
                        done();
                    });
                });
            };
            Test.prototype.generarEstructuraDB = function () {
                var _this = this;
                QUnit.test('Genera estructura DB en IndexedDB', function (assert) {
                    var done = assert.async();
                    _this.$indexeddb.generateDataBase(_this.name, _this.version, [
                        { name: 'Persona', primaryKey: 'Id' },
                        { name: 'Auto', primaryKey: 'Id' }
                    ]).then(function (result) {
                        assert.ok(result);
                        done();
                    }).catch(function (reason) {
                        assert.ok(false, reason);
                        done();
                    });
                });
            };
            Test.prototype.obtenerDB = function () {
                var _this = this;
                QUnit.test('Obtener DB en IndexedDB', function (assert) {
                    var db = _this.$indexeddb.getDataBase(_this.name, _this.version);
                    if (db) {
                        assert.ok(true, "La DB " + _this.name + " se ha creado exitosamente");
                        return;
                    }
                    assert.ok(false, "No se ha creado la DB " + _this.name);
                });
            };
            Test.prototype.crearRegistro = function () {
                var _this = this;
                QUnit.test('Crear registro en DB en IndexedDB', function (assert) {
                    var db = _this.$indexeddb.getDataBase(_this.name, _this.version), done = assert.async();
                    if (db) {
                        db.create('Persona', { Nombre: 'Mario', Apellido: 'Pérez' })
                            .then(function (primaryKey) {
                            assert.equal(primaryKey, 1, "Se ha creado el registro correctamente");
                            done();
                        }).catch(function (reason) {
                            assert.ok(false, "Se ha generado una excepci\u00F3n en la creaci\u00F3n del registro");
                            done();
                        });
                    }
                    else {
                        assert.ok(false, "No se ha creado la DB " + _this.name);
                        done();
                    }
                });
            };
            Test.prototype.leerRegistro = function () {
                var _this = this;
                QUnit.test('Leer registro en DB en IndexedDB', function (assert) {
                    var db = _this.$indexeddb.getDataBase(_this.name, _this.version), done = assert.async();
                    if (db) {
                        db.read('Persona', function (persona) { return persona.Nombre === 'Mario'; })
                            .then(function (records) {
                            assert.equal(records.length, 1, "Se ha leido el registro correctamente");
                            done();
                        }).catch(function (reason) {
                            assert.ok(false, "Se ha generado una excepci\u00F3n en la creaci\u00F3n del registro");
                            done();
                        });
                    }
                    else {
                        assert.ok(false, "No se ha creado la DB " + _this.name);
                        done();
                    }
                });
            };
            Test.prototype.leerRegistrosVariosStores = function () {
                var _this = this;
                QUnit.test('Leer registros de varios stores en DB en IndexedDB', function (assert) {
                    var db = _this.$indexeddb.getDataBase(_this.name, _this.version), done1 = assert.async(), done2 = assert.async();
                    assert.expect(2);
                    if (db) {
                        db.create('Auto', { Marca: 'Subaru' });
                        db.read(['Persona', 'Auto'])
                            .then(function (records) {
                            var personas = records[0], autos = records[1];
                            assert.ok(personas.length, "Se han leido los registros de varios stores correctamente");
                            done1();
                            assert.ok(autos.length, "Se han leido los registros de varios stores correctamente");
                            done2();
                        }).catch(function (reason) {
                            assert.ok(false, "Se ha generado una excepci\u00F3n en la lectura del registro");
                            done1();
                            done2();
                        });
                    }
                    else {
                        assert.ok(false, "No se ha creado la DB " + _this.name);
                        done1();
                        done2();
                    }
                });
            };
            Test.prototype.actualizarRegistroPorPK = function () {
                var _this = this;
                QUnit.test('Actualizar registro por PK en DB en IndexedDB', function (assert) {
                    var db = _this.$indexeddb.getDataBase(_this.name, _this.version), done = assert.async();
                    if (db) {
                        _this.$q
                            .when(db.update('Persona', 1, { Nombre: 'Katita' }))
                            .then(function (result) { return db.read('Persona', function (persona) { return persona.Nombre === 'Katita'; }); })
                            .then(function (result) {
                            assert.equal(result.length, 1, "Se ha actualizado el registro correctamente");
                            done();
                        }).catch(function (reason) {
                            assert.ok(false, "Se ha generado una excepci\u00F3n en la actualizac\u00F3n del registro");
                            done();
                        });
                    }
                    else {
                        assert.ok(false, "No se ha creado la DB " + _this.name);
                        done();
                    }
                });
            };
            Test.prototype.actualizarRegistroPorFiltro = function () {
                var _this = this;
                QUnit.test('Actualizar registro por filtro en DB en IndexedDB', function (assert) {
                    var db = _this.$indexeddb.getDataBase(_this.name, _this.version), done = assert.async();
                    if (db) {
                        _this.$q
                            .when(db.update('Persona', function (persona) { return persona.Nombre === 'Katita'; }, { Nombre: 'Negrita' }))
                            .then(function (result) { return db.read('Persona', function (persona) { return persona.Nombre === 'Negrita'; }); })
                            .then(function (result) {
                            assert.equal(result.length, 1, "Se ha actualizado el registro correctamente");
                            done();
                        }).catch(function (reason) {
                            assert.ok(false, "Se ha generado una excepci\u00F3n en la actualizac\u00F3n del registro");
                            done();
                        });
                    }
                    else {
                        assert.ok(false, "No se ha creado la DB " + _this.name);
                        done();
                    }
                });
            };
            Test.prototype.eliminarRegistroPorPK = function () {
                var _this = this;
                QUnit.test('Eliminación de registro por PK en DB en IndexedDB', function (assert) {
                    var db = _this.$indexeddb.getDataBase(_this.name, _this.version), done = assert.async();
                    if (db) {
                        _this.$q
                            .when(db.delete('Persona', 1))
                            .then(function (result) { return db.read('Persona', function (persona) { return persona.Id === 1; }); })
                            .then(function (result) {
                            assert.equal(result.length, 0, "Se ha eliminado el registro correctamente");
                            done();
                        }).catch(function (reason) {
                            assert.ok(false, "Se ha generado una excepci\u00F3n en la eliminaci\u00F3n del registro");
                            done();
                        });
                    }
                    else {
                        assert.ok(false, "No se ha creado la DB " + _this.name);
                        done();
                    }
                });
            };
            Test.prototype.eliminarRegistroPorFiltro = function () {
                var _this = this;
                QUnit.test('Eliminación de registro por filtro en DB en IndexedDB', function (assert) {
                    var db = _this.$indexeddb.getDataBase(_this.name, _this.version), done = assert.async(), predicate = function (auto) { return auto.Marca === 'Subaru'; };
                    if (db) {
                        _this.$q
                            .when(db.delete('Auto', predicate))
                            .then(function (result) { return db.read('Auto', predicate); })
                            .then(function (result) {
                            assert.equal(result.length, 0, "Se ha eliminado el registro correctamente");
                            done();
                        }).catch(function (reason) {
                            assert.ok(false, "Se ha generado una excepci\u00F3n en la eliminaci\u00F3n del registro");
                            done();
                        });
                    }
                    else {
                        assert.ok(false, "No se ha creado la DB " + _this.name);
                        done();
                    }
                });
            };
            return Test;
        }());
        define(['database', 'promise'], function (indexeddb, promise) { return new Test(indexeddb, promise); });
    })(Test = IndexedDB.Test || (IndexedDB.Test = {}));
})(IndexedDB || (IndexedDB = {}));
