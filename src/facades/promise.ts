namespace Facades {
    interface IResolve<T> {
        (): void;
        (value: T): void;
    }
    export interface IDeferred<T> {
        resolve(value?: T | IPromise<T>): void;
        reject(reason?: any): void;
        promise: IPromise<T>;
    }
    export interface IPromiseService {
        when<T>(): IPromise<T>;
        when<T>(value?: IPromise<T> | T): IPromise<T>;
        catch<U>(onRejected: (reason: any) => U | IPromise<U>): IPromise<U>;
        defer<T>(): IDeferred<T>;
    }

    export interface IPromise<T> {
        then<TResult>(successCallback: (promiseValue: T) => IPromise<TResult> | TResult): IPromise<TResult>;
        catch<U>(onRejected: (reason: any) => U | IPromise<U>): IPromise<U>;
    }

    class PromiseService<T> implements IPromiseService, IPromise<T> {
        constructor(private $q : any) {
            
        }
        public when<T>(value?: IPromise<T> | T): IPromise<T> {
            if (!!value) {
                return <IPromise<T>>(<any>this.$q.when(value));
            }

            return <IPromise<T>>(<any>this.$q.when()); 
        }

        public then<TResult>(successCallback: (promiseValue: T) => IPromise<TResult> | TResult): IPromise<TResult> {
            return <any>this.when(successCallback);
        }

        public catch<U>(onRejected: (reason: any) => U | IPromise<U>): IPromise<U> {
            return this.$q.when().catch(onRejected);
        }

        public defer<T>(): IDeferred<T> {
            return <IDeferred<T>>(<any>this.$q.defer());
        }
    }
    define(['q'], (q) => new PromiseService(q));
}