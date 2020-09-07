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
function converPriceToNumber(price) {
    var result;
    if (price != 0) {
        result = price.replace(/,/g, '')
        return Number(result)
    }
    else {
        return 0
    }
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

function pushDataToArray(data, array) {
    data.forEach(item => {
        array.push({
            key: item.key,
            code: item.code,
            price: item.price,
        })
    })
    return array
}

async function getPriceFromService(key, obj, array) {
    if (obj['0']) {
        if (key == 4)
            await axios.post(`http://163.44.192.123:5000/get_prices_hnc`, obj).then(data => {
                if (data.data.result)
                    pushDataToArray(data.data.result, array)
            })
        if (key == 0)
            await axios.post(`http://163.44.192.123:5000/get_prices_pv`, obj).then(data => {
                if (data.data.result)
                    pushDataToArray(data.data.result, array)

            })
        if (key == 1)
            await axios.post(`http://163.44.192.123:5000/get_prices_ap`, obj).then(data => {
                if (data.data.result)
                    pushDataToArray(data.data.result, array)

            })
        if (key == 2)
            await axios.post(`http://163.44.192.123:5000/get_prices_pa`, obj).then(data => {
                if (data.data.result)
                    pushDataToArray(data.data.result, array)

            })
        if (key == 3)
            await axios.post(`http://163.44.192.123:5000/get_prices_gvn`, obj).then(data => {
                if (data.data.result)
                    pushDataToArray(data.data.result, array)

            })
    }
    return array;
}

async function createPrice(objLink, db, objResult) {
    for (var j = 0; j < objLink.length; j++) {
        var pricedb = await mtblPrice(db).findOne({
            order: [
                Sequelize.fn('max', Sequelize.col('DateGet')),
            ],
            group: ['IDLink', 'Price', 'ID', 'IDUserGet', 'DateGet'],
            where: { IDLink: objLink[j].ID }
        })
        if (pricedb) {
            if (objLink[j].EnumLoaiLink === 4) {
                if (pricedb.Price != objResult.priceHNC) {
                    await mtblPrice(db).create({
                        IDLink: objLink[j].ID,
                        Price: objResult.priceHNC,
                    })
                }
            }
            if (objLink[j].EnumLoaiLink === 3) {
                if (pricedb.Price != objResult.priceGearVN) {
                    await mtblPrice(db).create({
                        IDLink: objLink[j].ID,
                        Price: objResult.priceGearVN,
                    })
                }
            }
            if (objLink[j].EnumLoaiLink === 2) {
                if (pricedb.Price != objResult.pricePhucAnh) {
                    await mtblPrice(db).create({
                        IDLink: objLink[j].ID,
                        Price: objResult.pricePhucAnh,
                    })
                }
            }
            if (objLink[j].EnumLoaiLink === 1) {
                if (pricedb.Price != objResult.priceAnPhat) {
                    await mtblPrice(db).create({
                        IDLink: objLink[j].ID,
                        Price: objResult.priceAnPhat,
                    })
                }
            }
            if (objLink[j].EnumLoaiLink === 0) {
                if (pricedb.Price != objResult.pricePhongVu) {
                    await mtblPrice(db).create({
                        IDLink: objLink[j].ID,
                        Price: objResult.pricePhongVu,
                    })
                }
            }
        } else {
            if (objLink[j].EnumLoaiLink === 4) {
                await mtblPrice(db).create({
                    IDLink: objLink[j].ID,
                    Price: objResult.priceHNC,
                })
            }
            if (objLink[j].EnumLoaiLink === 3) {
                await mtblPrice(db).create({
                    IDLink: objLink[j].ID,
                    Price: objResult.priceGearVN,
                })
            }
            if (objLink[j].EnumLoaiLink === 2) {
                await mtblPrice(db).create({
                    IDLink: objLink[j].ID,
                    Price: objResult.pricePhucAnh,
                })
            }
            if (objLink[j].EnumLoaiLink === 1) {
                await mtblPrice(db).create({
                    IDLink: objLink[j].ID,
                    Price: objResult.priceAnPhat,
                })
            }
            if (objLink[j].EnumLoaiLink === 0) {
                await mtblPrice(db).create({
                    IDLink: objLink[j].ID,
                    Price: objResult.pricePhongVu,
                })
            }
        }
    }
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
        var columnScan = JSON.parse(body.columnScan);
        var arrayScan = [0, 1, 2, 3, 4]
        if (columnScan.length < 1)
            columnScan = arrayScan
        var array = data;
        database.connectDatabase().then(async db => {
            var group4 = {};
            var group3 = {};
            var group2 = {};
            var group1 = {};
            var group0 = {};
            var count1 = 0;
            var count2 = 0;
            var count3 = 0;
            var count4 = 0;
            var count0 = 0;
            for (var i = 0; i < data.length; i++) {
                if (array[i].idHangHoa) {
                    var link = await mtblLinkGetPrice(db).findAll({
                        where: { IDHangHoa: data[i].idHangHoa }
                    })
                    for (var j = 0; j < link.length; j++) {
                        if (link[j].EnumLoaiLink === 4) {
                            group4[count4] = {
                                code: data[i].code,
                                url: link[j].LinkAddress
                            }
                            count4 += 1;
                        }
                        if (link[j].EnumLoaiLink === 3) {

                            group3[count3] = {
                                code: data[i].code,
                                url: link[j].LinkAddress
                            }
                            count3 += 1
                        }
                        if (link[j].EnumLoaiLink === 2) {

                            group2[count2] = {
                                code: data[i].code,
                                url: link[j].LinkAddress
                            }
                            count2 += 1;
                        }
                        if (link[j].EnumLoaiLink === 1) {

                            group1[count1] = {
                                code: data[i].code,
                                url: link[j].LinkAddress
                            }
                            count1 += 1;
                        }
                        if (link[j].EnumLoaiLink === 0) {

                            group0[count0] = {
                                code: data[i].code,
                                url: link[j].LinkAddress
                            }
                            count0 += 1;
                        }
                    }
                }
            }
            var goods = []
            if (columnScan.indexOf(4) != -1)
                await getPriceFromService(4, group4, goods)
            if (columnScan.indexOf(3) != -1)
                await getPriceFromService(3, group3, goods)
            if (columnScan.indexOf(2) != -1)
                await getPriceFromService(2, group2, goods)
            if (columnScan.indexOf(1) != -1)
                await getPriceFromService(1, group1, goods)
            if (columnScan.indexOf(0) != -1)
                await getPriceFromService(0, group0, goods)
            for (var i = 0; i < data.length; i++) {
                array[i]['priceHNC'] = 0;
                array[i]['priceGearVN'] = 0;
                array[i]['pricePhucAnh'] = 0;
                array[i]['priceAnPhat'] = 0;
                array[i]['pricePhongVu'] = 0;
                for (var j = 0; j < goods.length; j++) {
                    if (goods[j].key == 4) {
                        if (data[i].code == goods[j].code)
                            array[i]['priceHNC'] = converPriceToNumber(goods[j].price);
                    }
                    if (goods[j].key == 3) {
                        if (data[i].code == goods[j].code)
                            array[i]['priceGearVN'] = converPriceToNumber(goods[j].price);
                    }
                    if (goods[j].key == 2) {
                        if (data[i].code == goods[j].code)
                            array[i]['pricePhucAnh'] = converPriceToNumber(goods[j].price);

                    }
                    if (goods[j].key == 1) {
                        if (data[i].code == goods[j].code)
                            array[i]['priceAnPhat'] = converPriceToNumber(goods[j].price);

                    }
                    if (goods[j].key == 0) {
                        if (data[i].code == goods[j].code)
                            array[i]['pricePhongVu'] = converPriceToNumber(goods[j].price);

                    }
                }
            }
            var result = {
                status: Constant.STATUS.SUCCESS,
                message: '',
                array: array,
            }
            res.json(result);
            for (var i = 0; i < array.length; i++) {
                var links = await mtblLinkGetPrice(db).findAll({
                    where: { IDHangHoa: array[i].idHangHoa }
                })
                await createPrice(links, db, array[i]);
            }
        })
    }

}