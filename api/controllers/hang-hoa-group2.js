const Result = require('../constants/result');
const Constant = require('../constants/constant');
const Op = require('sequelize').Op;
var database = require('../database');
var mSysUser = require('../tables/tblSysUser');
var mHangHoa = require('../tables/tblHangHoa');
const mtblHangHoaGroup1 = require('../tables/tblHangHoaGroup1')
const mtblHangHoaGroup2 = require('../tables/tblHangHoaGroup2')
const mtblHangHoaGroup3 = require('../tables/tblHangHoaGroup3')

module.exports = {
    // add_goods_group2
    addGoodsGroup2: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {
            try {
                await mtblHangHoaGroup2(db).create({
                    TenNhomHang: body.TenNhomHang ? body.TenNhomHang : '',
                    FlagSelect: body.FlagSelect ? body.FlagSelect : '',
                    IDGroup1: body.IDGroup1 ? body.IDGroup1 : '',

                }).then(data => {
                    var obj = {
                        ID: data.ID,
                        TenNhomHang: data.TenNhomHang ? data.TenNhomHang : '',
                        FlagSelect: data.FlagSelect ? data.FlagSelect : '',
                        IDGroup1: data.IDGroup1 ? data.IDGroup1 : '',

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

                if (body.TenNhomHang || body.TenNhomHang === '')
                    listUpdate.push({ key: 'TenNhomHang', value: body.TenNhomHang });
                if (body.FlagSelect)
                    listUpdate.push({ key: 'FlagSelect', value: body.FlagSelect });
                if (body.IDGroup1 || body.IDGroup1 === '') {
                    if (body.IDGroup1 === '')
                        listUpdate.push({ key: 'IDGroup1', value: null });
                    else
                        listUpdate.push({ key: 'IDGroup1', value: body.IDGroup1 });
                }

                let update = {};
                for (let field of listUpdate) {
                    update[field.key] = field.value
                }
                mtblHangHoaGroup2(db).update(update, { where: { ID: body.ID } }).then(() => {
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
                let listIDJson = body.listID;
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });
                await mtblHangHoaGroup2(db).destroy({
                    where: {
                        ID: { [Op.in]: listID },
                    }
                });

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
                whereSearch = [
                    { TenNhomHang: { [Op.like]: '%' + body.searchKey + '%' } },
                ];
            } else {
                whereSearch = [
                    { TenNhomHang: { [Op.like]: '%' + '' + '%' } },
                ];
            }
            where = {
                [Op.or]: whereSearch,
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
                        ID: elm.ID,
                        TenNhomHang: elm.TenNhomHang ? elm.TenNhomHang : '',
                        FlagSelect: elm.FlagSelect ? elm.FlagSelect : '',
                        IDGroup1: elm.IDGroup1 ? elm.IDGroup1 : '',
                        NameGroup1: elm.tblHangHoaGroup1 ? elm.tblHangHoaGroup1 : ''
                    })
                })
            })

            var result = {
                status: Constant.STATUS.SUCCESS,
                message: '',
                array: array,
                count: count,
            }
            res.json(result)
        })
    }
}