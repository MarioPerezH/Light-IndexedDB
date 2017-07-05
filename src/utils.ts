namespace IndexedDB {
    export interface IUtil {
        extendObject<T1, T2>(currentObject: T1, updateObject: T2): T1;
    }

    class Util implements IUtil {
        public extendObject<T1, T2>(currentObject: T1, updateObject: T2): T1 {
            Object.keys(updateObject).forEach((key) => {

                // delete property if set to undefined or null
                if (undefined === updateObject[key] || null === updateObject[key]) {
                    delete currentObject[key]
                }

                // property value is object, so recurse
                else if (
                    'object' === typeof updateObject[key]
                    && !Array.isArray(updateObject[key])
                ) {

                    // target property not object, overwrite with empty object
                    if (
                        !('object' === typeof currentObject[key]
                            && !Array.isArray(currentObject[key]))
                    ) {
                        currentObject[key] = {}
                    }

                    // recurse
                    this.extendObject(currentObject[key], updateObject[key]);
                }

                // set target property to update property
                else {
                    currentObject[key] = updateObject[key]
                }
            });

            return currentObject;
        }
    }

    define([], () => new Util())
}