namespace IndexedDB.Test {
    interface IPersona {
        Id?: number;
        Nombre?: string;
        Apellido?: string;
    }

    interface IAuto {
        Id?: number;
        Marca: string;
    }

    class Test {
        private name: string;
        private version: number;
        constructor(private $indexeddb: IndexedDB.IDataBase,
            private $q: Facades.IPromiseService) {

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

        public eliminarDB() {
            QUnit.test('Eliminar estructura DB en IndexedDB', (assert: Assert) => {
                let done = assert.async();

                this.$indexeddb.deleteDataBase(this.name)
                    .then(result => {
                        assert.ok(result);
                        done();
                    }).catch(reason => {
                        assert.ok(false, reason);
                        done();
                    });
            });
        }

        public generarEstructuraDB() {
            QUnit.test('Genera estructura DB en IndexedDB', (assert: Assert) => {
                let done = assert.async();

                this.$indexeddb.generateDataBase(this.name, this.version, [
                    { name: 'Persona', primaryKey: 'Id' },
                    { name: 'Auto', primaryKey: 'Id' }
                ]).then(result => {
                    assert.ok(result);
                    done();
                }).catch(reason => {
                    assert.ok(false, reason);
                    done();
                });
            });
        }

        public obtenerDB() {
            QUnit.test('Obtener DB en IndexedDB', (assert: Assert) => {
                let db = this.$indexeddb.getDataBase(this.name, this.version);

                if (db) {
                    assert.ok(true, `La DB ${this.name} se ha creado exitosamente`);
                    return;
                }

                assert.ok(false, `No se ha creado la DB ${this.name}`);
            });
        }

        public crearRegistro() {
            QUnit.test('Crear registro en DB en IndexedDB', (assert: Assert) => {
                let db = this.$indexeddb.getDataBase(this.name, this.version),
                    done = assert.async();

                if (db) {
                    db.create<IPersona>('Persona', { Nombre: 'Mario', Apellido: 'Pérez' })
                        .then(primaryKey => {
                            assert.equal(primaryKey, 1, `Se ha creado el registro correctamente`);
                            done();
                        }).catch(reason => {
                            assert.ok(false, `Se ha generado una excepción en la creación del registro`);
                            done();
                        });
                } else {
                    assert.ok(false, `No se ha creado la DB ${this.name}`);
                    done();
                }
            });
        }

        public leerRegistro() {
            QUnit.test('Leer registro en DB en IndexedDB', (assert: Assert) => {
                let db = this.$indexeddb.getDataBase(this.name, this.version),
                    done = assert.async();

                if (db) {
                    db.read<IPersona[], IPersona>('Persona', persona => persona.Nombre === 'Mario')
                        .then(records => {
                            assert.equal(records.length, 1, `Se ha leido el registro correctamente`);
                            done();
                        }).catch(reason => {
                            assert.ok(false, `Se ha generado una excepción en la creación del registro`);
                            done();
                        });
                } else {
                    assert.ok(false, `No se ha creado la DB ${this.name}`);
                    done();
                }
            });
        }

        public leerRegistrosVariosStores() {
            QUnit.test('Leer registros de varios stores en DB en IndexedDB', (assert: Assert) => {
                let db = this.$indexeddb.getDataBase(this.name, this.version),
                    done1 = assert.async(),
                    done2 = assert.async();

                assert.expect(2);

                if (db) {
                    db.create<IAuto>('Auto', { Marca: 'Subaru' });

                    db.read<IPersona[], IAuto[]>(['Persona', 'Auto'])
                        .then(records => {
                            let personas = records[0],
                                autos = records[1];

                            assert.ok(personas.length, `Se han leido los registros de varios stores correctamente`);
                            done1();

                            assert.ok(autos.length, `Se han leido los registros de varios stores correctamente`);
                            done2();
                        }).catch(reason => {
                            assert.ok(false, `Se ha generado una excepción en la lectura del registro`);
                            done1();
                            done2();
                        });
                } else {
                    assert.ok(false, `No se ha creado la DB ${this.name}`);
                    done1();
                    done2();
                }
            });
        }

        public actualizarRegistroPorPK() {
            QUnit.test('Actualizar registro por PK en DB en IndexedDB', (assert: Assert) => {
                let db = this.$indexeddb.getDataBase(this.name, this.version),
                    done = assert.async();

                if (db) {
                    this.$q
                        .when(db.update<IPersona>('Persona', 1, { Nombre: 'Katita' }))
                        .then(result => db.read<IPersona[], IPersona>('Persona', persona => persona.Nombre === 'Katita'))
                        .then(result => {
                            assert.equal(result.length, 1, `Se ha actualizado el registro correctamente`);
                            done();
                        }).catch(reason => {
                            assert.ok(false, `Se ha generado una excepción en la actualizacón del registro`);
                            done();
                        });
                } else {
                    assert.ok(false, `No se ha creado la DB ${this.name}`);
                    done();
                }
            });
        }

        public actualizarRegistroPorFiltro() {
            QUnit.test('Actualizar registro por filtro en DB en IndexedDB', (assert: Assert) => {
                let db = this.$indexeddb.getDataBase(this.name, this.version),
                    done = assert.async();

                if (db) {
                    this.$q
                        .when(db.update<IPersona>('Persona', persona => persona.Nombre === 'Katita', { Nombre: 'Negrita' }))
                        .then(result => db.read<IPersona[], IPersona>('Persona', persona => persona.Nombre === 'Negrita'))
                        .then(result => {
                            assert.equal(result.length, 1, `Se ha actualizado el registro correctamente`);
                            done();
                        }).catch(reason => {
                            assert.ok(false, `Se ha generado una excepción en la actualizacón del registro`);
                            done();
                        });
                } else {
                    assert.ok(false, `No se ha creado la DB ${this.name}`);
                    done();
                }
            });
        }

        public eliminarRegistroPorPK() {
            QUnit.test('Eliminación de registro por PK en DB en IndexedDB', (assert: Assert) => {
                let db = this.$indexeddb.getDataBase(this.name, this.version),
                    done = assert.async();

                if (db) {
                    this.$q
                        .when(db.delete('Persona', 1))
                        .then(result => db.read<IPersona[], IPersona>('Persona', persona => persona.Id === 1))
                        .then(result => {
                            assert.equal(result.length, 0, `Se ha eliminado el registro correctamente`);
                            done();
                        }).catch(reason => {
                            assert.ok(false, `Se ha generado una excepción en la eliminación del registro`);
                            done();
                        });
                } else {
                    assert.ok(false, `No se ha creado la DB ${this.name}`);
                    done();
                }
            });
        }

        public eliminarRegistroPorFiltro() {
            QUnit.test('Eliminación de registro por filtro en DB en IndexedDB', (assert: Assert) => {
                let db = this.$indexeddb.getDataBase(this.name, this.version),
                    done = assert.async(),
                    predicate = auto => auto.Marca === 'Subaru';

                if (db) {
                    this.$q
                        .when(db.delete<IAuto>('Auto', predicate ))
                        .then(result => db.read<IAuto[], IAuto>('Auto', predicate))
                        .then(result => {
                            assert.equal(result.length, 0, `Se ha eliminado el registro correctamente`);
                            done();
                        }).catch(reason => {
                            assert.ok(false, `Se ha generado una excepción en la eliminación del registro`);
                            done();
                        });
                } else {
                    assert.ok(false, `No se ha creado la DB ${this.name}`);
                    done();
                }
            });
        }
    }

    define(['database', 'promise'], (indexeddb, promise) => new Test(indexeddb, promise));
}

