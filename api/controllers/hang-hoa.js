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

                if (body.code || body.code === '')
                    listUpdate.push({ key: 'Code', value: body.code });
                if (body.nameHangHoa || body.nameHangHoa === '')
                    listUpdate.push({ key: 'NameHangHoa', value: body.nameHangHoa });
                if (body.donViTinh || body.donViTinh === '')
                    listUpdate.push({ key: 'DonViTinh', value: body.donViTinh });
                if (body.intenalCode || body.intenalCode === '')
                    listUpdate.push({ key: 'IntenalCode', value: body.intenalCode });
                if (body.flagSelect || body.flagSelect === '')
                    listUpdate.push({ key: 'FlagSelect', value: body.flagSelect });
                if (body.idGroup1 || body.idGroup1 === '') {
                    if (body.idGroup1 === '')
                        listUpdate.push({ key: 'IDGroup1', value: null });
                    else
                        listUpdate.push({ key: 'IDGroup1', value: body.idGroup1 });

                }
                if (body.idGroup2 || body.idGroup2 === '')
                    if (body.idGroup2 === '')
                        listUpdate.push({ key: 'IDGroup2', value: null });
                    else
                        listUpdate.push({ key: 'IDGroup2', value: body.idGroup2 });
                if (body.idGroup3 || body.idGroup3 === '')
                    if (body.idGroup3 === '')
                        listUpdate.push({ key: 'IDGroup3', value: null });
                    else
                        listUpdate.push({ key: 'IDGroup3', value: body.idGroup3 });

                let update = {};
                for (let field of listUpdate) {
                    update[field.key] = field.value
                }
                mHangHoa(db).update(update, { where: { ID: body.id } }).then(() => {
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
                        id: elm.ID,
                        code: elm.Code ? elm.Code : '',
                        nameHangHoa: elm.NameHangHoa ? elm.NameHangHoa : '',
                        donViTinh: elm.DonViTinh ? elm.DonViTinh : '',
                        intenalCode: elm.IntenalCode ? elm.IntenalCode : '',
                        flagSelect: elm.FlagSelect ? elm.FlagSelect : '',
                        idGroup1: elm.tblHangHoaGroup1 ? elm.IDGroup1 : '',
                        nameGroup1: elm.tblHangHoaGroup1 ? elm.tblHangHoaGroup1.TenNhomHang : '',
                        idGroup2: elm.tblHangHoaGroup2 ? elm.IDGroup2 : '',
                        nameGroup2: elm.tblHangHoaGroup2 ? elm.tblHangHoaGroup2.TenNhomHang : '',
                        idGroup3: elm.tblHangHoaGroup3 ? elm.IDGroup3 : '',
                        nameGroup3: elm.tblHangHoaGroup3 ? elm.tblHangHoaGroup3.TenNhomHang : '',
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
