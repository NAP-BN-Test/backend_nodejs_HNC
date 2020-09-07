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
let apiHangHoaGroup3 = require('./hang-hoa-group3');

async function getListHangHoa(db, listID) {
    var listIDHangHoa = await mHangHoa(db).findAll({
        where: { IDGroup2: { [Op.in]: listID } },
    })
    var list = [];
    listIDHangHoa.forEach(item => {
        list.push(Number(item.ID))
    })
    return list;
}

async function getListHangHoaGroup3(db, listID) {
    var listIDHangHoaGroup3 = await mtblHangHoaGroup3(db).findAll({
        where: { IDGroup2: { [Op.in]: listID } },
    })
    var list = [];
    listIDHangHoaGroup3.forEach(item => {
        list.push(Number(item.ID))
    })
    return list;
}

async function deleteHangHoaGroup2(db, listID) {
    let list = await getListHangHoa(db, listID);
    let listGroup3 = await getListHangHoaGroup3(db, listID);
    await apiHangHoa.deleteHangHoa(db, list);
    await apiHangHoaGroup3.deletetblHangHoaGroup3(db, listGroup3);
    await mtblHangHoaGroup2(db).destroy({
        where: {
            ID: { [Op.in]: listID },
        }
    });
}

module.exports = {
    deleteHangHoaGroup2,
    // add_goods_group2
    addGoodsGroup2: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {
            try {
                await mtblHangHoaGroup2(db).create({
                    TenNhomHang: body.tenNhomHang ? body.tenNhomHang : '',
                    FlagSelect: body.flagSelect ? body.flagSelect : '',
                    IDGroup1: body.idGroup1 ? body.idGroup1 : '',

                }).then(data => {
                    var obj = {
                        id: data.ID,
                        tenNhomHang: data.TenNhomHang ? data.TenNhomHang : '',
                        flagSelect: data.FlagSelect ? data.FlagSelect : '',
                        idGroup1: data.IDGroup1 ? data.IDGroup1 : '',

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
    // update_goods_group2 : cập nhật hàng hóa
    updateGoodsGroup2: (req, res) => {
        let body = req.body;

        database.connectDatabase().then(async db => {
            try {
                let listUpdate = [];

                if (body.tenNhomHang || body.tenNhomHang === '')
                    listUpdate.push({ key: 'TenNhomHang', value: body.tenNhomHang });
                if (body.flagSelect)
                    listUpdate.push({ key: 'FlagSelect', value: body.flagSelect });
                if (body.idGroup1 || body.idGroup1 === '') {
                    if (body.idGroup1 === '')
                        listUpdate.push({ key: 'IDGroup1', value: null });
                    else
                        listUpdate.push({ key: 'IDGroup1', value: body.idGroup1 });
                }

                let update = {};
                for (let field of listUpdate) {
                    update[field.key] = field.value
                }
                mtblHangHoaGroup2(db).update(update, { where: { ID: body.id } }).then(() => {
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
    // delete_goods_group2
    deleteGoodsGroup2: (req, res) => {
        let body = req.body;

        database.connectDatabase().then(async db => {

            try {
                let listIDJson = JSON.parse(body.listID);
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });
                await deleteHangHoaGroup2(db, listID);

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },
    // get_list_goods_group2
    getListGoodsGroup2: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {
            let where = {};
            let whereSearch = [];
            if (body.searchKey) {
                if (body.idGroup1)
                    whereSearch = [
                        { TenNhomHang: { [Op.like]: '%' + body.searchKey + '%' } },
                        { IDGroup1: body.idGroup1 },
                    ];
                else
                    whereSearch = [
                        { TenNhomHang: { [Op.like]: '%' + body.searchKey + '%' } },
                    ];
            } else {
                if (body.idGroup1)
                    whereSearch = [
                        { TenNhomHang: { [Op.like]: '%' + '' + '%' } },
                        { IDGroup1: body.idGroup1 },
                    ];
                else
                    whereSearch = [
                        { TenNhomHang: { [Op.like]: '%' + '' + '%' } },
                    ];
            }
            where = {
                [Op.and]: whereSearch,
            }
            var count = await mtblHangHoaGroup2(db).count({ where: where });
            var array = [];
            var itemPerPage = 10000;
            var page = 1;
            if (body.itemPerPage) {
                itemPerPage = Number(body.itemPerPage);
                if (body.page)
                    page = Number(body.page);
            }
            await mtblHangHoaGroup2(db).findAll({
                where: where,
                include: [
                    {
                        model: mtblHangHoaGroup1(db)
                    },
                ],
                order: [['ID', 'DESC']],
                offset: itemPerPage * (page - 1),
                limit: itemPerPage
            }).then(data => {
                data.forEach(elm => {
                    array.push({
                        id: elm.ID,
                        tenNhomHang: elm.TenNhomHang ? elm.TenNhomHang : '',
                        flagSelect: elm.FlagSelect ? elm.FlagSelect : '',
                        idGroup1: elm.IDGroup1 ? elm.IDGroup1 : '',
                        nameGroup1: elm.tblHangHoaGroup1 ? elm.tblHangHoaGroup1 : ''
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
    }
}