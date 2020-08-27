// const Result = require('./constants/result');
const Sequelize = require('sequelize');

module.exports = {
    connectDatabase: async function () {
        const db = new Sequelize('HNC_DB', 'sa', '1234', {
            host: 'localhost',
            dialect: 'mssql',
            operatorsAliases: '0',
            // Bắt buộc phải có
            dialectOptions: {
                options: { encrypt: false }
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

        db.authenticate()
            .then(() => console.log('Ket noi thanh cong'))
            .catch(err => console.log(err.message));
        return db;
    },
    updateTable: async function (listObj, table, id) {
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