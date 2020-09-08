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
var sql = require("mssql");
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
    try {
        for (var j = 0; j < objLink.length; j++) {
            var pricedb = await mtblPrice(db).findOne({
                order: [
                    Sequelize.literal('max(DateGet) DESC'),
                ],
                group: ['IDLink', 'Price', 'ID', 'IDUserGet', 'DateGet'],
                where: { IDLink: objLink[j].ID }
            })
            if (pricedb) {
                if (objLink[j].EnumLoaiLink === 4) {
                    if (pricedb.Price !== objResult.priceHNC) {
                        await mtblPrice(db).create({
                            IDLink: objLink[j].ID,
                            Price: objResult.priceHNC ? objResult.priceHNC : 0,
                        })
                    }
                }
                if (objLink[j].EnumLoaiLink === 3) {
                    if (pricedb.Price !== objResult.priceGearVN) {
                        await mtblPrice(db).create({
                            IDLink: objLink[j].ID,
                            Price: objResult.priceGearVN ? objResult.priceGearVN : 0,
                        })
                    }
                }
                if (objLink[j].EnumLoaiLink === 2) {
                    if (pricedb.Price !== objResult.pricePhucAnh) {
                        await mtblPrice(db).create({
                            IDLink: objLink[j].ID,
                            Price: objResult.pricePhucAnh ? objResult.pricePhucAnh : 0,
                        })
                    }
                }
                if (objLink[j].EnumLoaiLink === 1) {
                    if (pricedb.Price !== objResult.priceAnPhat) {
                        await mtblPrice(db).create({
                            IDLink: objLink[j].ID,
                            Price: objResult.priceAnPhat ? objResult.priceAnPhat : 0,
                        })
                    }
                }
                if (objLink[j].EnumLoaiLink === 0) {
                    if (pricedb.Price !== objResult.pricePhongVu) {
                        await mtblPrice(db).create({
                            IDLink: objLink[j].ID,
                            Price: objResult.pricePhongVu ? objResult.pricePhongVu : 0,
                        })
                    }
                }
            } else {
                if (objLink[j].EnumLoaiLink === 4) {
                    await mtblPrice(db).create({
                        IDLink: objLink[j].ID,
                        Price: objResult.priceHNC ? objResult.priceHNC : 0,
                    })
                }
                if (objLink[j].EnumLoaiLink === 3) {
                    await mtblPrice(db).create({
                        IDLink: objLink[j].ID,
                        Price: objResult.priceGearVN ? objResult.priceGearVN : 0,
                    })
                }
                if (objLink[j].EnumLoaiLink === 2) {
                    await mtblPrice(db).create({
                        IDLink: objLink[j].ID,
                        Price: objResult.pricePhucAnh ? objResult.pricePhucAnh : 0,
                    })
                }
                if (objLink[j].EnumLoaiLink === 1) {
                    await mtblPrice(db).create({
                        IDLink: objLink[j].ID,
                        Price: objResult.priceAnPhat ? objResult.priceAnPhat : 0,
                    })
                }
                if (objLink[j].EnumLoaiLink === 0) {
                    await mtblPrice(db).create({
                        IDLink: objLink[j].ID,
                        Price: objResult.pricePhongV ? objResult.pricePhongVu : 0,
                    })
                }
            }
        }

    } catch (error) {
        console.log(error + '');
    }
}

function convertStringToList(string) {
    let result = {};
    if (string) {
        result = string.split(";")
    }
    return result;
}

async function getPriceFromDatabase(obj, db) {
    obj['priceHNC'] = 0;
    obj['priceGearVN'] = 0;
    obj['pricePhucAnh'] = 0;
    obj['priceAnPhat'] = 0;
    obj['pricePhongVu'] = 0;
    var links = await mtblLinkGetPrice(db).findAll({
        where: { IDHangHoa: obj.idHangHoa }
    })
    for (var j = 0; j < links.length; j++) {
        var pricedb = await mtblPrice(db).findAll({
            order: [
                Sequelize.literal('max(DateGet) DESC'),
            ],
            group: ['IDLink', 'Price', 'ID', 'IDUserGet', 'DateGet'],
            where: { IDLink: links[j].ID },
            limit: 1,
        })
        if (pricedb.length > 0) {
            if (links[j].EnumLoaiLink === 4) {
                obj['priceHNC'] = pricedb[0].Price ? pricedb[0].Price : 0;
            }
            if (links[j].EnumLoaiLink === 3) {
                obj['priceGearVN'] = pricedb[0].Price ? pricedb[0].Price : 0;
            }
            if (links[j].EnumLoaiLink === 2) {
                obj['pricePhucAnh'] = pricedb[0].Price ? pricedb[0].Price : 0;
            }
            if (links[j].EnumLoaiLink === 1) {
                obj['priceAnPhat'] = pricedb[0].Price ? pricedb[0].Price : 0;
            }
            if (links[j].EnumLoaiLink === 0) {
                obj['pricePhongVu'] = pricedb[0].Price ? pricedb[0].Price : 0;
            }
        }
    }
    return obj
}

module.exports = {
    // search_goods
    functionSearchGoods: async (req, res) => {
        let body = req.body;
        var config = {
            user: 'sa',
            password: '1234',
            server: 'localhost',
            database: 'HNC_DB',
            options: {
                encrypt: false,
            },
        };
        var groupKey = [];
        groupKey = convertStringToList(body.groupKey);
        var whereGroup = '';
        if (groupKey.length > 0)
            for (var i = 0; i < groupKey.length; i++) {
                if (i <= 0)
                    whereGroup += `scan.tenNhomHang1 like N'%` + groupKey[i] + `%' or scan.tenNhomHang2 like N'%` + groupKey[i] + `%' or scan.tenNhomHang3 like N'%` + groupKey[i] + `%'`
                else
                    whereGroup += `or scan.tenNhomHang1 like N'%` + groupKey[i] + `%' or scan.tenNhomHang2 like N'%` + groupKey[i] + `%' or scan.tenNhomHang3 like N'%` + groupKey[i] + `%'`
            }

        var whereGoods = '';
        if (body.goodsKey) {
            whereGoods = `scan.nameGoods like N'%` + body.goodsKey + `%' or scan.part like N'%` + body.goodsKey + `%' or scan.Code like N'%` + body.goodsKey + `%'`
        }
        var where = `WHERE ` + whereGroup + whereGoods
        var page = 1;
        if (body.page)
            page = Number(body.page);
        var offset = 20 * (page - 1);
        var fQuery = '';
        if (whereGoods !== '' || whereGroup !== '')
            fQuery = where + `GROUP BY scan.idGroup1, scan.idGroup2, scan.idGroup3, tenNhomHang1, tenNhomHang2, tenNhomHang3, Code, idHangHoa, part, nameGoods
        ORDER BY scan.idGroup1 `+ `OFFSET ` + offset + ` ROWS FETCH NEXT 10 ROWS ONLY;`
        else if (whereGoods === '' || whereGroup === '')
            fQuery = `GROUP BY scan.idGroup1, scan.idGroup2, scan.idGroup3, tenNhomHang1, tenNhomHang2, tenNhomHang3, Code, idHangHoa, part, nameGoods
            ORDER BY scan.idGroup1 `+ `OFFSET ` + offset + ` ROWS FETCH NEXT 10 ROWS ONLY;`
        console.log(fQuery);
        sql.connect(config, async function (err) {
            var request = new sql.Request();

            var query = `SELECT row_number() OVER (ORDER BY scan.idGroup1, scan.idGroup2, scan.idGroup3, tenNhomHang1, tenNhomHang2, tenNhomHang3, Code, idHangHoa, part, nameGoods) stt, scan.idGroup1, scan.idGroup2, scan.idGroup3, tenNhomHang1, tenNhomHang2, tenNhomHang3, Code, idHangHoa, part, nameGoods, 
            SUM(priceHNC) priceHNC, SUM(priceGearVN) priceGearVN, SUM(pricePhucAnh) pricePhucAnh, SUM(priceAnPhat) priceAnPhat, SUM(pricePhongVu) pricePhongVu FROM (
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.Code as code ,
            CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END as priceHNC,
            0 as priceGearVN, 0 as pricePhucAnh, 0 priceAnPhat, 0 pricePhongVu
            FROM tblHangHoaGroup1 as g1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.IDGroup2 = g2.ID
            LEFT JOIN tblHangHoa as goods
            ON goods.IDGroup1 = g1.ID OR goods.IDGroup2 = g2.ID OR goods.IDGroup3 = g3.ID
            LEFT JOIN tblLinkGetPrice as links
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID
            WHERE links.EnumLoaiLink = 4
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.Code
            
            UNION ALL
            
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.Code as code , 0 as priceHNC, 
            CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END as priceGearVN, 0 as pricePhucAnh, 0 priceAnPhat, 0 pricePhongVu
            FROM tblHangHoaGroup1 as g1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.IDGroup2 = g2.ID
            LEFT JOIN tblHangHoa as goods
            ON goods.IDGroup1 = g1.ID OR goods.IDGroup2 = g2.ID OR goods.IDGroup3 = g3.ID
            LEFT JOIN tblLinkGetPrice as links
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID
            WHERE links.EnumLoaiLink = 3
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.Code
            
            UNION ALL
            
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.Code as code , 0 as priceHNC, 
            0 as priceGearVN, 
            CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END as pricePhucAnh, 0 priceAnPhat, 0 pricePhongVu
            FROM tblHangHoaGroup1 as g1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.IDGroup2 = g2.ID
            LEFT JOIN tblHangHoa as goods
            ON goods.IDGroup1 = g1.ID OR goods.IDGroup2 = g2.ID OR goods.IDGroup3 = g3.ID
            LEFT JOIN tblLinkGetPrice as links       
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID
            WHERE links.EnumLoaiLink = 2
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.Code
            
            UNION ALL
            
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.Code as code , 0 as priceHNC, 
            0 as priceGearVN, 0 as pricePhucAnh,
            CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END as priceAnPhat, 0 pricePhongVu
            FROM tblHangHoaGroup1 as g1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.IDGroup2 = g2.ID
            LEFT JOIN tblHangHoa as goods
            ON goods.IDGroup1 = g1.ID OR goods.IDGroup2 = g2.ID OR goods.IDGroup3 = g3.ID
            LEFT JOIN tblLinkGetPrice as links
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID
            WHERE links.EnumLoaiLink = 1
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.Code
            
            UNION ALL
            
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.Code as code , 0 as priceHNC, 
            0 as priceGearVN, 0 as pricePhucAnh, 0 priceAnPhat, 
            CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END as pricePhongVu
            FROM tblHangHoaGroup1 as g1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.IDGroup2 = g2.ID
            LEFT JOIN tblHangHoa as goods
            ON goods.IDGroup1 = g1.ID OR goods.IDGroup2 = g2.ID OR goods.IDGroup3 = g3.ID
            LEFT JOIN tblLinkGetPrice as links
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID
            WHERE links.EnumLoaiLink = 0
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.Code
            ) as scan               
            `
            var queryAll = `SELECT scan.idGroup1, scan.idGroup2, scan.idGroup3, tenNhomHang1, tenNhomHang2, tenNhomHang3, Code, idHangHoa, part, nameGoods, 
            SUM(priceHNC) priceHNC, SUM(priceGearVN) priceGearVN, SUM(pricePhucAnh) pricePhucAnh, SUM(priceAnPhat) priceAnPhat, SUM(pricePhongVu) pricePhongVu FROM (
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.Code as code ,
            CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END as priceHNC,
            0 as priceGearVN, 0 as pricePhucAnh, 0 priceAnPhat, 0 pricePhongVu
            FROM tblHangHoaGroup1 as g1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.IDGroup2 = g2.ID
            LEFT JOIN tblHangHoa as goods
            ON goods.IDGroup1 = g1.ID OR goods.IDGroup2 = g2.ID OR goods.IDGroup3 = g3.ID
            LEFT JOIN tblLinkGetPrice as links
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID
            WHERE links.EnumLoaiLink = 4
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.Code
            
            UNION ALL
            
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.Code as code , 0 as priceHNC, 
            CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END as priceGearVN, 0 as pricePhucAnh, 0 priceAnPhat, 0 pricePhongVu
            FROM tblHangHoaGroup1 as g1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.IDGroup2 = g2.ID
            LEFT JOIN tblHangHoa as goods
            ON goods.IDGroup1 = g1.ID OR goods.IDGroup2 = g2.ID OR goods.IDGroup3 = g3.ID
            LEFT JOIN tblLinkGetPrice as links
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID
            WHERE links.EnumLoaiLink = 3
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.Code
            
            UNION ALL
            
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.Code as code , 0 as priceHNC, 
            0 as priceGearVN, 
            CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END as pricePhucAnh, 0 priceAnPhat, 0 pricePhongVu
            FROM tblHangHoaGroup1 as g1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.IDGroup2 = g2.ID
            LEFT JOIN tblHangHoa as goods
            ON goods.IDGroup1 = g1.ID OR goods.IDGroup2 = g2.ID OR goods.IDGroup3 = g3.ID
            LEFT JOIN tblLinkGetPrice as links       
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID
            WHERE links.EnumLoaiLink = 2
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.Code
            
            UNION ALL
            
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.Code as code , 0 as priceHNC, 
            0 as priceGearVN, 0 as pricePhucAnh,
            CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END as priceAnPhat, 0 pricePhongVu
            FROM tblHangHoaGroup1 as g1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.IDGroup2 = g2.ID
            LEFT JOIN tblHangHoa as goods
            ON goods.IDGroup1 = g1.ID OR goods.IDGroup2 = g2.ID OR goods.IDGroup3 = g3.ID
            LEFT JOIN tblLinkGetPrice as links
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID
            WHERE links.EnumLoaiLink = 1
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.Code
            
            UNION ALL
            
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.Code as code , 0 as priceHNC, 
            0 as priceGearVN, 0 as pricePhucAnh, 0 priceAnPhat, 
            CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END as pricePhongVu
            FROM tblHangHoaGroup1 as g1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.IDGroup2 = g2.ID
            LEFT JOIN tblHangHoa as goods
            ON goods.IDGroup1 = g1.ID OR goods.IDGroup2 = g2.ID OR goods.IDGroup3 = g3.ID
            LEFT JOIN tblLinkGetPrice as links
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID
            WHERE links.EnumLoaiLink = 0
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.Code
            ) as scan
            GROUP BY scan.idGroup1, scan.idGroup2, scan.idGroup3, tenNhomHang1, tenNhomHang2, tenNhomHang3, Code, idHangHoa, part, nameGoods`
            // query to the database and get the records
            var count;
            await request.query(queryAll, function (err, recordset) {
                if (err) console.log(err)
                count = recordset.rowsAffected[0];
            });
            request.query(query + fQuery, function (err, recordset) {
                var result = {
                    status: Constant.STATUS.SUCCESS,
                    message: '',
                    array: recordset.recordsets[0],
                    all: count,
                }
                res.json(result)
            })
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
            var goods = []
            // push vào obj: obj gửi vào service cào giá
            for (var i = 0; i < data.length; i++) {
                if (array[i].idHangHoa) {
                    var link = await mtblLinkGetPrice(db).findAll({
                        where: { IDHangHoa: data[i].idHangHoa }
                    })
                    for (var j = 0; j < link.length; j++) {
                        if (link[j].EnumLoaiLink === 4) {
                            group4[count4] = {
                                code: data[i].Code,
                                url: link[j].LinkAddress
                            }
                            count4 += 1;
                        }
                        if (link[j].EnumLoaiLink === 3) {
                            group3[count3] = {
                                code: data[i].Code,
                                url: link[j].LinkAddress
                            }
                            count3 += 1
                        }
                        if (link[j].EnumLoaiLink === 2) {
                            group2[count2] = {
                                code: data[i].Code,
                                url: link[j].LinkAddress
                            }
                            count2 += 1;
                        }
                        if (link[j].EnumLoaiLink === 1) {
                            group1[count1] = {
                                code: data[i].Code,
                                url: link[j].LinkAddress
                            }
                            count1 += 1;
                        }
                        if (link[j].EnumLoaiLink === 0) {
                            group0[count0] = {
                                code: data[i].Code,
                                url: link[j].LinkAddress
                            }
                            count0 += 1;
                        }
                    }
                }
            }
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
            // push giá vào list gửi về FE
            for (var i = 0; i < data.length; i++) {
                array[i]['priceHNC'] = 0;
                array[i]['priceGearVN'] = 0;
                array[i]['pricePhucAnh'] = 0;
                array[i]['priceAnPhat'] = 0;
                array[i]['pricePhongVu'] = 0;
                for (var j = 0; j < goods.length; j++) {
                    if (goods[j].key == 4) {
                        if (data[i].code == goods[j].Code)
                            array[i]['priceHNC'] = converPriceToNumber(goods[j].price);
                    }
                    if (goods[j].key == 3) {
                        if (data[i].code == goods[j].Code)
                            array[i]['priceGearVN'] = converPriceToNumber(goods[j].price);
                    }
                    if (goods[j].key == 2) {
                        if (data[i].code == goods[j].Code)
                            array[i]['pricePhucAnh'] = converPriceToNumber(goods[j].price);

                    }
                    if (goods[j].key == 1) {
                        if (data[i].code == goods[j].Code)
                            array[i]['priceAnPhat'] = converPriceToNumber(goods[j].price);

                    }
                    if (goods[j].key == 0) {
                        if (data[i].code == goods[j].Code)
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
            // creare price
            for (var i = 0; i < array.length; i++) {
                var links = await mtblLinkGetPrice(db).findAll({
                    where: { IDHangHoa: array[i].idHangHoa }
                })
                await createPrice(links, db, array[i]);
            }
        })
    }
}