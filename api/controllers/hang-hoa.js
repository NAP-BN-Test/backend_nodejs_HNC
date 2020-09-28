const Result = require('../constants/result');
const Constant = require('../constants/constant');
const Op = require('sequelize').Op;
var database = require('../database');
var mSysUser = require('../tables/tblSysUser');
var mHangHoa = require('../tables/tblHangHoa');
const mtblHangHoaGroup1 = require('../tables/tblHangHoaGroup1')
const mtblHangHoaGroup2 = require('../tables/tblHangHoaGroup2')
const mtblHangHoaGroup3 = require('../tables/tblHangHoaGroup3')
var mtblLinkGetPrice = require('../tables/tblLinkGetPrice');
const apiLinkGetPrice = require('./link-get-price');
const mtblPrice = require('../tables/tblPrice');


async function getListIDLinkGetPrice(db, listID) {
    var listIDLinkPrice = await mtblLinkGetPrice(db).findAll({
        where: { IDHangHoa: { [Op.in]: listID } },
    })
    var list = [];
    listIDLinkPrice.forEach(item => {
        list.push(Number(item.ID))
    })
    return list;
}

async function deleteHangHoa(db, listID) {
    var list = await getListIDLinkGetPrice(db, listID);
    await apiLinkGetPrice.deletetblLinkGetPrice(db, list);
    mHangHoa(db).destroy({
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

async function checkGroup(db, idGroup1, idGroup2, idGroup3) {
    if (!idGroup1 && !idGroup2 && !idGroup3) return false
    if (!idGroup1) return false
    else if (idGroup2) {
        let check1 = await mtblHangHoaGroup2(db).findAll({ where: { IDGroup1: idGroup1 } })
        var array = [];
        check1.forEach(item => {
            array.push(item.ID);
        })
        if (checkIn(array, idGroup2)) {
            if (idGroup3) {
                let check2 = await mtblHangHoaGroup3(db).findAll({ where: { IDGroup2: idGroup2 } })
                var array = [];
                check2.forEach(item => {
                    array.push(item.ID);
                })
                if (checkIn(array, idGroup3)) {
                    return true
                }
                else return false
            }
            else return true
        }
        else return false
    }
    else if (idGroup3) return false
    else {
        return true
    }
}

async function funtionFindLinkGetPrice(db, id, listLink) {
    if (listLink.length > 0) {
        var linkOfGoods = await mtblLinkGetPrice(db).findAll({
            where: {
                [Op.and]: [
                    {
                        [Op.not]: {
                            EnumLoaiLink: listLink,
                        }
                    },
                    { IDHangHoa: id }

                ]
            }
        })
    }
    else {
        var linkOfGoods = await mtblLinkGetPrice(db).findAll({
            where: {
                [Op.and]: [
                    { IDHangHoa: id }

                ]
            }
        })
    }
    return linkOfGoods
}

module.exports = {
    checkGroup,
    deleteHangHoa,
    // add_goods : thêm hàng hóa
    addGoods: (req, res) => {
        let body = req.body;
        var link = JSON.parse(body.items);
        database.connectDatabase().then(async db => {
            try {
                let checkGroupExits = await checkGroup(db, body.idGroup1, body.idGroup2, body.idGroup3);
                if (body.code) {
                    var hangHoa = await mHangHoa(db).findAll({
                        where: { Code: body.code }
                    })
                    if (hangHoa.length > 0) {
                        var result = {
                            status: Constant.STATUS.FAIL,
                            message: 'Mã hàng trùng. Vui long kiểm tra lại!',
                        }
                        res.json(result);
                    }
                }
                if (body.part) {
                    var hangHoa = await mHangHoa(db).findAll({
                        where: { PART: body.part }
                    })
                    if (hangHoa.length > 0) {
                        var result = {
                            status: Constant.STATUS.FAIL,
                            message: 'PART trùng. Vui long kiểm tra lại!',
                        }
                        res.json(result);
                    }
                }
                if (checkGroupExits) {
                    await mHangHoa(db).create({
                        Code: body.code ? body.code : '',
                        NameHangHoa: body.nameHangHoa ? body.nameHangHoa : '',
                        DonViTinh: body.donViTinh ? body.donViTinh : '',
                        IntenalCode: body.intenalCode ? body.intenalCode : '',
                        FlagSelect: body.flagSelect ? body.flagSelect : '',
                        IDGroup1: body.idGroup1 ? body.idGroup1 : null,
                        IDGroup2: body.idGroup2 ? body.idGroup2 : null,
                        IDGroup3: body.idGroup3 ? body.idGroup3 : null,
                        PART: body.part ? body.part : null,
                    }).then(async data => {
                        for (var i = 0; i < link.length; i++) {
                            if (link[i].name !== '')
                                await mtblLinkGetPrice(db).create({
                                    IDHangHoa: data.ID,
                                    LinkAddress: link[i].link,
                                    Description: '',
                                    EnumLoaiLink: link[i].name.number,
                                })
                        }
                        var obj = {
                            id: data.ID,
                            code: data.Code ? data.Code : '',
                            nameHangHoa: data.NameHangHoa ? data.NameHangHoa : '',
                            donViTinh: data.DonViTinh ? data.DonViTinh : '',
                            intenalCode: data.IntenalCode ? data.IntenalCode : '',
                            flagSelect: data.FlagSelect ? data.FlagSelect : '',
                            idGroup1: data.IDGroup1 ? data.IDGroup1 : null,
                            idGroup2: data.IDGroup2 ? data.IDGroup2 : null,
                            idGroup3: data.IDGroup3 ? data.IDGroup3 : null,
                        }
                        var result = {
                            status: Constant.STATUS.SUCCESS,
                            message: Constant.MESSAGE.ACTION_SUCCESS,
                            obj: obj
                        }

                        res.json(result);
                    })
                }
                else {
                    var result = {
                        status: Constant.STATUS.FAIL,
                        message: 'Tạo bản ghi không hợp lệ. Vui lòng kiểm tra lại !',
                    }
                    res.json(result);
                }

            } catch (error) {
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
                let checkGroupExits = await checkGroup(db, body.idGroup1, body.idGroup2, body.idGroup3);
                if (!checkGroupExits) {
                    return res.json(Result.ERROR_DATA);
                }
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
                if (body.part || body.part === '')
                    listUpdate.push({ key: 'PART', value: body.part });
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
                if (body.items) {
                    var listObjLink = JSON.parse(body.items);
                    var listLink = [];
                    for (var i = 0; i < listObjLink.length; i++) {
                        listLink.push(listObjLink[i].name.number);
                        var link = await mtblLinkGetPrice(db).findAll({
                            where: {
                                [Op.and]: [
                                    { IDHangHoa: body.id },
                                    { EnumLoaiLink: listObjLink[i].name.number ? listObjLink[i].name.number : 0 }
                                ]
                            }
                        })
                        if (link.length > 0) {
                            await mtblLinkGetPrice(db).update({
                                LinkAddress: listObjLink[i].link ? listObjLink[i].link : '',
                            }, {
                                where: {
                                    [Op.and]: [
                                        { IDHangHoa: body.id },
                                        { EnumLoaiLink: listObjLink[i].name.number ? listObjLink[i].name.number : 0 }
                                    ]
                                }
                            })
                        } else {
                            await mtblLinkGetPrice(db).create({
                                IDHangHoa: body.id ? body.id : null,
                                LinkAddress: listObjLink[i].link ? listObjLink[i].link : '',
                                Description: '',
                                EnumLoaiLink: listObjLink[i].name.number ? listObjLink[i].name.number : '',
                            })
                        }
                    }
                    var linkOfGoods = await funtionFindLinkGetPrice(db, body.id, listLink);
                }
                else {
                    var linkOfGoods = await funtionFindLinkGetPrice(db, body.id, []);
                }
                var listLink = [];
                linkOfGoods.forEach(item => {
                    listLink.push(item.ID)
                })
                if (listLink.length > 0)
                    await apiLinkGetPrice.deletetblLinkGetPrice(db, listLink);
                mHangHoa(db).update(update, { where: { ID: body.id } }).then(() => {
                    res.json(Result.ACTION_SUCCESS)
                }).catch(() => {
                    res.json(Result.SYS_ERROR_RESULT);
                })
            } catch (error) {
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
                deleteHangHoa(db, listID);

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },
    // get_list_goods 
    getListGoods: (req, res) => {
        let body = req.body;
        console.log(body);
        database.connectDatabase().then(async db => {
            let where = {};
            let whereSearch = [];
            if (body.searchKey) {
                whereSearch = [
                    { NameHangHoa: { [Op.like]: '%' + body.searchKey + '%' } },
                    { Code: { [Op.like]: '%' + body.searchKey + '%' } },
                    { PART: { [Op.like]: '%' + body.searchKey + '%' } },
                ];
            } else {
                whereSearch = [
                    { NameHangHoa: { [Op.like]: '%' + '' + '%' } },
                ];
            }
            if (body.idGroup1) {
                where = {
                    [Op.or]: whereSearch,
                    [Op.and]: { IDGroup1: body.idGroup1 }
                }
            }
            if (body.idGroup2) {
                where = {
                    [Op.or]: whereSearch,
                    [Op.and]: { IDGroup2: body.idGroup2 }
                }
            }
            if (body.idGroup3) {
                where = {
                    [Op.or]: whereSearch,
                    [Op.and]: { IDGroup3: body.idGroup3 }
                }
            }
            var count = await mHangHoa(db).count({ where: where });
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
                    },
                    {
                        model: mtblLinkGetPrice(db)
                    }
                ],
                order: [['ID', 'DESC']],
                offset: itemPerPage * (page - 1),
                limit: itemPerPage
            }).then(data => {
                data.forEach(elm => {
                    let listLink = [];
                    if (elm.tblLinkGetPrices)
                        elm.tblLinkGetPrices.forEach(item => {
                            listLink.push({
                                id: item.ID,
                                idHangHoa: item.IDHangHoa,
                                linkAddress: item.LinkAddress,
                                description: item.Description,
                                enumLoaiLink: item.EnumLoaiLink,
                            });
                        })
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
                        part: elm.PART,
                        listLink: listLink,

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
    // get_detail_goods 
    getDetailGoods: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {
            await mHangHoa(db).findOne({
                where: { ID: body.id },
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
                    , {
                        model: mtblLinkGetPrice(db)
                    }
                ],
            }).then(data => {
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    obj: {
                        id: data.ID,
                        code: data.Code ? data.Code : '',
                        nameHangHoa: data.NameHangHoa ? data.NameHangHoa : '',
                        donViTinh: data.DonViTinh ? data.DonViTinh : '',
                        intenalCode: data.IntenalCode ? data.IntenalCode : '',
                        flagSelect: data.FlagSelect ? data.FlagSelect : '',
                        idGroup1: data.tblHangHoaGroup1 ? data.IDGroup1 : '',
                        nameGroup1: data.tblHangHoaGroup1 ? data.tblHangHoaGroup1.TenNhomHang : '',
                        idGroup2: data.tblHangHoaGroup2 ? data.IDGroup2 : '',
                        nameGroup2: data.tblHangHoaGroup2 ? data.tblHangHoaGroup2.TenNhomHang : '',
                        idGroup3: data.tblHangHoaGroup3 ? data.IDGroup3 : '',
                        nameGroup3: data.tblHangHoaGroup3 ? data.tblHangHoaGroup3.TenNhomHang : '',
                        part: data.PART,
                        listLink: data.mtblLinkGetPrices ? data.mtblLinkGetPrices : [],
                    },
                }
                res.json(result)
            })

        })
    },

}
