const Sequelize = require('sequelize');
// const mtblLinkGetPrice = require('../tables/tblLinkGetPrice');
// const mtblSysUser = require('../tables/tblSysUser');

module.exports = function (db) {
    var tblPrice = db.define('tblPrice', {
        ID: {
            type: Sequelize.BIGINT,
            primaryKey: true,
            autoIncrement: true
        },
        IDLink: Sequelize.BIGINT,
        IDUserGet: Sequelize.BIGINT,
        Price: Sequelize.FLOAT,
        DateGet: Sequelize.DATE
    });
    // tblPrice.belongsTo(mtblLinkGetPrice(db), {
    //     foreignKey: 'IDLink'
    // })

    return tblPrice;
}