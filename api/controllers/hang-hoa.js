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
    // add_goods : thêm hàng hóa
    addGoods: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {
            try {
                await mHangHoa(db).create({
                    Code: body.Code ? body.Code : '',
                    NameHangHoa: body.NameHangHoa ? body.NameHangHoa : '',
                    DonViTinh: body.DonViTinh ? body.DonViTinh : '',
                    IntenalCode: body.IntenalCode ? body.IntenalCode : '',
                    FlagSelect: body.FlagSelect ? body.FlagSelect : '',
                    IDGroup1: body.IDGroup1 ? body.IDGroup1 : null,
                    IDGroup2: body.IDGroup2 ? body.IDGroup2 : null,
                    IDGroup3: body.IDGroup3 ? body.IDGroup3 : null,
                }).then(data => {
                    var obj = {
                        ID: data.ID,
                        Code: data.Code ? data.Code : '',
                        NameHangHoa: data.NameHangHoa ? data.NameHangHoa : '',
                        DonViTinh: data.DonViTinh ? data.DonViTinh : '',
                        IntenalCode: data.IntenalCode ? data.IntenalCode : '',
                        FlagSelect: data.FlagSelect ? data.FlagSelect : '',
                        IDGroup1: data.IDGroup1 ? data.IDGroup1 : null,
                        IDGroup2: data.IDGroup2 ? data.IDGroup2 : null,
                        IDGroup3: data.IDGroup3 ? data.IDGroup3 : null,
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
    // update_goods : cập nhật hàng hóa
    updateGoods: (req, res) => {
        let body = req.body;

        database.connectDatabase().then(async db => {
            try {
                let listUpdate = [];

                if (body.Code || body.Code === '')
                    listUpdate.push({ key: 'Code', value: body.Code });
                if (body.NameHangHoa || body.NameHangHoa === '')
                    listUpdate.push({ key: 'NameHangHoa', value: body.NameHangHoa });
                if (body.DonViTinh || body.DonViTinh === '')
                    listUpdate.push({ key: 'DonViTinh', value: body.DonViTinh });
                if (body.IntenalCode || body.IntenalCode === '')
                    listUpdate.push({ key: 'IntenalCode', value: body.IntenalCode });
                if (body.FlagSelect || body.FlagSelect === '')
                    listUpdate.push({ key: 'FlagSelect', value: body.FlagSelect });
                if (body.IDGroup1 || body.IDGroup1 === '') {
                    if (body.IDGroup1 === '')
                        listUpdate.push({ key: 'IDGroup1', value: null });
                    else
                        listUpdate.push({ key: 'IDGroup1', value: body.IDGroup1 });

                }
                if (body.IDGroup2 || body.IDGroup2 === '')
                    if (body.IDGroup2 === '')
                        listUpdate.push({ key: 'IDGroup2', value: null });
                    else
                        listUpdate.push({ key: 'IDGroup2', value: body.IDGroup2 });
                if (body.IDGroup3 || body.IDGroup3 === '')
                    if (body.IDGroup3 === '')
                        listUpdate.push({ key: 'IDGroup3', value: null });
                    else
                        listUpdate.push({ key: 'IDGroup3', value: body.IDGroup3 });

                let update = {};
                for (let field of listUpdate) {
                    update[field.key] = field.value
                }
                mHangHoa(db).update(update, { where: { ID: body.ID } }).then(() => {
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
    // delete_goods : xóa hàng hóa
    deleteGoods: (req, res) => {
        let body = req.body;

        database.connectDatabase().then(async db => {

            try {
                let listIDJson = JSON.parse(body.listID);
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });
                mHangHoa(db).destroy({
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
    // get_list_goods 
    getListGoods: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {
            let where = {};
            let whereSearch = [];
            if (body.searchKey) {
                whereSearch = [
                    { NameHangHoa: { [Op.like]: '%' + body.searchKey + '%' } },
                    { Code: { [Op.like]: '%' + body.searchKey + '%' } }
                ];
            } else {
                whereSearch = [
                    { NameHangHoa: { [Op.like]: '%' + '' + '%' } },
                ];
            }
            where = {
                [Op.or]: whereSearch,
            }

            var count = await mHangHoa(db).count({ where: where });
            console.log(where);
            var array = [];
            var itemPerPage = 10000;
            var page = 1;
            if (body.itemPerPage) {
                itemPerPage = Number(body.itemPerPage);
                if (body.page)
                    page = Number(body.page);
            }
            await mHangHoa(db).findAll({
                where: where,
                include: [
                    {
                        model: mtblHangHoaGroup1(db)
                    },
                    {
                        model: mtblHangHoaGroup2(db)
                    },
                    {
                        model: mtblHangHoaGroup3(db)
                    }
                ],
                order: [['ID', 'DESC']],
                offset: itemPerPage * (page - 1),
                limit: itemPerPage
            }).then(data => {
                data.forEach(elm => {
                    array.push({
                        ID: elm.ID,
                        Code: elm.Code ? elm.Code : '',
                        NameHangHoa: elm.NameHangHoa ? elm.NameHangHoa : '',
                        DonViTinh: elm.DonViTinh ? elm.DonViTinh : '',
                        IntenalCode: elm.IntenalCode ? elm.IntenalCode : '',
                        FlagSelect: elm.FlagSelect ? elm.FlagSelect : '',
                        IDGroup1: elm.tblHangHoaGroup1 ? elm.IDGroup1 : '',
                        NameGroup1: elm.tblHangHoaGroup1 ? elm.tblHangHoaGroup1.TenNhomHang : '',
                        IDGroup2: elm.tblHangHoaGroup2 ? elm.IDGroup2 : '',
                        NameGroup2: elm.tblHangHoaGroup2 ? elm.tblHangHoaGroup2.TenNhomHang : '',
                        IDGroup3: elm.tblHangHoaGroup3 ? elm.IDGroup3 : '',
                        NameGroup3: elm.tblHangHoaGroup3 ? elm.tblHangHoaGroup3.TenNhomHang : '',
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
