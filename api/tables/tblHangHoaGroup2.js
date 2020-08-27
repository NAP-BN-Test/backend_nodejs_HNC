const Sequelize = require('sequelize');
// const mtblHangHoa = require('../tables/tblHangHoa')
// const mtblHangHoaGroup3 = require('../tables/tblHangHoaGroup3')
// const mtblHangHoaGroup2 = require('../tables/tblHangHoaGroup2')
const mtblHangHoaGroup1 = require('../tables/tblHangHoaGroup1')

module.exports = function (db) {
    var table = db.define('tblHangHoaGroup2', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        TenNhomHang: Sequelize.STRING,
        FlagSelect: Sequelize.BOOLEAN,
        IDGroup1: Sequelize.BIGINT
    });
    table.belongsTo(mtblHangHoaGroup1(db), {
        foreignKey: 'IDGroup1'
    })
    // table.hasMany(mtblHangHoaGroup2(db), {
    //     foreignKey: 'IDGroup2'
    // })
    // table.hasMany(mtblHangHoaGroup3(db), {
    //     foreignKey: 'ID_Group2'
    // })
    return table;
}