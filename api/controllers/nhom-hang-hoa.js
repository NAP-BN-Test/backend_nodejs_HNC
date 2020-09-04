const Result = require('../constants/result');
const Constant = require('../constants/constant');
const Op = require('sequelize').Op;
var database = require('../database');
var mSysUser = require('../tables/tblSysUser');
var mHangHoa = require('../tables/tblHangHoa');
const mtblHangHoaGroup1 = require('../tables/tblHangHoaGroup1')
const mtblHangHoaGroup2 = require('../tables/tblHangHoaGroup2')
const mtblHangHoaGroup3 = require('../tables/tblHangHoaGroup3')
let apiHangHoa = require('./hang-hoa');
let apiHangHoaGroup2 = require('./hang-hoa-group2');
let apiHangHoaGroup3 = require('./hang-hoa-group3');
const bodyParser = require('body-parser');

module.exports = {
    // update_group
    updateGroup: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {
            if (body.idGroup1) {
                await mtblHangHoaGroup1(db).update({
                    TenNhomHang: body.nameGroup1,
                }, {
                    where: { ID: body.idGroup1 }
                })
            }
            if (body.idGroup2) {
                await mtblHangHoaGroup2(db).update({
                    TenNhomHang: body.nameGroup2,
                }, {
                    where: { ID: body.idGroup2 }
                })
            }
            if (body.idGroup3) {
                await mtblHangHoaGroup3(db).update({
                    TenNhomHang: body.nameGroup3,
                }, {
                    where: { ID: body.idGroup3 }
                })
            }
            var result = {
                status: Constant.STATUS.SUCCESS,
                message: 'Thao tác thành công!'
            }
            res.json(result);
        })
    },

}