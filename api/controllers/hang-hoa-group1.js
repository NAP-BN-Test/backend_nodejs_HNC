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
var sql = require("mssql");

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

async function createAndCheckGroup3(res, db, idGroup2, body) {
    var existGroup3 = await mtblHangHoaGroup3(db).findAll({
        where: {
            [Op.and]: [
                { IDGroup2: idGroup2 },
                { TenNhomHang: body.nameGroup3 }
            ]
        }
    })
    if (existGroup3.length > 0) {
        var result = {
            status: Constant.STATUS.FAIL,
            message: 'Nhóm cấp 3 đã tồn tại. Vui lòng kiểm tra lại!',
        }
        return res.json(result);
    }
    await mtblHangHoaGroup3(db).create({
        TenNhomHang: body.nameGroup3 ? body.nameGroup3 : '',
        FlagSelect: body.flagSelect3 ? body.flagSelect3 : '',
        IDGroup2: idGroup2,
    })
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
                let listIDJson = JSON.parse(body.listID);
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });
                await deleteHangHoaGroup1(db, listID);

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
            var itemPerPage = 10000;
            var page = 1;
            if (body.itemPerPage) {
                itemPerPage = Number(body.itemPerPage);
                if (body.page)
                    page = Number(body.page);
            }
            var query = `SELECT * FROM (
                SELECT g1.ID idGroup1, g1.TenNhomHang tenNhomHang1, 
                g2.ID idGroup2, g2.TenNhomHang tenNhomHang2,
                g3.ID idGroup3, g3.TenNhomHang tenNhomHang3
                FROM tblHangHoaGroup1 as g1
                LEFT JOIN tblHangHoaGroup2 as g2
                ON g2.IDGroup1 = g1.ID
                LEFT JOIN tblHangHoaGroup3 as g3
                ON g3.IDGroup2 = g2.ID
                ) AS groups`
            var where = '';
            var offset = itemPerPage * (page - 1);
            if (body.searchKey) {
                where = `
                WHERE UPPER(groups.tenNhomHang1) like N'%`+ body.searchKey.toUpperCase().trim() + `%' 
            or UPPER(groups.tenNhomHang2) like N'%`+ body.searchKey.toUpperCase().trim() + `%' 
            or UPPER(groups.tenNhomHang3) like N'%`+ body.searchKey.toUpperCase().trim() + `%'`
            }
            var whereAndPage = where + ` 
            ORDER BY groups.idGroup1 ` + `OFFSET ` + offset + ` ROWS FETCH NEXT ` + itemPerPage + ` ROWS ONLY;`
            sql.close();
            var count;
            sql.connect(database.config, async function (err) {
                if (err) console.log(err);
                var request = new sql.Request();
                await request.query(query + where, function (err, recordset) {
                    if (err) console.log(err)
                    count = recordset.rowsAffected[0];
                })
                await request.query(query + whereAndPage, function (err, recordset) {
                    if (err) console.log(err)
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                        array: recordset.recordsets[0],
                        all: count,
                    }
                    res.json(result)
                })
            })

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
                                await createAndCheckGroup3(res, db, group2.ID, body)
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
                            await createAndCheckGroup3(res, db, group2.ID, body)

                        }
                    })
                } else {
                    if (body.idGroup3 === '-1') {
                        await createAndCheckGroup3(res, db, body.idGroup2, body)

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