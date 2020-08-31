const Result = require('../constants/result');
const Constant = require('../constants/constant');
const Op = require('sequelize').Op;
var database = require('../database');
var mSysUser = require('../tables/tblSysUser');
var mHangHoa = require('../tables/tblHangHoa');
var mtblLinkGetPrice = require('../tables/tblLinkGetPrice');
var mtblPrice = require('../tables/tblPrice');
var apiPrice = require('./price');

async function getListIDPrice(db, listID) {
    var listIDPrice = await mtblPrice(db).findAll({
        where: { IDLink: { [Op.in]: listID } },
    })
    var list = [];
    listIDPrice.forEach(item => {
        list.push(Number(item.ID))
    })
    return list;
}

async function deletetblLinkGetPrice(db, listID) {
    var list = await getListIDPrice(db, listID);
    apiPrice.deletetblPrice(db, list);
    try {
        await mtblLinkGetPrice(db).destroy({
            where: {
                ID: { [Op.in]: listID },
            }
        });
    } catch (error) {
        console.log('err: ' + error);
    }
}

module.exports = {
    deletetblLinkGetPrice,
    // add_link_get_price
    addLinkGetPrice: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {
            try {
                await mtblLinkGetPrice(db).create({
                    IDHangHoa: body.idHangHoa ? body.idHangHoa : null,
                    LinkAddress: body.linkAddress ? body.linkAddress : '',
                    Description: body.description ? body.description : '',
                    EnumLoaiLink: body.enumLoaiLink ? body.enumLoaiLink : '',

                }).then(data => {
                    var obj = {
                        id: data.ID,
                        linkAddress: data.LinkAddress ? data.LinkAddress : '',
                        idHangHoa: data.IDHangHoa ? data.IDHangHoa : '',
                        description: data.Description ? data.Description : '',
                        enumLoaiLink: data.EnumLoaiLink ? data.EnumLoaiLink : '',

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
    // update_link_get_price
    updateLinkGetPrice: (req, res) => {
        let body = req.body;

        database.connectDatabase().then(async db => {
            try {
                let listUpdate = [];

                if (body.enumLoaiLink || body.enumLoaiLink === '')
                    listUpdate.push({ key: 'EnumLoaiLink', value: body.enumLoaiLink });
                if (body.description || body.description === '')
                    listUpdate.push({ key: 'Description', value: body.description });
                if (body.linkAddress || body.linkAddress === '')
                    listUpdate.push({ key: 'LinkAddress', value: body.linkAddress });
                if (body.idHangHoa || body.idHangHoa === '') {
                    if (body.idHangHoa === '')
                        listUpdate.push({ key: 'IDHangHoa', value: null });
                    else
                        listUpdate.push({ key: 'IDHangHoa', value: body.idHangHoa });
                }

                let update = {};
                for (let field of listUpdate) {
                    update[field.key] = field.value
                }
                mtblLinkGetPrice(db).update(update, { where: { ID: body.id } }).then(() => {
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
    // delete_link_get_price
    deleteLinkGetPrice: (req, res) => {
        let body = req.body;

        database.connectDatabase().then(async db => {

            try {
                let listIDJson = JSON.parse(body.listID);
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });
                deletetblLinkGetPrice(db, listID);
                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },
    // get_list_link_get_price
    getListLinkGetPrice: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {
            var count = await mtblLinkGetPrice(db).count();
            var array = [];
            var itemPerPage = 10000;
            var page = 1;
            if (body.itemPerPage) {
                itemPerPage = Number(body.itemPerPage);
                if (body.page)
                    page = Number(body.page);
            }
            await mtblLinkGetPrice(db).findAll({
                include: [
                    {
                        model: mtblPrice(db),
                        required: false
                    },
                    {
                        model: mHangHoa(db)
                    },
                ],
                order: [['ID', 'DESC']],
                offset: itemPerPage * (page - 1),
                limit: itemPerPage
            }).then(data => {
                data.forEach(elm => {
                    var Prices;
                    if (elm.tblPrices[0])
                        Prices = elm.tblPrices[0].dataValues.Price;
                    array.push({
                        id: elm.ID,
                        linkAddress: elm.LinkAddress ? elm.LinkAddress : '',
                        idHangHoa: elm.IDHangHoa ? elm.IDHangHoa : '',
                        nameHangHoa: elm.tblHangHoa ? elm.tblHangHoa.Code : '',
                        description: elm.Description ? elm.Description : '',
                        enumLoaiLink: elm.EnumLoaiLink ? elm.EnumLoaiLink : '',
                        price: Prices ? Prices : '',
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