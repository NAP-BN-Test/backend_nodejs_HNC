const Result = require('../constants/result');
const Constant = require('../constants/constant');
const Op = require('sequelize').Op;
const FormData = require("form-data");
var moment = require('moment');
var database = require('../database');
var mSysUser = require('../tables/tblSysUser');
var mHangHoa = require('../tables/tblHangHoa');
const mtblHangHoaGroup1 = require('../tables/tblHangHoaGroup1')
const mtblHangHoaGroup2 = require('../tables/tblHangHoaGroup2')
const mtblHangHoaGroup3 = require('../tables/tblHangHoaGroup3')
var mtblPrice = require('../tables/tblPrice');
const bodyParser = require('body-parser');
var mtblLinkGetPrice = require('../tables/tblLinkGetPrice');
const Sequelize = require('sequelize');
const axios = require('axios');
function filterArray(value, array) {
    var check = false;
    if (array.length > 0) {
        array.forEach(item => {
            if (item === value) {
                check = true;
            }
        })
    }
    return check

}
function countDulicant(array_elements) {
    var array = [];
    for (var i = 0; i < array_elements.length; i++) {
        if (!filterArray(array_elements[i], array)) {
            array.push(array_elements[i])
        }
    }
    return array.length;

}
module.exports = {
    // search_goods
    functionSearchGoods: async (req, res) => {
        let body = req.body;
        let where = {};
        let whereSearch = [];
        if (body.goodsKey) {
            whereSearch = [
                { NameHangHoa: { [Op.like]: '%' + body.goodsKey + '%' } },
                { Code: { [Op.like]: '%' + body.goodsKey + '%' } },
                { PART: { [Op.like]: '%' + body.goodsKey + '%' } },
            ];
        } else {
            whereSearch = [
                { NameHangHoa: { [Op.like]: '%' + '' + '%' } },
            ];
        }
        var itemPerPage = 100000000;
        var page = 1;
        if (body.itemPerPage) {
            itemPerPage = Number(body.itemPerPage);
            if (body.page)
                page = Number(body.page);
        }
        database.connectDatabase().then(async db => {
            var whereSearchGroup = [];
            if (body.groupKey) {
                var gr1 = await mtblHangHoaGroup1(db).findAll({
                    where: {
                        [Op.or]: [
                            { TenNhomHang: { [Op.like]: '%' + body.groupKey + '%' } },
                        ]
                    }
                })

                var gr2 = await mtblHangHoaGroup2(db).findAll({
                    where: {
                        [Op.or]: [
                            { TenNhomHang: { [Op.like]: '%' + body.groupKey + '%' } },
                        ]
                    }
                })
                var gr3 = await mtblHangHoaGroup3(db).findAll({
                    where: {
                        [Op.or]: [
                            { TenNhomHang: { [Op.like]: '%' + body.groupKey + '%' } },
                        ]
                    }
                })
                var idGroup = [];
                gr1.forEach(item => {
                    idGroup.push(item.ID);
                })
                gr2.forEach(item => {
                    idGroup.push(item.ID);
                })
                gr3.forEach(item => {
                    idGroup.push(item.ID);
                })
                whereSearchGroup.push({ IDGroup1: { [Op.in]: idGroup } },)
                whereSearchGroup.push({ IDGroup2: { [Op.in]: idGroup } },)
                whereSearchGroup.push({ IDGroup3: { [Op.in]: idGroup } },)
            } else {
                whereSearchGroup.push({ Code: { [Op.like]: '%' + '' + '%' } },)
            }
            where = {
                [Op.or]: whereSearch,
                [Op.and]: {
                    [Op.or]: whereSearchGroup
                },
            }
            var array = [];
            var count = await mHangHoa(db).count({ where: where })
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
                for (var i = 0; i < data.length; i++) {
                    array.push({
                        stt: Number(i) + 1,
                        idGroup1: data[i].tblHangHoaGroup1 ? data[i].IDGroup1 : '',
                        tenNhomHang1: data[i].tblHangHoaGroup1 ? data[i].tblHangHoaGroup1.TenNhomHang : '',
                        idGroup2: data[i].tblHangHoaGroup2 ? data[i].IDGroup2 : '',
                        tenNhomHang2: data[i].tblHangHoaGroup2 ? data[i].tblHangHoaGroup2.TenNhomHang : '',
                        idGroup3: data[i].tblHangHoaGroup3 ? data[i].IDGroup3 : '',
                        tenNhomHang3: data[i].tblHangHoaGroup3 ? data[i].tblHangHoaGroup3.TenNhomHang : '',
                        part: data[i].PART,
                        nameGoods: data[i].NameHangHoa,
                        idHangHoa: data[i].ID,
                        code: data[i].Code
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
    },
    // scan_price
    functionScanPrice: async (req, res) => {
        let body = req.body;
        var data = JSON.parse(body.data);
        var array = data;
        database.connectDatabase().then(async db => {
            var n4 = {};
            var n3 = {};
            var n2 = {};
            var n1 = {};
            var n0 = {};
            var c1 = 0;
            var c2 = 0;
            var c3 = 0;
            var c4 = 0;
            var c0 = 0;
            for (var i = 0; i < data.length; i++) {
                if (array[i].idHangHoa) {
                    var link = await mtblLinkGetPrice(db).findAll({
                        where: { IDHangHoa: data[i].idHangHoa }
                    })
                    for (var j = 0; j < link.length; j++) {
                        if (link[j].EnumLoaiLink === 4) {
                            n4[c4] = {
                                code: data[i].code,
                                url: link[j].LinkAddress
                            }
                            c4 += 1;
                        }
                        if (link[j].EnumLoaiLink === 3) {

                            n3[c3] = {
                                code: data[i].code,
                                url: link[j].LinkAddress
                            }
                            c3 += 1
                        }
                        if (link[j].EnumLoaiLink === 2) {

                            n2[c2] = {
                                code: data[i].code,
                                url: link[j].LinkAddress
                            }
                            c2 += 1;
                        }
                        if (link[j].EnumLoaiLink === 1) {

                            n1[c1] = {
                                code: data[i].code,
                                url: link[j].LinkAddress
                            }
                            c1 += 1;
                        }
                        if (link[j].EnumLoaiLink === 0) {

                            n0[c0] = {
                                code: data[i].code,
                                url: link[j].LinkAddress
                            }
                            c0 += 1;
                        }
                    }
                }
            }
            var goods = []
            await axios.post(`http://163.44.192.123:5000/get_prices_hnc`, n4).then(data => {
                if (data.data.result)

                    data.data.result.forEach(item => {
                        goods.push({
                            key: item.key,
                            code: item.code,
                            price: item.price,
                        })
                    })
            })
            await axios.post(`http://163.44.192.123:5000/get_prices_pv`, n0).then(data => {
                if (data.data.result)
                    data.data.result.forEach(item => {
                        goods.push({
                            key: item.key,
                            code: item.code,
                            price: item.price,
                        })
                    })
            })
            await axios.post(`http://163.44.192.123:5000/get_prices_ap`, n1).then(data => {
                if (data.data.result)

                    data.data.result.forEach(item => {
                        goods.push({
                            key: item.key,
                            code: item.code,
                            price: item.price,
                        })
                    })
            })
            await axios.post(`http://163.44.192.123:5000/get_prices_pa`, n2).then(data => {
                if (data.data.result)

                    data.data.result.forEach(item => {
                        goods.push({
                            key: item.key,
                            code: item.code,
                            price: item.price,
                        })
                    })
            })
            await axios.post(`http://163.44.192.123:5000/get_prices_gvn`, n3).then(data => {
                if (data.data.result)

                    data.data.result.forEach(item => {
                        goods.push({
                            key: item.key,
                            code: item.code,
                            price: item.price,
                        })
                    })
            })
            for (var i = 0; i < data.length; i++) {
                array[i]['priceHNC'] = 0;
                array[i]['priceGearVN'] = 0;
                array[i]['pricePhucAnh'] = 0;
                array[i]['priceAnPhat'] = 0;
                array[i]['pricePhongVu'] = 0;
                for (var j = 0; j < goods.length; j++) {
                    if (goods[j].key == 4) {
                        if (data[i].code == goods[j].key.code)
                            array[i]['priceHNC'] = goods[j].price;
                    }
                    if (goods[j].key == 3) {
                        if (data[i].code == goods[j].key.code)
                            array[i]['priceGearVN'] = goods[j].price;
                    }
                    if (goods[j].key == 2) {
                        if (data[i].code == goods[j].key.code)
                            array[i]['pricePhucAnh'] = goods[j].price;
                    }
                    if (goods[j].key == 1) {
                        if (data[i].code == goods[j].key.code)
                            array[i]['priceAnPhat'] = goods[j].price;
                    }
                    if (goods[j].key == 0) {
                        if (data[i].code == goods[j].key.code)
                            array[i]['pricePhongVu'] = goods[j].price;
                    }
                }
            }
            var result = {
                status: Constant.STATUS.SUCCESS,
                message: '',
                array: array,
            }
            console.log(array);
            res.json(result)
        })








        //             if (link[j].EnumLoaiLink === 4) {
        //                 let body1 = {
        //                     1: {
        //                         code: 1,
        //                         url: link[j].LinkAddress,
        //                     },
        //                     2: {
        //                         code: 2,
        //                         url: link[j].LinkAddress,
        //                     }85

        //                 }
        //                 await axios.post(`http://163.44.192.123:5000/get_prices_hnc`, body1)
        //                     .then(async (res) => {
        //                         var price;
        //                         if (res.data.price != 0) {
        //                             price = res.data.price.replace(/,/g, '')
        //                         }
        //                         else {
        //                             price = 0
        //                         }
        //                         array[i]['priceHNC'] = price;
        //                         var pricedb = await mtblPrice(db).findOne({
        //                             order: [
        //                                 Sequelize.fn('max', Sequelize.col('DateGet')),
        //                             ],
        //                             group: ['IDLink', 'Price', 'ID', 'IDUserGet', 'DateGet'],
        //                         })
        //                         if (pricedb) {
        //                             if (pricedb.Price != price) {

        //                                 await mtblPrice(db).create({
        //                                     IDLink: link[j].ID,
        //                                     Price: Number(price),
        //                                 })
        //                             }
        //                         } else {
        //                             await mtblPrice(db).create({
        //                                 IDLink: link[j].ID,
        //                                 Price: Number(price),
        //                             })
        //                         }
        //                     })
        //                     .catch(err => console.log(err))
        //             }
        //             else if (link[j].EnumLoaiLink === 3) {
        //                 let body = {
        //                     url: link[j].LinkAddress,
        //                 }
        //                 await axios.post(`http://163.44.192.123:5000/get_prices_gvn`, body)
        //                     .then(async (res) => {
        //                         var price;
        //                         if (res.data.price != 0) {
        //                             price = res.data.price.replace(/,/g, '')
        //                         }
        //                         else {
        //                             price = 0
        //                         }
        //                         array[i]['priceGearVN'] = price;
        //                         var pricedb = await mtblPrice(db).findOne({
        //                             order: [
        //                                 Sequelize.fn('max', Sequelize.col('DateGet')),
        //                             ],
        //                             group: ['IDLink', 'Price', 'ID', 'IDUserGet', 'DateGet'],
        //                         })
        //                         if (pricedb) {
        //                             if (pricedb.Price != price) {
        //                                 await mtblPrice(db).create({
        //                                     IDLink: link[j].ID,
        //                                     Price: Number(price),
        //                                 })
        //                             }
        //                         }
        //                         else {
        //                             await mtblPrice(db).create({
        //                                 IDLink: link[j].ID,
        //                                 Price: Number(price),
        //                             })
        //                         }


        //                     })
        //                     .catch(err => console.log(err))
        //             }
        //             else if (link[j].EnumLoaiLink === 2) {
        //                 let body = {
        //                     url: link[j].LinkAddress,
        //                 }
        //                 await axios.post(`http://163.44.192.123:5000/get_prices_pa`, body)
        //                     .then(async (res) => {
        //                         var price;
        //                         if (res.data.price != 0) {
        //                             price = res.data.price.replace(/,/g, '')
        //                         }
        //                         else {
        //                             price = 0
        //                         }
        //                         array[i]['pricePhucAnh'] = price;
        //                         var pricedb = await mtblPrice(db).findOne({
        //                             order: [
        //                                 Sequelize.fn('max', Sequelize.col('DateGet')),
        //                             ],
        //                             group: ['IDLink', 'Price', 'ID', 'IDUserGet', 'DateGet'],
        //                         })
        //                         if (pricedb) {
        //                             if (pricedb.Price != price) {
        //                                 await mtblPrice(db).create({
        //                                     IDLink: link[j].ID,
        //                                     Price: Number(price),

        //                                 })
        //                             }
        //                         } else {
        //                             await mtblPrice(db).create({
        //                                 IDLink: link[j].ID,
        //                                 Price: Number(price),

        //                             })
        //                         }

        //                     })
        //                     .catch(err => console.log(err))
        //             }
        //             else if (link[j].EnumLoaiLink === 1) {
        //                 let body = {
        //                     url: link[j].LinkAddress,
        //                 }
        //                 await axios.post(`http://163.44.192.123:5000/get_prices_ap`, body)
        //                     .then(async (res) => {
        //                         var price;
        //                         if (res.data.price != 0) {
        //                             price = res.data.price.replace(/,/g, '')
        //                         }
        //                         else {
        //                             price = 0
        //                         }
        //                         array[i]['priceAnPhat'] = price;
        //                         var pricedb = await mtblPrice(db).findOne({
        //                             order: [
        //                                 Sequelize.fn('max', Sequelize.col('DateGet')),
        //                             ],
        //                             group: ['IDLink', 'Price', 'ID', 'IDUserGet', 'DateGet'],
        //                         })
        //                         if (pricedb) {
        //                             if (pricedb.Price != price) {
        //                                 await mtblPrice(db).create({
        //                                     IDLink: link[j].ID,
        //                                     Price: Number(price),
        //                                 })
        //                             }
        //                         } else {
        //                             await mtblPrice(db).create({
        //                                 IDLink: link[j].ID,
        //                                 Price: Number(price),
        //                             })
        //                         }
        //                     })
        //                     .catch(err => console.log(err))
        //             }
        //             else if (link[j].EnumLoaiLink === 0) {
        //                 let body = {
        //                     url: link[j].LinkAddress,
        //                 }

        //                 await axios.post(`http://163.44.192.123:5000/get_prices_pv`, body)
        //                     .then(async (res) => {
        //                         var price;
        //                         if (res.data.price != 0) {
        //                             price = res.data.price.replace(/,/g, '')
        //                         }
        //                         else {
        //                             price = 0
        //                         }
        //                         array[i]['pricePhongVu'] = price;
        //                         var pricedb = await mtblPrice(db).findOne({
        //                             order: [
        //                                 Sequelize.fn('max', Sequelize.col('DateGet')),
        //                             ],
        //                             group: ['IDLink', 'Price', 'ID', 'IDUserGet', 'DateGet'],
        //                         })
        //                         if (pricedb) {
        //                             if (pricedb.Price != price) {
        //                                 await mtblPrice(db).create({
        //                                     IDLink: link[j].ID,
        //                                     Price: Number(price),
        //                                 })
        //                             }
        //                         }
        //                         else {
        //                             await mtblPrice(db).create({
        //                                 IDLink: link[j].ID,
        //                                 Price: Number(price),
        //                             })
        //                         }

        //                     })
        //                     .catch(err => console.log(err))
        //             }
        //         }
        //     }

        // }
        // var result = {
        //     status: Constant.STATUS.SUCCESS,
        //     message: '',
        //     array: array,
        // }
        // res.json(result)
        // })
    }

}