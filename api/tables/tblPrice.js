const Sequelize = require('sequelize');
const mtblLinkGetPrice = require('../tables/tblLinkGetPrice');
const mtblSysUser = require('../tables/tblSysUser');

module.exports = function (db) {
    var table = db.define('tblPrice', {
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

    table.belongsTo(mtblLinkGetPrice(db), {
        foreignKey: 'IDLink'
    })

    // table.belongsTo(mtblSysUser(db), {
    //     foreignKey: 'IDUserGet'
    // })

    return table;
}