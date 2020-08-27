const Sequelize = require('sequelize');
const mtblHangHoaGroup1 = require('../tables/tblHangHoaGroup1')
const mtblHangHoaGroup2 = require('../tables/tblHangHoaGroup2')
const mtblHangHoaGroup3 = require('../tables/tblHangHoaGroup3')
// const mtblLinkGetPrice = require('../tables/tblLinkGetPrice')

module.exports = function (db) {
    var table = db.define('tblHangHoa', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        IDGroup1: Sequelize.BIGINT,
        IDGroup2: Sequelize.BIGINT,
        IDGroup3: Sequelize.BIGINT,
        Code: Sequelize.STRING,
        NameHangHoa: Sequelize.STRING,
        DonViTinh: Sequelize.STRING,
        IntenalCode: Sequelize.STRING,
        FlagSelect: Sequelize.BOOLEAN,
    });
    table.belongsTo(mtblHangHoaGroup1(db), {
        foreignKey: 'IDGroup1'
    })
    table.belongsTo(mtblHangHoaGroup2(db), {
        foreignKey: 'IDGroup2'
    })
    table.belongsTo(mtblHangHoaGroup3(db), {
        foreignKey: 'IDGroup3'
    })
    // table.hasMany(mtblLinkGetPrice(db), {
    //     foreignKey: 'IDHangHoa'
    // })
    return table;
}