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
    if (check) return check.ID
    else null
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
    if (check) return check.ID
    else null
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
async function deleteAndCreateLink(db, idHangHoa, linkPrice, key) {
    if (key === 4) {
        var link = await mtblLinkGetPrice(db).findAll({
            where: {
                [Op.and]: [
                    { IDHangHoa: idHangHoa },
                    { EnumLoaiLink: 4 }
                ]
            }
        })
        if (link.length > 0) {
            await mtblLinkGetPrice(db).update({
                LinkAddress: linkPrice,
            }, {
                where: {
                    [Op.and]: [
                        { IDHangHoa: idHangHoa },
                        { EnumLoaiLink: 4 }
                    ]
                }
            })
            return
        }
        await mtblLinkGetPrice(db).create({
            IDHangHoa: idHangHoa,
            EnumLoaiLink: 4,
            LinkAddress: linkPrice,
        })

    } else if (key === 3) {
        var link = await mtblLinkGetPrice(db).findAll({
            where: {
                [Op.and]: [
                    { IDHangHoa: idHangHoa },
                    { EnumLoaiLink: 3 }
                ]
            }
        })
        if (link.length > 0) {
            await mtblLinkGetPrice(db).update({
                LinkAddress: linkPrice,
            }, {
                where: {
                    [Op.and]: [
                        { IDHangHoa: idHangHoa },
                        { EnumLoaiLink: 3 }
                    ]
                }
            })
            return
        }
        await mtblLinkGetPrice(db).create({
            IDHangHoa: idHangHoa,
            EnumLoaiLink: 3,
            LinkAddress: linkPrice,
        })
    } else if (key === 0) {
        var link = await mtblLinkGetPrice(db).findAll({
            where: {
                [Op.and]: [
                    { IDHangHoa: idHangHoa },
                    { EnumLoaiLink: 0 }
                ]
            }
        })
        if (link.length > 0) {
            await mtblLinkGetPrice(db).update({
                LinkAddress: linkPrice,
            }, {
                where: {
                    [Op.and]: [
                        { IDHangHoa: idHangHoa },
                        { EnumLoaiLink: 0 }
                    ]
                }
            })
            return
        }
        await mtblLinkGetPrice(db).create({
            IDHangHoa: idHangHoa,
            EnumLoaiLink: 0,
            LinkAddress: linkPrice,
        })
    } else if (key === 2) {
        var link = await mtblLinkGetPrice(db).findAll({
            where: {
                [Op.and]: [
                    { IDHangHoa: idHangHoa },
                    { EnumLoaiLink: 2 }
                ]
            }
        })
        if (link.length > 0) {
            await mtblLinkGetPrice(db).update({
                LinkAddress: linkPrice,
            }, {
                where: {
                    [Op.and]: [
                        { IDHangHoa: idHangHoa },
                        { EnumLoaiLink: 2 }
                    ]
                }
            })
            return
        }
        await mtblLinkGetPrice(db).create({
            IDHangHoa: idHangHoa,
            EnumLoaiLink: 2,
            LinkAddress: linkPrice,
        })
    } else if (key === 1) {
        var link = await mtblLinkGetPrice(db).findAll({
            where: {
                [Op.and]: [
                    { IDHangHoa: idHangHoa },
                    { EnumLoaiLink: 1 }
                ]
            }
        })
        if (link.length > 0) {
            await mtblLinkGetPrice(db).update({
                LinkAddress: linkPrice,
            }, {
                where: {
                    [Op.and]: [
                        { IDHangHoa: idHangHoa },
                        { EnumLoaiLink: 1 }
                    ]
                }
            })
            return
        }
        await mtblLinkGetPrice(db).create({
            IDHangHoa: idHangHoa,
            EnumLoaiLink: 1,
            LinkAddress: linkPrice,
        })
    } else if (key === 5) {
        var link = await mtblLinkGetPrice(db).findAll({
            where: {
                [Op.and]: [
                    { IDHangHoa: idHangHoa },
                    { EnumLoaiLink: 5 }
                ]
            }
        })
        if (link.length > 0) {
            await mtblLinkGetPrice(db).update({
                LinkAddress: linkPrice,
            }, {
                where: {
                    [Op.and]: [
                        { IDHangHoa: idHangHoa },
                        { EnumLoaiLink: 5 }
                    ]
                }
            })
            return
        }
        await mtblLinkGetPrice(db).create({
            IDHangHoa: idHangHoa,
            EnumLoaiLink: 5,
            LinkAddress: linkPrice,
        })
    } else if (key === 6) {
        var link = await mtblLinkGetPrice(db).findAll({
            where: {
                [Op.and]: [
                    { IDHangHoa: idHangHoa },
                    { EnumLoaiLink: 6 }
                ]
            }
        })
        if (link.length > 0) {
            await mtblLinkGetPrice(db).update({
                LinkAddress: linkPrice,
            }, {
                where: {
                    [Op.and]: [
                        { IDHangHoa: idHangHoa },
                        { EnumLoaiLink: 6 }
                    ]
                }
            })
            return
        }
        await mtblLinkGetPrice(db).create({
            IDHangHoa: idHangHoa,
            EnumLoaiLink: 6,
            LinkAddress: linkPrice,
        })
    }
}

module.exports = {
    // import_file
    importFile: (req, res) => {
        try {
            let body = req.body;
            console.log(body.data.replace(/!!@@##%%/g, '+').replace(/!!@@##%/g, '%2F').replace(/!!@@##/g, '&').replace(/%20/g, ' '));
            var data = JSON.parse(body.data.replace(/!!@@##%%/g, '+').replace(/!!@@##%/g, '%2F').replace(/!!@@##/g, '&').replace(/%20/g, ' '));
            console.log(data);
            database.connectDatabase().then(async db => {
                for (var i = 0; i < data.length; i++) {
                    console.log(data[i]['Nhóm cấp 1']);
                    if (!data[i]['Nhóm cấp 1']) continue;
                    var idGroup1;
                    var idGroup2;
                    var idGroup3;
                    var idHangHoa;
                    var exitsHangHoa = await mHangHoa(db).findOne({
                        where: {
                            Code: data[i]['Mã hàng'],
                        }
                    })
                    if (exitsHangHoa) {
                        idHangHoa = exitsHangHoa.ID
                    } else {
                        var checkGroup1 = await mtblHangHoaGroup1(db).findOne({
                            where: { TenNhomHang: data[i]['Nhóm cấp 1'] ? data[i]['Nhóm cấp 1'] : '' }
                        });
                        if (checkGroup1) {
                            idGroup1 = checkGroup1.ID
                            if (data[i]['Nhóm cấp 2']) {
                                if (await pushNamereturnIDGroup2(db, data[i]['Nhóm cấp 2'], idGroup1)) {
                                    Group2 = await pushNamereturnIDGroup2(db, data[i]['Nhóm cấp 2'], idGroup1)
                                    idGroup2 = Group2
                                    if (data[i]['Nhóm cấp 3'] && idGroup2) {
                                        var g3 = await pushNamereturnIDGroup3(db, data[i]['Nhóm cấp 3'], idGroup2)
                                        if (g3) {
                                            idGroup3 = g3;
                                        } else {
                                            var group3 = await mtblHangHoaGroup3(db).create({
                                                TenNhomHang: data[i]['Nhóm cấp 3'],
                                                IDGroup2: idGroup2,
                                            })
                                            idGroup3 = group3.ID
                                        }
                                    } else idGroup3 = null
                                } else {
                                    var group2 = await mtblHangHoaGroup2(db).create({
                                        TenNhomHang: data[i]['Nhóm cấp 2'],
                                        IDGroup1: idGroup1,
                                    })
                                    idGroup2 = group2.ID
                                    if (data[i]['Nhóm cấp 3']) {
                                        if (await pushNamereturnIDGroup3(db, data[i]['Nhóm cấp 3'], idGroup2)) {
                                            idGroup3 = await pushNamereturnIDGroup3(db, data[i]['Nhóm cấp 3'], idGroup2);
                                        } else {
                                            var group3 = await mtblHangHoaGroup3(db).create({
                                                TenNhomHang: data[i]['Nhóm cấp 3'],
                                                IDGroup2: idGroup2,
                                            })
                                            idGroup3 = group3.ID
                                        }
                                    } else idGroup3 = null
                                }
                            }
                        } else {
                            if (!data[i]['Nhóm cấp 1']) {
                                var result = {
                                    status: Constant.STATUS.FAIL,
                                    message: Constant.MESSAGE.DATA_FAIL,
                                }
                                return res.json(result)
                            }
                            var group1 = await mtblHangHoaGroup1(db).create({
                                TenNhomHang: data[i]['Nhóm cấp 1'],
                            });
                            idGroup1 = group1.ID
                            if (data[i]['Nhóm cấp 2']) {
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
                            }
                        }

                        var hanghoa = await mHangHoa(db).create({
                            NameHangHoa: data[i]['Tên hàng'] ? data[i]['Tên hàng'] : '',
                            PART: data[i]['Part'] ? data[i]['Part'] : '',
                            Code: data[i]['Mã hàng'] ? data[i]['Mã hàng'] : '',
                            IDGroup1: idGroup1,
                            IDGroup2: idGroup2,
                            IDGroup3: idGroup3,
                        })
                        idHangHoa = hanghoa.ID
                    }

                    if (data[i]['Link XG']) {
                        await deleteAndCreateLink(db, idHangHoa, data[i]['Link XG'], 5)
                    }
                    if (data[i]['Link HNC']) {
                        await deleteAndCreateLink(db, idHangHoa, data[i]['Link HNC'], 4)
                    }
                    if (data[i]['Link An Phát']) {
                        await deleteAndCreateLink(db, idHangHoa, data[i]['Link An Phát'], 1)
                    }
                    if (data[i]['Link Phúc Anh']) {
                        await deleteAndCreateLink(db, idHangHoa, data[i]['Link Phúc Anh'], 2)
                    }
                    if (data[i]['Link PV']) {
                        await deleteAndCreateLink(db, idHangHoa, data[i]['Link PV'], 0)
                    }
                    if (data[i]['Link GearVN']) {
                        await deleteAndCreateLink(db, idHangHoa, data[i]['Link GearVN'], 3)
                    }
                    if (data[i]['Link Cellphones']) {
                        await deleteAndCreateLink(db, idHangHoa, data[i]['Link Cellphones'], 6)
                    }
                }
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: 'Thao tác thành công',
                }
                res.json(result)
            })

        } catch (error) {
            console.log(error);
            var result = {
                status: Constant.STATUS.FAIL,
            }
            res.json(result)
        }
    }
}