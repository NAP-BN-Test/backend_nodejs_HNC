const Sequelize = require('sequelize');
// const mtblHangHoa = require('../tables/tblHangHoa')
const mtblPrice = require('../tables/tblPrice')

module.exports = function (db) {
    var tblLinkGetPrice = db.define('tblLinkGetPrice', {
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

    // tblLinkGetPrice.belongsTo(mtblHangHoa(db), {
    //     foreignKey: 'IDHangHoa'
    // })
    // relationship
    // tblLinkGetPrice.associate = function (models) {
    tblLinkGetPrice.hasMany(mtblPrice(db), {
        foreignKey: 'IDLink'
    })
    // };


    return tblLinkGetPrice;
}