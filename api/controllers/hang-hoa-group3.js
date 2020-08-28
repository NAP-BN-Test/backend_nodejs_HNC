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
    // add_goods_group3
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
                mtblHangHoaGroup3(db).update(update, { where: { ID: body.ID } }).then(() => {
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
                let listIDJson = body.listID;
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });
                await mtblHangHoaGroup3(db).destroy({
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
    // get_list_goods_group3
    getListGoodsGroup3: (req, res) => {
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
                        idGroup2: elm.IDGroup2 ? elm.IDGroup2 : '',
                        nameGroup1: elm.tblHangHoaGroup1 ? elm.tblHangHoaGroup1 : ''
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