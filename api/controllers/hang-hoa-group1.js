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

async function getListHangHoa(db, listID) {
    var listIDHangHoa = await mHangHoa(db).findAll({
        where: { IDGroup1: { [Op.in]: listID } },
    })
    var list = [];
    listIDHangHoa.forEach(item => {
        list.push(Number(item.ID))
    })
    return list;
}
function filterArray(value, array) {
    var check = false;
    if (array.length > 0) {
        array.forEach(item => {
            if (item === value) {
                check = true;
            }
        })
    }
    return check

}

function countDulicant(array_elements) {
    var array = [];
    for (var i = 0; i < array_elements.length; i++) {
        if (!filterArray(array_elements[i], array)) {
            array.push(array_elements[i])
        }
    }
    return array.length;

}

async function getListHangHoaGroup2(db, listID) {
    var listIDHangHoaGroup2 = await mtblHangHoaGroup2(db).findAll({
        where: { IDGroup1: { [Op.in]: listID } },
    })
    var list = [];
    listIDHangHoaGroup2.forEach(item => {
        list.push(Number(item.ID))
    })
    return list;
}

async function deleteHangHoaGroup1(db, listID) {
    let list = await getListHangHoa(db, listID);
    let listGroup2 = await getListHangHoaGroup2(db, listID);
    await apiHangHoa.deleteHangHoa(db, list);
    await apiHangHoaGroup2.deleteHangHoaGroup2(db, listGroup2);
    await mtblHangHoaGroup1(db).destroy({
        where: {
            ID: { [Op.in]: listID },
        }
    });
}
async function checkIn(array, value) {
    array.forEach(item => {
        if (item === value) return true
    })
    return false
}

module.exports = {
    // add_goods_group1
    addGoodsGroup1: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {
            try {
                await mtblHangHoaGroup1(db).create({
                    TenNhomHang: body.tenNhomHang ? body.tenNhomHang : '',
                    FlagSelect: body.flagSelect ? body.flagSelect : '',

                }).then(data => {
                    var obj = {
                        id: data.ID,
                        tenNhomHang: data.TenNhomHang ? data.TenNhomHang : '',
                        flagSelect: data.FlagSelect ? data.FlagSelect : '',
                    }
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: Constant.MESSAGE.ACTION_SUCCESS,
                        obj: obj
                    }

                    res.json(result);
                })

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })
    },
    // update_goods_group1 : cập nhật hàng hóa
    updateGoodsGroup1: (req, res) => {
        let body = req.body;

        database.connectDatabase().then(async db => {
            try {
                let listUpdate = [];

                if (body.tenNhomHang || body.tenNhomHang === '')
                    listUpdate.push({ key: 'TenNhomHang', value: body.tenNhomHang });
                if (body.flagSelect)
                    listUpdate.push({ key: 'FlagSelect', value: body.flagSelect });

                let update = {};
                for (let field of listUpdate) {
                    update[field.key] = field.value
                }
                mtblHangHoaGroup1(db).update(update, { where: { ID: body.id } }).then(() => {
                    res.json(Result.ACTION_SUCCESS)
                }).catch(() => {
                    res.json(Result.SYS_ERROR_RESULT);
                })
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        })


    },
    // delete_goods_group1
    deleteGoodsGroup1: (req, res) => {
        let body = req.body;

        database.connectDatabase().then(async db => {

            try {
                let listIDJson = body.listID;
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });
                deleteHangHoaGroup1(db, listID);

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },
    // get_list_goods_group1
    getListGoodsGroup1: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {
            let where = {};
            let whereSearch = [];
            if (body.searchKey) {
                whereSearch = [
                    { TenNhomHang: { [Op.like]: '%' + body.searchKey + '%' } },
                ];
            } else {
                whereSearch = [
                    { TenNhomHang: { [Op.like]: '%' + '' + '%' } },
                ];
            }
            where = {
                [Op.and]: whereSearch,
            }

            var count = await mtblHangHoaGroup1(db).count({ where: where });
            var array = [];
            var itemPerPage = 10000;
            var page = 1;
            if (body.itemPerPage) {
                itemPerPage = Number(body.itemPerPage);
                if (body.page)
                    page = Number(body.page);
            }
            await mtblHangHoaGroup1(db).findAll({
                where: where,
                order: [['ID', 'DESC']],
                offset: itemPerPage * (page - 1),
                limit: itemPerPage
            }).then(data => {
                data.forEach(elm => {
                    array.push({
                        id: elm.ID,
                        tenNhomHang: elm.TenNhomHang ? elm.TenNhomHang : '',
                        flagSelect: elm.FlagSelect ? elm.FlagSelect : '',
                    })
                })
            })

            var result = {
                status: Constant.STATUS.SUCCESS,
                message: '',
                array: array,
                all: count,
            }
            res.json(result)
        })
    },
    // get_groups_from_group1
    getGroupsFromGroup1: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {
            var array = [];
            var itemPerPage = 10000;
            var page = 1;
            if (body.itemPerPage) {
                itemPerPage = Number(body.itemPerPage);
                if (body.page)
                    page = Number(body.page);
            }
            await mtblHangHoaGroup1(db).findAll({
                order: [['ID', 'DESC']],
                offset: itemPerPage * (page - 1),
                limit: itemPerPage
            }).then(async data => {
                for (var i = 0; i < data.length; i++) {
                    var check = await mtblHangHoaGroup2(db).findAll({
                        where: { IDGroup1: data[i].ID }
                    })
                    if (check.length === 0) {
                        array.push({
                            idGroup1: data[i].ID,
                            tenNhomHang1: data[i].TenNhomHang ? data[i].TenNhomHang : '',
                            flagSelect1: data[i].FlagSelect ? data[i].FlagSelect : '',
                            idGroup2: null,
                            tenNhomHang2: '',
                            flagSelect2: '',
                            idGroup3: null,
                            tenNhomHang3: '',
                            flagSelect3: '',
                        })
                        continue;
                    }
                    await mtblHangHoaGroup2(db).findAll({
                        where: { IDGroup1: data[i].ID }
                    }).then(async group2 => {
                        for (var j = 0; j < group2.length; j++) {
                            var check = await mtblHangHoaGroup3(db).findAll({
                                where: { IDGroup2: group2[j].ID }
                            })
                            if (check.length === 0) {
                                array.push({
                                    idGroup1: data[i].ID,
                                    tenNhomHang1: data[i].TenNhomHang ? data[i].TenNhomHang : '',
                                    flagSelect1: data[i].FlagSelect ? data[i].FlagSelect : '',
                                    idGroup2: group2[j] ? group2[j].ID : null,
                                    tenNhomHang2: group2[j].TenNhomHang ? group2[j].TenNhomHang : '',
                                    flagSelect2: group2[j].FlagSelect ? group2[j].FlagSelect : '',
                                    idGroup3: null,
                                    tenNhomHang3: '',
                                    flagSelect3: '',
                                })
                                continue;
                            }
                            await mtblHangHoaGroup3(db).findAll({
                                where: { IDGroup2: group2[j].ID }
                            }).then(group3 => {
                                for (var e = 0; e < group3.length; e++) {
                                    array.push({
                                        idGroup1: data[i].ID,
                                        tenNhomHang1: data[i].TenNhomHang ? data[i].TenNhomHang : '',
                                        flagSelect1: data[i].FlagSelect ? data[i].FlagSelect : '',
                                        idGroup2: group2[j] ? group2[j].ID : null,
                                        tenNhomHang2: group2[j].TenNhomHang ? group2[j].TenNhomHang : '',
                                        flagSelect2: group2[j].FlagSelect ? group2[j].FlagSelect : '',
                                        idGroup3: group3[e] ? group3[e].ID : null,
                                        tenNhomHang3: group3[e] ? group3[e].TenNhomHang : '',
                                        flagSelect3: group3[e] ? group3[e].FlagSelect : '',
                                    })
                                }
                            })
                        }
                    })
                }
            })
            var count1 = await mtblHangHoaGroup1(db).count();
            var count2 = await mtblHangHoaGroup2(db).count();
            var count3 = await mtblHangHoaGroup3(db).count();
            var idGroup1 = [];
            var idGroup2 = [];
            await mtblHangHoaGroup2(db).findAll({ IDGroup1: null }).then(data => {
                data.forEach(item => {
                    idGroup1.push(item.IDGroup1);
                })
            });
            await mtblHangHoaGroup3(db).findAll({ IDGroup2: null }).then(data => {
                data.forEach(item => {
                    idGroup2.push(item.IDGroup2);
                })
            });
            var count1has2 = countDulicant(idGroup1);
            var count2has3 = countDulicant(idGroup2);
            var result = {
                status: Constant.STATUS.SUCCESS,
                message: '',
                array: array,
                all: count3 + (count1 - count1has2) + (count2 - count2has3),
            }
            res.json(result)

        })
    },
    // add_goods_groups
    addGoodsGroups: (req, res) => {
        let body = req.body;
        console.log(body);
        database.connectDatabase().then(async db => {

            if (body.idGroup1 === '-1') {
                await mtblHangHoaGroup1(db).create({
                    TenNhomHang: body.nameGroup1 ? body.nameGroup1 : '',
                    FlagSelect: body.flagSelect1 ? body.flagSelect1 : '',
                }).then(async group1 => {
                    if (body.idGroup2 === '-1') {
                        await mtblHangHoaGroup2(db).create({
                            TenNhomHang: body.nameGroup2 ? body.nameGroup2 : '',
                            FlagSelect: body.flagSelect2 ? body.flagSelect2 : '',
                            IDGroup1: group1.ID,
                        }).then(async group2 => {
                            if (body.idGroup3 === '-1') {
                                await mtblHangHoaGroup3(db).create({
                                    TenNhomHang: body.nameGroup3 ? body.nameGroup3 : '',
                                    FlagSelect: body.flagSelect3 ? body.flagSelect3 : '',
                                    IDGroup2: group2.ID,
                                })
                            }
                        })
                    }
                })
            } else {
                if (body.idGroup2 === '-1') {
                    await mtblHangHoaGroup2(db).create({
                        TenNhomHang: body.nameGroup2 ? body.nameGroup2 : '',
                        FlagSelect: body.flagSelect2 ? body.flagSelect2 : '',
                        IDGroup1: body.idGroup1,
                    }).then(async group2 => {
                        if (body.idGroup3 === '-1') {
                            await mtblHangHoaGroup3(db).create({
                                TenNhomHang: body.nameGroup3 ? body.nameGroup3 : '',
                                FlagSelect: body.flagSelect3 ? body.flagSelect3 : '',
                                IDGroup2: group2.ID,
                            })
                        }
                    })
                } else {
                    if (body.idGroup3 === '-1') {
                        await mtblHangHoaGroup3(db).create({
                            TenNhomHang: body.nameGroup3 ? body.nameGroup3 : '',
                            FlagSelect: body.flagSelect3 ? body.flagSelect3 : '',
                            IDGroup2: body.idGroup2,
                        })
                    }
                }
            }
            var result = {
                status: Constant.STATUS.SUCCESS,
                message: Constant.MESSAGE.SUCCESS,
            }
            res.json(result);
        })
    }
}