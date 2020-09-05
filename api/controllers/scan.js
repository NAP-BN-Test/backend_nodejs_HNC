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
    functionSearchGoods: (req, res) => {
        let body = req.body;
        console.log(body);
        database.connectDatabase().then(async db => {
            var arrayf = [];
            await mtblHangHoaGroup1(db).findAll({
                order: [['ID', 'DESC']],
            }).then(async data => {
                for (var i = 0; i < data.length; i++) {
                    var check = await mtblHangHoaGroup2(db).findAll({
                        where: { IDGroup1: data[i].ID }
                    })
                    if (check.length === 0) {
                        arrayf.push({
                            idGroup1: data[i].ID,
                            tenNhomHang1: data[i].TenNhomHang ? data[i].TenNhomHang : '',
                            flagSelect1: data[i].FlagSelect ? data[i].FlagSelect : '',
                            idGroup2: null,
                            tenNhomHang2: '',
                            flagSelect2: '',
                            idGroup3: null,
                            tenNhomHang3: '',
                            flagSelect3: '',
                        })
                        continue;
                    }
                    await mtblHangHoaGroup2(db).findAll({
                        where: { IDGroup1: data[i].ID }
                    }).then(async group2 => {
                        for (var j = 0; j < group2.length; j++) {
                            var check = await mtblHangHoaGroup3(db).findAll({
                                where: { IDGroup2: group2[j].ID }
                            })
                            if (check.length === 0) {
                                arrayf.push({
                                    idGroup1: data[i].ID,
                                    tenNhomHang1: data[i].TenNhomHang ? data[i].TenNhomHang : '',
                                    flagSelect1: data[i].FlagSelect ? data[i].FlagSelect : '',
                                    idGroup2: group2[j] ? group2[j].ID : null,
                                    tenNhomHang2: group2[j].TenNhomHang ? group2[j].TenNhomHang : '',
                                    flagSelect2: group2[j].FlagSelect ? group2[j].FlagSelect : '',
                                    idGroup3: null,
                                    tenNhomHang3: '',
                                    flagSelect3: '',
                                })
                                continue;
                            }
                            await mtblHangHoaGroup3(db).findAll({
                                where: { IDGroup2: group2[j].ID }
                            }).then(group3 => {
                                for (var e = 0; e < group3.length; e++) {
                                    arrayf.push({
                                        idGroup1: data[i].ID,
                                        tenNhomHang1: data[i].TenNhomHang ? data[i].TenNhomHang : '',
                                        flagSelect1: data[i].FlagSelect ? data[i].FlagSelect : '',
                                        idGroup2: group2[j] ? group2[j].ID : null,
                                        tenNhomHang2: group2[j].TenNhomHang ? group2[j].TenNhomHang : '',
                                        flagSelect2: group2[j].FlagSelect ? group2[j].FlagSelect : '',
                                        idGroup3: group3[e] ? group3[e].ID : null,
                                        tenNhomHang3: group3[e] ? group3[e].TenNhomHang : '',
                                        flagSelect3: group3[e] ? group3[e].FlagSelect : '',
                                    })
                                }
                            })
                        }
                    })
                }
            })
            var arrayl = [];
            var count = 0;
            if (body.groupKey) {
                arrayf.forEach(item => {
                    if (item.tenNhomHang1.toUpperCase().search(body.groupKey.toUpperCase()) !== -1 || item.tenNhomHang2.toUpperCase().search(body.groupKey.toUpperCase()) !== -1 || item.tenNhomHang3.toUpperCase().search(body.groupKey.toUpperCase()) !== -1) {
                        arrayl.push(item);
                        count += 1;
                    }
                })
            } else {
                var count1 = await mtblHangHoaGroup1(db).count();
                var count2 = await mtblHangHoaGroup2(db).count();
                var count3 = await mtblHangHoaGroup3(db).count();
                var idGroup1 = [];
                var idGroup2 = [];
                await mtblHangHoaGroup2(db).findAll({ IDGroup1: null }).then(data => {
                    data.forEach(item => {
                        idGroup1.push(item.IDGroup1);
                    })
                });
                await mtblHangHoaGroup3(db).findAll({ IDGroup2: null }).then(data => {
                    data.forEach(item => {
                        idGroup2.push(item.IDGroup2);
                    })
                });
                var count1has2 = countDulicant(idGroup1);
                var count2has3 = countDulicant(idGroup2);
                arrayl = arrayf;
                count = count3 + (count1 - count1has2) + (count2 - count2has3);
            }
            // thêm hàng hóa
            for (var i = 0; i < arrayl.length; i++) {
                if (arrayl[i].idGroup3) {
                    var hangHoa = await mHangHoa(db).findAll({
                        where: { idGroup3: arrayl[i].idGroup3 }
                    })
                    if (hangHoa) {
                        for (var j = 0; j < hangHoa.length; j++) {
                            arrayl[i]['code'] = hangHoa[j].Code ? hangHoa[j].Code : '';
                            arrayl[i]['IDHangHoa'] = hangHoa[j].ID;
                            arrayl[i]['nameGoods'] = hangHoa[j].NameHangHoa ? hangHoa[j].NameHangHoa : '';
                            arrayl[i]['part'] = hangHoa[j].PART ? hangHoa[j].PART : '';
                        }
                    }
                } else {
                    if (arrayl[i].idGroup2) {
                        var hangHoa = await mHangHoa(db).findAll({
                            where: { idGroup2: arrayl[i].idGroup2 }
                        })

                        if (hangHoa) {
                            for (var j = 0; j < hangHoa.length; j++) {
                                arrayl[i]['code'] = hangHoa[j].Code ? hangHoa[j].Code : '';
                                arrayl[i]['IDHangHoa'] = hangHoa[j].ID;
                                arrayl[i]['nameGoods'] = hangHoa[j].NameHangHoa ? hangHoa[j].NameHangHoa : '';
                                arrayl[i]['part'] = hangHoa[j].PART ? hangHoa[j].PART : '';
                            }
                        }
                    } else {
                        var hangHoa = await mHangHoa(db).findAll({
                            where: { idGroup1: arrayl[i].idGroup1 }
                        })
                        if (hangHoa) {
                            for (var j = 0; j < hangHoa.length; j++) {
                                arrayl[i]['code'] = hangHoa[j].Code ? hangHoa[j].Code : '';
                                arrayl[i]['IDHangHoa'] = hangHoa[j].ID;
                                arrayl[i]['nameGoods'] = hangHoa[j].NameHangHoa ? hangHoa[j].NameHangHoa : '';
                                arrayl[i]['part'] = hangHoa[j].PART ? hangHoa[j].PART : '';
                            }
                        }
                    }
                }
            }
            var result = {
                status: Constant.STATUS.SUCCESS,
                message: '',
                array: arrayl,
                all: count,
            }
            res.json(result)

        })
    },
    // scan_price
    functionScanPrice: (req, res) => {
        let body = req.body;
        var data = JSON.parse(body.data);
        var array = data;

        database.connectDatabase().then(async db => {
            for (var i = 0; i < data.length; i++) {
                array[i]['priceHNC'] = 0;
                array[i]['priceGearVN'] = 0;
                array[i]['pricePhucAnh'] = 0;
                array[i]['priceAnPhat'] = 0;
                array[i]['pricePhongVu'] = 0;
                if (array[i].IDHangHoa) {
                    var link = await mtblLinkGetPrice(db).findAll({
                        where: { IDHangHoa: data[i].IDHangHoa }
                    })
                    for (var j = 0; j < link.length; j++) {
                        if (link[j].EnumLoaiLink === 4) {
                            let body1 = {
                                url: 'https://www.hanoicomputer.vn/hdd-wd-my-book-duo-20tb-wdbfbe0200jbk-sesn/p42827.html',
                            }
                            await axios.post(`http://163.44.192.123:5000/get_prices_hnc`, body1)
                                .then(async (res) => {
                                    var price = res.data.price.replace(/,/g, '')
                                    array[i]['priceHNC'] = price;
                                    var pricedb = await mtblPrice(db).findOne({
                                        order: [
                                            Sequelize.fn('max', Sequelize.col('DateGet')),
                                        ],
                                        group: ['IDLink', 'Price', 'ID', 'IDUserGet', 'DateGet'],
                                    })
                                    if (pricedb.Price != price) {

                                        await mtblPrice(db).create({
                                            IDLink: link[j].ID,
                                            Price: Number(price),
                                        })
                                    }
                                })
                                .catch(err => console.log(err))
                        }
                        else if (link[j].EnumLoaiLink === 3) {
                            let body = {
                                url: link[j].LinkAddress,
                            }
                            await axios.post(`http://163.44.192.123:5000/get_prices_gvn`, body)
                                .then(async (res) => {
                                    var price = res.data.price.replace(/,/g, '')
                                    array[i]['priceGearVN'] = price;
                                    var pricedb = await mtblPrice(db).findOne({
                                        order: [
                                            Sequelize.fn('max', Sequelize.col('DateGet')),
                                        ],
                                        group: ['IDLink', 'Price', 'ID', 'IDUserGet', 'DateGet'],
                                    })
                                    if (pricedb.Price != price) {
                                        await mtblPrice(db).create({
                                            IDLink: link[j].ID,
                                            Price: Number(price),
                                        })
                                    }

                                })
                                .catch(err => console.log(err))
                        }
                        else if (link[j].EnumLoaiLink === 1) {
                            let body = {
                                url: link[j].LinkAddress,
                            }

                            await axios.post(`http://163.44.192.123:5000/get_prices_pa`, body)
                                .then(async (res) => {
                                    var price = res.data.price.replace(/,/g, '')
                                    array[i]['pricePhucAnh'] = price;
                                    var pricedb = await mtblPrice(db).findOne({
                                        order: [
                                            Sequelize.fn('max', Sequelize.col('DateGet')),
                                        ],
                                        group: ['IDLink', 'Price', 'ID', 'IDUserGet', 'DateGet'],
                                    })
                                    if (pricedb.Price != price) {
                                        await mtblPrice(db).create({
                                            IDLink: link[j].ID,
                                            Price: Number(price),

                                        })
                                    }
                                })
                                .catch(err => console.log(err))
                        }
                        else if (link[j].EnumLoaiLink === 0) {
                            let body = {
                                url: link[j].LinkAddress,
                            }
                            console.log(link[j].LinkAddress);

                            await axios.post(`http://163.44.192.123:5000/get_prices_ap`, body)
                                .then(async (res) => {
                                    var price = res.data.price.replace(/,/g, '')
                                    array[i]['priceAnPhat'] = price;
                                    var pricedb = await mtblPrice(db).findOne({
                                        order: [
                                            Sequelize.fn('max', Sequelize.col('DateGet')),
                                        ],
                                        group: ['IDLink', 'Price', 'ID', 'IDUserGet', 'DateGet'],
                                    })
                                    if (pricedb.Price != price) {
                                        await mtblPrice(db).create({
                                            IDLink: link[j].ID,
                                            Price: Number(price),
                                        })
                                    }
                                })
                                .catch(err => console.log(err))
                        }
                        else if (link[j].EnumLoaiLink === 2) {
                            let body = {
                                url: link[j].LinkAddress,
                            }

                            await axios.post(`http://163.44.192.123:5000/get_prices_pv`, body)
                                .then(async (res) => {
                                    var price = res.data.price.replace(/,/g, '')
                                    array[i]['pricePhongVu'] = price;
                                    var pricedb = await mtblPrice(db).findOne({
                                        order: [
                                            Sequelize.fn('max', Sequelize.col('DateGet')),
                                        ],
                                        group: ['IDLink', 'Price', 'ID', 'IDUserGet', 'DateGet'],
                                    })
                                    if (pricedb.Price != price) {
                                        await mtblPrice(db).create({
                                            IDLink: link[j].ID,
                                            Price: Number(price),
                                        })
                                    }
                                })
                                .catch(err => console.log(err))
                        }
                    }
                }

            }
            var result = {
                status: Constant.STATUS.SUCCESS,
                message: '',
                array: array,
            }
            res.json(result)
        })
    }

}