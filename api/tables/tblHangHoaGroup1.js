const Sequelize = require('sequelize');
// const mtblHangHoa = require('../tables/tblHangHoa')
// const mtblHangHoaGroup2 = require('../tables/tblHangHoaGroup2')

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
    // table.hasMany(mtblHangHoa(db), {
    //     foreignKey: 'IDGroup1'
    // })
    // table.hasMany(mtblHangHoaGroup2(db), {
    //     foreignKey: 'ID_Group1'
    // })

    return table;
}