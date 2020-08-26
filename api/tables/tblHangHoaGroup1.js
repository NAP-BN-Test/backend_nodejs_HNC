const Sequelize = require('sequelize');

module.exports = function (db) {
    var table = db.define('tblHangHoaGroup1', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        TenNhomHang: Sequelize.STRING,
        FlagSelect: Sequelize.BOOLEAN
    });

    return table;
}