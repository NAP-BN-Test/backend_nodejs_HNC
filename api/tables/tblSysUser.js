const Sequelize = require('sequelize');
const mtblPrice = require('../tables/tblPrice')

module.exports = function (db) {
    var table = db.define('tblSysUser', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        UserName: Sequelize.STRING,
        Password: Sequelize.STRING,
        Active: Sequelize.BOOLEAN,
        GhiChu: Sequelize.STRING,
        Permission: Sequelize.INTEGER,
        Name: Sequelize.STRING,
    });
    table.hasMany(mtblPrice(db), {
        foreignKey: 'IDUserGet'
    })

    return table;
}