const Sequelize = require('sequelize');
const mtblHangHoa = require('../tables/tblHangHoa')
// const mtblPrice = require('../tables/tblPrice')

module.exports = function (db) {
    var table = db.define('tblLinkGetPrice', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        IDHangHoa: Sequelize.BIGINT,
        LinkAddress: Sequelize.STRING,
        Description: Sequelize.STRING,
        EnumLoaiLink: Sequelize.INTEGER
    });

    table.belongsTo(mtblHangHoa(db), {
        foreignKey: 'IDHangHoa'
    })

    // table.hasMany(mtblPrice(db), {
    //     foreignKey: 'IDLink'
    // })

    return table;
}