export interface IndexDbValue<T> extends Record<string, unknown> {
    value?: T;
}

export const initIndexDB = (
    storeName: string,
    version: number,
    dbName: string,
    keyPath: string,
) =>
    new Promise<IDBDatabase>((resolve, reject) => {
        const openRequest = indexedDB.open(storeName, version);

        openRequest.onupgradeneeded = () => {
            const db = openRequest.result;

            if (!db.objectStoreNames.contains(dbName)) {
                // если хранилище не существует
                db.createObjectStore(dbName, { keyPath }); // создаём хранилище
            }
        };

        openRequest.onerror = () => {
            reject(openRequest.error);
        };

        openRequest.onsuccess = () => {
            resolve(openRequest.result);
        };
    });

export const getValueFromIndexDB = <Value = unknown>(
    db: IDBDatabase,
    dbName: string,
    key: string,
) =>
    new Promise<Value>((resolve, reject) => {
        const transaction = db.transaction(dbName, 'readonly');

        const objectStore = transaction.objectStore(dbName);

        const field = objectStore.get(key);

        field.onsuccess = () => {
            resolve(field.result as Value);
        };

        field.onerror = () => {
            reject(field.error);
        };
    });

const addValueToIndexDB = (
    db: IDBDatabase,
    dbName: string,
    value: unknown,
    isUpdate?: boolean,
) =>
    new Promise<IDBValidKey>((resolve, reject) => {
        const transaction = db.transaction(dbName, 'readwrite');

        const saveFields = transaction.objectStore(dbName);

        const field = isUpdate ? saveFields.put(value) : saveFields.add(value);

        field.onsuccess = () => {
            resolve(field.result);
        };

        field.onerror = () => {
            reject(field.error);
        };
    });

export const clearIndexDBStore = (db: IDBDatabase, dbName: string) => {
    const transaction = db.transaction(dbName, 'readwrite');

    const saveFields = transaction.objectStore(dbName);

    saveFields.clear();
};

export class IndexDB {
    storeName: string;

    version: number;

    dbName: string;

    keyPath: string;

    db: IDBDatabase | null = null;

    private initPromise: Promise<IDBDatabase> | null = null;

    constructor(
        storeName: string,
        version: number,
        dbName: string,
        keyPath: string,
    ) {
        this.storeName = storeName;
        this.version = version;
        this.dbName = dbName;
        this.keyPath = keyPath;

        this.initPromise = this.init();
    }

    private async init() {
        const db = await initIndexDB(
            this.storeName,
            this.version,
            this.dbName,
            this.keyPath,
        );

        this.db = db;

        return db;
    }

    async get<Value = unknown>(key: string) {
        const db = await this.initPromise;

        if (db) {
            const field = await getValueFromIndexDB<
                IndexDbValue<Value> | undefined
            >(db, this.dbName, key);

            return field?.value ?? null;
        }

        return null;
    }

    async add(key: string, value: unknown, isUpdate?: boolean) {
        const db = await this.initPromise;

        if (db) {
            const field: IndexDbValue<unknown> = { [this.keyPath]: key, value };

            return addValueToIndexDB(db, this.dbName, field, isUpdate);
        }

        return null;
    }

    async clear() {
        const db = await this.initPromise;

        if (db) {
            clearIndexDBStore(db, this.dbName);
        }

        return null;
    }
}
