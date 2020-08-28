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
                await mtblHangHoaGroup1(db).destroy({
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
                [Op.or]: whereSearch,
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
                count: count,
            }
            res.json(result)
        })
    }
}