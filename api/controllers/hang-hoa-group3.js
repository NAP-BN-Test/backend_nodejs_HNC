const Result = require('../constants/result');
const Constant = require('../constants/constant');
const Op = require('sequelize').Op;
var database = require('../database');
var mSysUser = require('../tables/tblSysUser');
var mHangHoa = require('../tables/tblHangHoa');
const mtblHangHoaGroup1 = require('../tables/tblHangHoaGroup1')
const mtblHangHoaGroup2 = require('../tables/tblHangHoaGroup2')
const mtblHangHoaGroup3 = require('../tables/tblHangHoaGroup3');
let apiHangHoa = require('./hang-hoa');

async function getListHangHoa(db, listID) {
    var listIDHangHoa = await mHangHoa(db).findAll({
        where: { IDGroup3: { [Op.in]: listID } },
    })
    var list = [];
    listIDHangHoa.forEach(item => {
        list.push(Number(item.ID))
    })
    return list;
}

async function deletetblHangHoaGroup3(db, listID) {
    try {
        let list = await getListHangHoa(db, listID);
        await apiHangHoa.deleteHangHoa(db, list);
        await mtblHangHoaGroup3(db).destroy({
            where: {
                ID: { [Op.in]: listID },
            }
        });

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    // add_goods_group3
    deletetblHangHoaGroup3,
    addGoodsGroup3: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {
            try {
                await mtblHangHoaGroup3(db).create({
                    TenNhomHang: body.tenNhomHang ? body.tenNhomHang : '',
                    FlagSelect: body.flagSelect ? body.flagSelect : '',
                    IDGroup2: body.idGroup2 ? body.idGroup2 : '',

                }).then(data => {
                    var obj = {
                        id: data.ID,
                        tenNhomHang: data.TenNhomHang ? data.TenNhomHang : '',
                        flagSelect: data.FlagSelect ? data.FlagSelect : '',
                        idGroup2: data.IDGroup2 ? data.IDGroup2 : '',

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
    // update_goods_group3 : cập nhật hàng hóa
    updateGoodsGroup3: (req, res) => {
        let body = req.body;

        database.connectDatabase().then(async db => {
            try {
                let listUpdate = [];

                if (body.tenNhomHang || body.tenNhomHang === '')
                    listUpdate.push({ key: 'TenNhomHang', value: body.tenNhomHang });
                if (body.flagSelect)
                    listUpdate.push({ key: 'FlagSelect', value: body.flagSelect });
                if (body.idGroup2 || body.idGroup2 === '') {
                    if (body.idGroup2 === '')
                        listUpdate.push({ key: 'IDGroup2', value: null });
                    else
                        listUpdate.push({ key: 'IDGroup2', value: body.idGroup2 });
                }

                let update = {};
                for (let field of listUpdate) {
                    update[field.key] = field.value
                }
                mtblHangHoaGroup3(db).update(update, { where: { ID: body.id } }).then(() => {
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
    // delete_goods_group3
    deleteGoodsGroup3: (req, res) => {
        let body = req.body;

        database.connectDatabase().then(async db => {

            try {
                let listIDJson = JSON.parse(body.listID);
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });
                deletetblHangHoaGroup3(db, listID);

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },
    // get_list_goods_group3
    getListGoodsGroup3: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {
            let where = {};
            let whereSearch = [];
            if (body.searchKey) {
                if (body.idGroup2)
                    whereSearch = [
                        { TenNhomHang: { [Op.like]: '%' + body.searchKey + '%' } },
                        { IDGroup2: body.idGroup2 },
                    ];
                else
                    whereSearch = [
                        { TenNhomHang: { [Op.like]: '%' + body.searchKey + '%' } },
                    ];
            } else {
                if (body.idGroup2)
                    whereSearch = [
                        { TenNhomHang: { [Op.like]: '%' + '' + '%' } },
                        { IDGroup2: body.idGroup2 },
                    ];
                else
                    whereSearch = [
                        { TenNhomHang: { [Op.like]: '%' + '' + '%' } },
                    ];
            }
            where = {
                [Op.and]: whereSearch,
            }

            var count = await mtblHangHoaGroup3(db).count({ where: where });
            var array = [];
            var itemPerPage = 10000;
            var page = 1;
            if (body.itemPerPage) {
                itemPerPage = Number(body.itemPerPage);
                if (body.page)
                    page = Number(body.page);
            }
            await mtblHangHoaGroup3(db).findAll({
                where: where,
                include: [
                    {
                        model: mtblHangHoaGroup2(db)
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
                        idGroup2: elm.IDGroup2 ? elm.IDGroup2 : '',
                        nameGroup1: elm.tblHangHoaGroup2 ? elm.tblHangHoaGroup2 : ''
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