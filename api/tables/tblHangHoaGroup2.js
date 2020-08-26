const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('tblHangHoaGroup2', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        TenNhomHang: Sequelize.STRING,
        FlagSelect: Sequelize.BOOLEAN,
        ID_Group1: Sequelize.BIGINT
    });

    return table;
}