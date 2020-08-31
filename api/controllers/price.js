const Result = require('../constants/result');
const Constant = require('../constants/constant');
const Op = require('sequelize').Op;
var database = require('../database');
var mSysUser = require('../tables/tblSysUser');
var mHangHoa = require('../tables/tblHangHoa');
var mtblLinkGetPrice = require('../tables/tblLinkGetPrice');
var mtblPrice = require('../tables/tblPrice');

async function deletetblPrice(db, listID) {
    await mtblPrice(db).destroy({
        where: {
            ID: { [Op.in]: listID },
        }
    });
}

module.exports = {
    deletetblPrice,
    // add_price
    addPrice: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {
            try {
                await mtblPrice(db).create({
                    IDLink: body.idLink ? body.idLink : null,
                    IDUserGet: body.idUserGet ? body.idUserGet : null,
                    Price: body.price ? body.price : '',
                    DateGet: body.dateGet ? body.dateGet : null,

                }).then(data => {
                    var obj = {
                        id: data.ID,
                        idLink: data.IDLink ? data.IDLink : null,
                        idUserGet: data.IDUserGet ? data.IDUserGet : null,
                        price: data.Price ? data.Price : '',
                        dateGet: data.DateGet ? data.DateGet : '',

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
    // update_price
    updatePrice: (req, res) => {
        let body = req.body;

        database.connectDatabase().then(async db => {
            try {
                let listUpdate = [];

                if (body.dateGet || body.dateGet === '') {
                    if (body.dateGet === '')
                        listUpdate.push({ key: 'DateGet', value: null });
                    if (body.dateGet)
                        listUpdate.push({ key: 'DateGet', value: body.dateGet });
                }

                if (body.price || body.price === '')
                    listUpdate.push({ key: 'Price', value: body.price });
                if (body.idLink || body.idLink === '') {
                    if (body.idLink === '')
                        listUpdate.push({ key: 'IDLink', value: null });
                    else
                        listUpdate.push({ key: 'IDLink', value: body.idLink });
                }
                if (body.idUserGet || body.idUserGet === '') {
                    if (body.idUserGet === '')
                        listUpdate.push({ key: 'IDUserGet', value: null });
                    else
                        listUpdate.push({ key: 'IDUserGet', value: body.idUserGet });
                }

                let update = {};
                for (let field of listUpdate) {
                    update[field.key] = field.value
                }
                mtblPrice(db).update(update, { where: { ID: body.id } }).then(() => {
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
    // delete_price
    deletePrice: (req, res) => {
        let body = req.body;

        database.connectDatabase().then(async db => {

            try {
                let listIDJson = JSON.parse(body.listID);
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });
                deletetblPrice(db, listID);
                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },
    // get_list_price
    getListPrice: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {

            var count = await mtblPrice(db).count();
            var array = [];
            var itemPerPage = 10000;
            var page = 1;
            if (body.itemPerPage) {
                itemPerPage = Number(body.itemPerPage);
                if (body.page)
                    page = Number(body.page);
            }
            await mtblPrice(db).findAll({
                include: [
                    {
                        model: mtblLinkGetPrice(db)
                    },

                ],
                order: [['ID', 'DESC']],
                offset: itemPerPage * (page - 1),
                limit: itemPerPage
            }).then(async data => {
                for (var i = 0; i < data.length; i++) {
                    let user = {};
                    if (data[i].IDUserGet)
                        user = await mSysUser(db).findOne({ where: { Id: data[i].IDUserGet } })
                    array.push({
                        id: data[i].ID,
                        dateGet: data[i].DateGet ? data[i].DateGet : '',
                        price: data[i].Price ? data[i].Price : '',
                        idUserGet: data[i].IDUserGet ? data[i].IDUserGet : '',
                        userGetName: user.Name ? user.Name : '',
                        idLink: data[i].IDLink ? data[i].IDLink : '',
                        nameLink: data[i].tblLinkGetPrice ? data[i].tblLinkGetPrice.LinkAddress : ''
                    })
                }
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