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
var mtblLinkGetPrice = require('../tables/tblLinkGetPrice');


async function pushNamereturnIDGroup2(db, name, idGroup1) {
    var check = await mtblHangHoaGroup2(db).findOne({
        where: {
            [Op.and]: [
                { TenNhomHang: name },
                { IDGroup1: idGroup1 },
            ]
        }
    });
    return check.ID;
}
async function pushNamereturnIDGroup3(db, name, idGroup2) {
    var check = await mtblHangHoaGroup3(db).findOne({
        where: {
            [Op.and]: [
                { TenNhomHang: name },
                { IDGroup2: idGroup2 },
            ]
        }
    });
    return check.ID;
}

async function checkGroup2ExitsGroup1(db, idGroup1, idGroup2, nameGroup2) {
    var check = await mtblHangHoaGroup2(db).findOne({
        where: {
            [Op.and]: [
                { TenNhomHang: nameGroup2 },
                { IDGroup1: idGroup1 },
            ]
        }
    });
    if (!check) return false
    if (check.ID === idGroup2) return true
    else return false
}

async function checkGroup3ExitsGroup2(db, idGroup2, idGroup3, nameGroup3) {
    var check = await mtblHangHoaGroup3(db).findOne({
        where: {
            [Op.and]: [
                { TenNhomHang: nameGroup3 },
                { IDGroup2: idGroup2 },
            ]
        }
    });
    if (!check) return false
    if (check.ID === idGroup3) return true
    else return false
}

function convertBrandShop(value) {
    if (value = 'Link HNC') return 4
    if (value = 'Link An Phát') return 1
    if (value = 'Link Phúc Anh') return 2
    if (value = 'Link PV') return 0
    if (value = 'Link GearVN') return 3
}

module.exports = {
    // import_file
    importFile: (req, res) => {
        let body = req.body;
        console.log(body);
        var data = JSON.parse(body.data);
        database.connectDatabase().then(async db => {
            var idGroup1;
            var idGroup2;
            var idGroup3;
            var idHangHoa;
            var IDlink;
            for (var i = 0; i < data.length; i++) {
                var checkGroup1 = await mtblHangHoaGroup1(db).findOne({
                    where: { TenNhomHang: data[i]['Nhóm cấp 1'] }
                });
                if (checkGroup1) {
                    idGroup1 = checkGroup1.ID
                    if (pushNamereturnIDGroup2(db, data[i]['Nhóm cấp 2'], idGroup1)) {
                        idGroup2 = pushNamereturnIDGroup2(db, data[i]['Nhóm cấp 2'], idGroup1)
                        if (data[i]['Nhóm cấp 3']) {
                            var group3 = await mtblHangHoaGroup3(db).create({
                                TenNhomHang: data[i]['Nhóm cấp 3'],
                                IDGroup2: idGroup2,
                            })
                            idGroup3 = group3.ID
                        }
                        else idGroup3 = null
                    }
                    else {
                        var group2 = await mtblHangHoaGroup2(db).create({
                            TenNhomHang: data[i]['Nhóm cấp 2'],
                            IDGroup1: idGroup1,
                        })
                        idGroup2 = group2.ID
                        if (data[i]['Nhóm cấp 3']) {
                            var group3 = await mtblHangHoaGroup3(db).create({
                                TenNhomHang: data[i]['Nhóm cấp 3'],
                                IDGroup2: idGroup2,
                            })
                            idGroup3 = group3.ID
                        }
                        else idGroup3 = null
                    }
                } else {
                    var group1 = await mtblHangHoaGroup1(db).create({
                        TenNhomHang: data[i]['Nhóm cấp 1'],
                    });
                    idGroup1 = group1.ID
                    var group2 = await mtblHangHoaGroup2(db).create({
                        TenNhomHang: data[i]['Nhóm cấp 2'],
                        IDGroup1: idGroup1,
                    })
                    idGroup2 = group2.ID
                    var group3 = await mtblHangHoaGroup3(db).create({
                        TenNhomHang: data[i]['Nhóm cấp 3'],
                        IDGroup2: idGroup2,
                    })
                    idGroup3 = group3.ID
                }
                var exitsHangHoa = await mHangHoa(db).findOne({
                    where: {
                        Code: data[i]['Mã hàng'],
                    }
                })
                if (exitsHangHoa) {
                    idHangHoa = exitsHangHoa.ID
                }
                else {
                    var hanghoa = await mHangHoa(db).create({
                        NameHangHoa: data[i]['Tên hàng'] ? data[i]['Tên hàng'] : '',
                        PART: data[i]['Part'] ? data[i]['Part'] : '',
                        Code: data[i]['Mã hàng'] ? data[i]['Mã hàng'] : '',
                    })
                    idHangHoa = hanghoa.ID
                }
                if (data[i]['Link HNC']) {
                    await mtblLinkGetPrice(db).destroy({
                        where: { IDHangHoa: idHangHoa }
                    })
                    await mtblLinkGetPrice(db).create({
                        IDHangHoa: idHangHoa,
                        LinkAddress: data[i]['Link HNC'],
                        EnumLoaiLink: 4
                    })
                }
                if (data[i]['Link An Phát']) {
                    await mtblLinkGetPrice(db).destroy({
                        where: { IDHangHoa: idHangHoa }
                    })
                    await mtblLinkGetPrice(db).create({
                        IDHangHoa: idHangHoa,
                        LinkAddress: data[i]['Link An Phát'],
                        EnumLoaiLink: 1
                    })
                }
                if (data[i]['Link Phúc Anh']) {
                    await mtblLinkGetPrice(db).destroy({
                        where: { IDHangHoa: idHangHoa }
                    })
                    await mtblLinkGetPrice(db).create({
                        IDHangHoa: idHangHoa,
                        LinkAddress: data[i]['Link Phúc Anh'],
                        EnumLoaiLink: 2
                    })
                }
                if (data[i]['Link PV']) {
                    await mtblLinkGetPrice(db).destroy({
                        where: { IDHangHoa: idHangHoa }
                    })
                    await mtblLinkGetPrice(db).create({
                        IDHangHoa: idHangHoa,
                        LinkAddress: data[i]['Link HNC'],
                        EnumLoaiLink: 0
                    })
                }
                if (data[i]['Link GearVN']) {
                    await mtblLinkGetPrice(db).destroy({
                        where: { IDHangHoa: idHangHoa }
                    })
                    await mtblLinkGetPrice(db).create({
                        IDHangHoa: idHangHoa,
                        LinkAddress: data[i]['Link HNC'],
                        EnumLoaiLink: 3
                    })
                }

            }
        })
    }
}