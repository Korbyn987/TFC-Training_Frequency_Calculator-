// Web implementation of expo-sqlite
const noop = () => {};

const SQLite = {
  openDatabase: (name, version = '1.0', description = name, size = 1, callback) => {
    console.log(`[Web] Opening database: ${name}`);
    return {
      transaction: (txFn, errorFn, successFn) => {
        try {
          const transaction = {
            executeSql: (sql, args = [], success, error) => {
              console.log(`[Web] Executing SQL: ${sql}`, args);
              if (success) {
                success(
                  {},
                  { rows: { _array: [], length: 0 }, rowsAffected: 0, insertId: undefined }
                );
              }
              return {
                then: (resolve) => resolve(),
                catch: (reject) => (reject ? reject() : undefined),
              };
            },
          };
          txFn(transaction);
          if (successFn) successFn();
        } catch (err) {
          console.error('[Web] SQLite error:', err);
          if (errorFn) errorFn(err);
        }
      },
      readTransaction: function (txFn, errorFn, successFn) {
        return this.transaction(txFn, errorFn, successFn);
      },
      closeAsync: () => Promise.resolve(),
      transactionAsync: () => ({}),
      readOnly: false,
      exec: (queries, readOnly, callback) => {
        console.log('[Web] Executing batch queries:', queries);
        if (callback) callback(null, []);
        return Promise.resolve([]);
      },
    };
  },
  // Add the missing export
  openDatabaseAsync: (name, version = '1.0', description = name, size = 1) => {
    return Promise.resolve(SQLite.openDatabase(name, version, description, size));
  },
};

module.exports = SQLite;
module.exports.SQLite = SQLite;
