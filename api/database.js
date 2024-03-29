// const Result = require('./constants/result');
const Sequelize = require('sequelize');

module.exports = {
    config: {
        user: 'sa',
        password: 'Viet@solution$213%171^198',
        server: '103.154.100.26',
        database: 'HNC_DB',
        connectionTimeout: 30000,
        requestTimeout: 30000,
        options: {
            encrypt: false,

            // 
        },
        pool: {
            acquireTimeoutMillis: 60000,
            idleTimeoutMillis: 60000
        }
    },
    connectDatabase: async function() {
        const db = new Sequelize('HNC_DB', 'sa', 'Viet@solution$213%171^198', {
            host: '103.154.100.26',
            dialect: 'mssql',
            operatorsAliases: '0',
            // Bắt buộc phải có
            dialectOptions: {
                options: {
                    encrypt: false,
                    requestTimeout: 300000
                }
            },
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
            },
            define: {
                timestamps: false,
                freezeTableName: true
            }
        });

        await db.authenticate()
            .then(() => console.log('Ket noi thanh cong'))
            .catch(err => console.log(err.message));
        return db;
    },
    updateTable: async function(listObj, table, id) {
        let updateObj = {};
        for (let field of listObj) {
            updateObj[field.key] = field.value
        }
        try {
            await table.update(updateObj, { where: { ID: id } });
            return Promise.resolve(1);
        } catch (error) {
            console.log(error);
            return Promise.reject(error);
        }


    }

}