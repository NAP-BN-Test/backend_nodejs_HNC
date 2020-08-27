const Sequelize = require('sequelize');
const mtblHangHoaGroup2 = require('../tables/tblHangHoaGroup2')
const mtblHangHoa = require('./tblHangHoa')

module.exports = function (db) {
    var table = db.define('tblHangHoaGroup3', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        TenNhomHang: Sequelize.STRING,
        FlagSelect: Sequelize.BOOLEAN,
        IDGroup2: Sequelize.BIGINT
    });
    table.belongsTo(mtblHangHoaGroup2(db), {
        foreignKey: 'IDGroup2'
    })
    // table.hasMany(mtblHangHoa(db), {
    //     foreignKey: 'IDGroup3'
    // })
    return table;
}