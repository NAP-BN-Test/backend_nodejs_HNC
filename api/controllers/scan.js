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
    } else {
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
        if (key == 5)
            await axios.post(`http://db.namanphu.vn:5000/get_prices_xg`, obj).then(data => {
                try {
                    if (data.data.result)
                        pushDataToArray(data.data.result, array)
                } catch (error) {
                    console.log(error);
                }
            })

        if (key == 4)
            await axios.post(`http://db.namanphu.vn:5000/get_prices_hnc`, obj).then(data => {
                try {
                    if (data.data.result)
                        pushDataToArray(data.data.result, array)
                } catch (error) {
                    console.log(error);
                }
            })

        if (key == 0)
            await axios.post(`http://db.namanphu.vn:5000/get_prices_pv`, obj).then(data => {
                if (data.data.result) {
                    pushDataToArray(data.data.result, array)
                }

            })
        if (key == 1)
            await axios.post(`http://db.namanphu.vn:5000/get_prices_ap`, obj).then(data => {
                try {
                    if (data.data.result)
                        pushDataToArray(data.data.result, array)
                } catch (error) {
                    console.log(error);
                }

            })
        if (key == 2)
            await axios.post(`http://db.namanphu.vn:5000/get_prices_pa`, obj).then(data => {
                try {
                    if (data.data.result)
                        pushDataToArray(data.data.result, array)
                } catch (error) {
                    console.log(error);
                }

            })
        if (key == 3)
            await axios.post(`http://db.namanphu.vn:5000/get_prices_gvn`, obj).then(data => {
                try {
                    if (data.data.result)
                        pushDataToArray(data.data.result, array)
                } catch (error) {
                    console.log(error);
                }

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
            console.log(pricedb);
            console.log(objLink[j].EnumLoaiLink);
            if (pricedb) {
                if (objLink[j].EnumLoaiLink === 6) {
                    if (pricedb.Price !== objResult.priceCELLPHONES) {
                        await mtblPrice(db).create({
                            IDLink: objLink[j].ID,
                            Price: objResult.priceCELLPHONES ? objResult.priceCELLPHONES : 0,
                        })
                    }
                }
                if (objLink[j].EnumLoaiLink === 5) {
                    if (pricedb.Price !== objResult.priceXG) {
                        await mtblPrice(db).create({
                            IDLink: objLink[j].ID,
                            Price: objResult.priceXG ? objResult.priceXG : 0,
                        })
                    }
                }
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
                if (objLink[j].EnumLoaiLink === 6) {
                    await mtblPrice(db).create({
                        IDLink: objLink[j].ID,
                        Price: objResult.priceCELLPHONES ? objResult.priceCELLPHONES : 0,
                    })
                }
                if (objLink[j].EnumLoaiLink === 5) {
                    await mtblPrice(db).create({
                        IDLink: objLink[j].ID,
                        Price: objResult.priceXG ? objResult.priceXG : 0,
                    })
                }
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
                        Price: objResult.pricePhongVu ? objResult.pricePhongVu : 0,
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
    obj['priceXG'] = 0;
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
            if (links[j].EnumLoaiLink === 5) {
                obj['priceXG'] = pricedb[0].Price ? pricedb[0].Price : 0;
            }
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
const request = require('request-promise');
const cheerio = require('cheerio');
async function dataScraping(type, link) {
    let result = 0
    console.log(type);
    console.log(link);
    if (link)
        try {
            if (type == 'XGEAR')
                return 0
            if (type == 'CELLPHONES')
                await axios.post(`http://db.namanphu.vn:5000/get_prices_cells`, new URLSearchParams({ url: link })).then(data => {
                    try {
                        if (data.data.result)
                            result = data.data.result
                    } catch (error) {
                        console.log(error);
                    }
                })
            if (type == 'PV')
                await axios.post(`http://db.namanphu.vn:5000/get_prices_pv`, new URLSearchParams({ url: link })).then(data => {
                    try {
                        if (data.data.result)
                            result = data.data.result
                    } catch (error) {
                        console.log(error);
                    }
                })

            await request(link, async function(error, response, body) {
                if (body) {
                    const $ = cheerio.load(body);
                    let ds = $(body).find("b.js-pro-total-price")
                    if (type == 'AP')
                        ds = $(body).find("b.js-pro-total-price")
                    else if (type == 'HNC')
                        ds = $(body).find("strong.giakm")
                    else if (type == 'PA')
                        ds = $(body).find("span.detail-product-best-price")
                    else if (type == 'GEARVN')
                        ds = $(body).find("span.product_sale_price")
                    else
                        ds = $(body).find("p.price").find("ins").find("span.woocommerce-Price-amount").find("bdi")
                        //   
                    await ds.each(async function(i, e) {
                        let str = $(this).text().trim()
                        if (type == 'GEARVN') {
                            str = str.substring(0, str.length - 1)
                            result = Number(str.replace(/,/g, ''));
                        } else if (type == 'XGEAR' || type == 'HNC') {
                            str = str.substring(0, str.length - 1)
                            result = Number(str.replace(/\./g, ''));
                        } else {
                            str = str.substring(0, str.length - 2)
                            result = Number(str.replace(/\./g, ''));
                        }
                    })
                }
            });
        } catch (error) {
            console.log(error);
        }
    console.log(result);
    return result
}

module.exports = {
    // search_goods
    functionSearchGoods: async(req, res) => {
        let body = req.body;
        var config = database.config;
        var whereGroup = '';
        var page = 1;
        if (body.page)
            page = Number(body.page);
        if (body.idGroup1) {
            whereGroup = `scan.idGroup1 = ` + body.idGroup1;

        }
        if (body.idGroup2) {
            whereGroup = `scan.idGroup2 = ` + body.idGroup2;

        }
        if (body.idGroup3) {
            whereGroup = `scan.idGroup3= ` + body.idGroup3;
        }
        var whereGoods = '';
        if (body.searchKey) {
            if (whereGroup !== '') {
                whereGoods = ` AND (UPPER(scan.nameGoods) like N'%` + body.searchKey.toUpperCase().trim() + `%' or UPPER(scan.part) like N'%` + body.searchKey.toUpperCase().trim() + `%' or UPPER(scan.code) like N'%` + body.searchKey.toUpperCase().trim() + `%')`

            } else {
                whereGoods = `(UPPER(scan.nameGoods) like N'%` + body.searchKey.toUpperCase().trim() + `%' or UPPER(scan.part) like N'%` + body.searchKey.toUpperCase().trim() + `%' or UPPER(scan.code) like N'%` + body.searchKey.toUpperCase().trim() + `%')`

            }
        }
        var offset = 100 * (page - 1);
        var where;
        if (whereGroup !== '')
            where = `WHERE ` + '(' + whereGroup + ')' + whereGoods;
        else
            where = `WHERE ` + whereGoods;
        var fQuery = '';
        var pageQuery = ` LEFT JOIN tblLinkGetPrice as linkHNC
        ON linkHNC.IDHangHoa = scan.idHangHoa AND linkHNC.EnumLoaiLink = 4
        LEFT JOIN tblLinkGetPrice as linkGVN
        ON linkGVN.IDHangHoa = scan.idHangHoa AND linkGVN.EnumLoaiLink = 3
        LEFT JOIN tblLinkGetPrice as linkPA
        ON linkPA.IDHangHoa = scan.idHangHoa AND linkPA.EnumLoaiLink = 2
        LEFT JOIN tblLinkGetPrice as linkAP
        ON linkAP.IDHangHoa = scan.idHangHoa AND linkAP.EnumLoaiLink = 1
        LEFT JOIN tblLinkGetPrice as linkPV
        ON linkPV.IDHangHoa = scan.idHangHoa AND linkPV.EnumLoaiLink = 0
        LEFT JOIN tblLinkGetPrice as linkXG
        ON linkXG.IDHangHoa = scan.idHangHoa AND linkXG.EnumLoaiLink = 5
        LEFT JOIN tblLinkGetPrice as linkCELLPHONES
        ON linkCELLPHONES.IDHangHoa = scan.idHangHoa AND linkCELLPHONES.EnumLoaiLink = 6
        GROUP BY scan.idGroup1, scan.idGroup2, scan.idGroup3, tenNhomHang1, tenNhomHang2, tenNhomHang3, code,
         scan.idHangHoa, part, nameGoods, linkHNC.LinkAddress, linkPV.LinkAddress, linkAP.LinkAddress, linkGVN.LinkAddress, linkPA.LinkAddress, linkXG.LinkAddress, linkCELLPHONES.LinkAddress`;
        if (whereGoods !== '' || whereGroup !== '') {
            fQuery = ` LEFT JOIN tblLinkGetPrice as linkHNC
            ON linkHNC.IDHangHoa = scan.idHangHoa AND linkHNC.EnumLoaiLink = 4
            LEFT JOIN tblLinkGetPrice as linkGVN
            ON linkGVN.IDHangHoa = scan.idHangHoa AND linkGVN.EnumLoaiLink = 3
            LEFT JOIN tblLinkGetPrice as linkPA
            ON linkPA.IDHangHoa = scan.idHangHoa AND linkPA.EnumLoaiLink = 2
            LEFT JOIN tblLinkGetPrice as linkAP
            ON linkAP.IDHangHoa = scan.idHangHoa AND linkAP.EnumLoaiLink = 1
            LEFT JOIN tblLinkGetPrice as linkPV
            ON linkPV.IDHangHoa = scan.idHangHoa AND linkPV.EnumLoaiLink = 0 
            LEFT JOIN tblLinkGetPrice as linkXG
            ON linkXG.IDHangHoa = scan.idHangHoa AND linkXG.EnumLoaiLink = 5
            LEFT JOIN tblLinkGetPrice as linkCELLPHONES
            ON linkCELLPHONES.IDHangHoa = scan.idHangHoa AND linkCELLPHONES.EnumLoaiLink = 6` +
                where +
                `
            GROUP BY scan.idGroup1, scan.idGroup2, scan.idGroup3, tenNhomHang1, tenNhomHang2, tenNhomHang3, code,
            scan.idHangHoa, part, nameGoods, linkHNC.LinkAddress, linkPV.LinkAddress, linkAP.LinkAddress, linkGVN.LinkAddress, linkPA.LinkAddress, linkXG.LinkAddress, linkCELLPHONES.LinkAddress
            ORDER BY scan.idGroup1 ` + `OFFSET ` + offset + ` ROWS FETCH NEXT 100 ROWS ONLY;`
            pageQuery = ` LEFT JOIN tblLinkGetPrice as linkHNC
            ON linkHNC.IDHangHoa = scan.idHangHoa AND linkHNC.EnumLoaiLink = 4
            LEFT JOIN tblLinkGetPrice as linkGVN
            ON linkGVN.IDHangHoa = scan.idHangHoa AND linkGVN.EnumLoaiLink = 3
            LEFT JOIN tblLinkGetPrice as linkPA
            ON linkPA.IDHangHoa = scan.idHangHoa AND linkPA.EnumLoaiLink = 2
            LEFT JOIN tblLinkGetPrice as linkAP
            ON linkAP.IDHangHoa = scan.idHangHoa AND linkAP.EnumLoaiLink = 1
            LEFT JOIN tblLinkGetPrice as linkPV
            ON linkPV.IDHangHoa = scan.idHangHoa AND linkPV.EnumLoaiLink = 0 
            LEFT JOIN tblLinkGetPrice as linkXG
            ON linkXG.IDHangHoa = scan.idHangHoa AND linkXG.EnumLoaiLink = 5
            LEFT JOIN tblLinkGetPrice as linkCELLPHONES
            ON linkCELLPHONES.IDHangHoa = scan.idHangHoa AND linkCELLPHONES.EnumLoaiLink = 6` +
                where +
                `
            GROUP BY scan.idGroup1, scan.idGroup2, scan.idGroup3, tenNhomHang1, tenNhomHang2, tenNhomHang3, code,
            scan.idHangHoa, part, nameGoods, linkHNC.LinkAddress, linkPV.LinkAddress, linkAP.LinkAddress, linkGVN.LinkAddress, linkPA.LinkAddress, linkXG.LinkAddress, linkCELLPHONES.LinkAddress`
        } else if (whereGoods === '' || whereGroup === '') {
            fQuery = ` LEFT JOIN tblLinkGetPrice as linkHNC
            ON linkHNC.IDHangHoa = scan.idHangHoa AND linkHNC.EnumLoaiLink = 4
            LEFT JOIN tblLinkGetPrice as linkGVN
            ON linkGVN.IDHangHoa = scan.idHangHoa AND linkGVN.EnumLoaiLink = 3
            LEFT JOIN tblLinkGetPrice as linkPA
            ON linkPA.IDHangHoa = scan.idHangHoa AND linkPA.EnumLoaiLink = 2
            LEFT JOIN tblLinkGetPrice as linkAP
            ON linkAP.IDHangHoa = scan.idHangHoa AND linkAP.EnumLoaiLink = 1
            LEFT JOIN tblLinkGetPrice as linkPV
            ON linkPV.IDHangHoa = scan.idHangHoa AND linkPV.EnumLoaiLink = 0
            LEFT JOIN tblLinkGetPrice as linkXG
            ON linkXG.IDHangHoa = scan.idHangHoa AND linkXG.EnumLoaiLink = 5
            LEFT JOIN tblLinkGetPrice as linkCELLPHONES
            ON linkCELLPHONES.IDHangHoa = scan.idHangHoa AND linkCELLPHONES.EnumLoaiLink = 6
            GROUP BY scan.idGroup1, scan.idGroup2, scan.idGroup3, tenNhomHang1, tenNhomHang2, tenNhomHang3, code,
            scan.idHangHoa, part, nameGoods, linkHNC.LinkAddress, linkPV.LinkAddress, linkAP.LinkAddress, linkGVN.LinkAddress, linkPA.LinkAddress, linkXG.LinkAddress, linkCELLPHONES.LinkAddress
            ORDER BY scan.idGroup1 ` + `OFFSET ` + offset + ` ROWS FETCH NEXT 100 ROWS ONLY;`
        }
        sql.connect(config, async function(err) {
            var request = new sql.Request();

            var query = `SELECT row_number() OVER (ORDER BY scan.idGroup1, scan.idGroup2, scan.idGroup3, tenNhomHang1, tenNhomHang2, tenNhomHang3, code, scan.idHangHoa, part, nameGoods) stt, scan.idGroup1, scan.idGroup2, scan.idGroup3, tenNhomHang1, tenNhomHang2, tenNhomHang3, code, scan.idHangHoa, part, nameGoods, 
            SUM(priceHNC) priceHNC, SUM(priceGearVN) priceGearVN, SUM(pricePhucAnh) pricePhucAnh, SUM(priceAnPhat) priceAnPhat, SUM(pricePhongVu) pricePhongVu, SUM(priceXG) priceXG, SUM(priceCELLPHONES) priceCELLPHONES, linkHNC.LinkAddress linkHNC, linkPV.LinkAddress linkPV, linkAP.LinkAddress linkAP, linkPA.LinkAddress linkPA, linkGVN.LinkAddress linkGVN, linkXG.LinkAddress linkXG, linkCELLPHONES.LinkAddress linkCELLPHONES FROM (
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.code as code ,
            CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END as priceHNC,
            0 as priceGearVN, 0 as pricePhucAnh, 0 priceAnPhat, 0 pricePhongVu, 0 priceXG, 0 priceCELLPHONES
            FROM tblHangHoa as goods
            LEFT JOIN tblHangHoaGroup1 as g1
            ON g1.ID = goods.IDGroup1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.ID = goods.IDGroup2 AND g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.ID = goods.IDGroup3 AND g3.IDGroup2 = g2.ID
            LEFT JOIN tblLinkGetPrice as links
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID and prices.DateGet = (SELECT MAX(DateGet) from tblPrice WHERE IDLink = links.ID)
            WHERE links.EnumLoaiLink = 4
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.code
                        
            UNION ALL
                        
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.code as code , 0 as priceHNC, 
            CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END as priceGearVN, 0 as pricePhucAnh, 0 priceAnPhat, 0 pricePhongVu, 0 priceXG, 0 priceCELLPHONES
            FROM tblHangHoa as goods
            LEFT JOIN tblHangHoaGroup1 as g1
            ON g1.ID = goods.IDGroup1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.ID = goods.IDGroup2 AND g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.ID = goods.IDGroup3 AND g3.IDGroup2 = g2.ID
            LEFT JOIN tblLinkGetPrice as links
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID and prices.DateGet = (SELECT MAX(DateGet) from tblPrice WHERE IDLink = links.ID)
            WHERE links.EnumLoaiLink = 3
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.code
                        
            UNION ALL
                        
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.code as code , 0 as priceHNC, 
            0 as priceGearVN, 
            CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END as pricePhucAnh, 0 priceAnPhat, 0 pricePhongVu, 0 priceXG, 0 priceCELLPHONES
            FROM tblHangHoa as goods
            LEFT JOIN tblHangHoaGroup1 as g1
            ON g1.ID = goods.IDGroup1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.ID = goods.IDGroup2 AND g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.ID = goods.IDGroup3 AND g3.IDGroup2 = g2.ID
            LEFT JOIN tblLinkGetPrice as links
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID and prices.DateGet = (SELECT MAX(DateGet) from tblPrice WHERE IDLink = links.ID)
            WHERE links.EnumLoaiLink = 2
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.code
                        
            UNION ALL
                        
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.code as code , 0 as priceHNC, 
            0 as priceGearVN, 0 as pricePhucAnh,
            CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END as priceAnPhat, 0 pricePhongVu, 0 priceXG, 0 priceCELLPHONES
            FROM tblHangHoa as goods
            LEFT JOIN tblHangHoaGroup1 as g1
            ON g1.ID = goods.IDGroup1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.ID = goods.IDGroup2 AND g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.ID = goods.IDGroup3 AND g3.IDGroup2 = g2.ID
            LEFT JOIN tblLinkGetPrice as links
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID and prices.DateGet = (SELECT MAX(DateGet) from tblPrice WHERE IDLink = links.ID)
            WHERE links.EnumLoaiLink = 1
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.code
                        
            UNION ALL
                        
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.code as code , 0 as priceHNC, 
            0 as priceGearVN, 0 as pricePhucAnh, 0 priceAnPhat, 
            CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END as pricePhongVu, 0 priceXG, 0 priceCELLPHONES
            FROM tblHangHoa as goods
            LEFT JOIN tblHangHoaGroup1 as g1
            ON g1.ID = goods.IDGroup1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.ID = goods.IDGroup2 AND g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.ID = goods.IDGroup3 AND g3.IDGroup2 = g2.ID
            LEFT JOIN tblLinkGetPrice as links
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID and prices.DateGet = (SELECT MAX(DateGet) from tblPrice WHERE IDLink = links.ID)
            WHERE links.EnumLoaiLink = 0
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.code
			UNION ALL
                        
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.code as code , 0 as priceHNC, 
            0 as priceGearVN, 0 as pricePhucAnh, 0 priceAnPhat, 
			0 as pricePhongVu, 
			CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END priceXG, 0 priceCELLPHONES
            FROM tblHangHoa as goods
            LEFT JOIN tblHangHoaGroup1 as g1
            ON g1.ID = goods.IDGroup1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.ID = goods.IDGroup2 AND g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.ID = goods.IDGroup3 AND g3.IDGroup2 = g2.ID
            LEFT JOIN tblLinkGetPrice as links
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID and prices.DateGet = (SELECT MAX(DateGet) from tblPrice WHERE IDLink = links.ID)
            WHERE links.EnumLoaiLink = 5
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.code
            UNION ALL
                        
            SELECT g1.ID as idGroup1, g1.TenNhomHang as tenNhomHang1,g2.ID as idGroup2, g2.TenNhomHang as tenNhomHang2,
            g3.ID as idGroup3, g3.TenNhomHang as tenNhomHang3, goods.NameHangHoa as nameGoods,goods.PART as part,
            goods.ID as idHangHoa, goods.code as code , 0 as priceHNC, 
            0 as priceGearVN, 0 as pricePhucAnh, 0 priceAnPhat, 
			0 as pricePhongVu, 0 as priceXG, 
			CASE
                WHEN prices.Price is NULL THEN 0
                ELSE prices.Price
            END priceCELLPHONES
            FROM tblHangHoa as goods
            LEFT JOIN tblHangHoaGroup1 as g1
            ON g1.ID = goods.IDGroup1
            LEFT JOIN tblHangHoaGroup2 as g2
            ON g2.ID = goods.IDGroup2 AND g2.IDGroup1 = g1.ID
            LEFT JOIN tblHangHoaGroup3 as g3
            ON g3.ID = goods.IDGroup3 AND g3.IDGroup2 = g2.ID
            LEFT JOIN tblLinkGetPrice as links
            ON links.IDHangHoa = goods.ID
            LEFT JOIN tblPrice as prices
            ON prices.IDLink = links.ID and prices.DateGet = (SELECT MAX(DateGet) from tblPrice WHERE IDLink = links.ID)
            WHERE links.EnumLoaiLink = 6
            GROUP BY g1.ID, g1.TenNhomHang, g2.ID, g2.TenNhomHang, g3.ID, g3.TenNhomHang, goods.NameHangHoa, 
            prices.Price, goods.PART, goods.ID, goods.code
            ) as scan              
            `
                // query to the database and get the records
            var count;
            await request.query(query + pageQuery, function(err, recordset) {
                if (err) console.log(err)
                if (recordset)
                    count = recordset.rowsAffected[0];
                if (body.page) {
                    request.query(query + fQuery, function(err, recordset) {
                        if (recordset) {
                            var result = {
                                status: Constant.STATUS.SUCCESS,
                                message: '',
                                array: recordset.recordsets[0],
                                all: count,
                            }
                            res.json(result)
                        } else {
                            var result = {
                                status: Constant.STATUS.FAIL,
                                message: 'Connect timeout!',
                            }
                            res.json(result)
                        }

                    })
                } else {
                    request.query(query + pageQuery, function(err, recordset) {
                        var result = {
                            status: Constant.STATUS.SUCCESS,
                            message: '',
                            array: recordset.recordsets[0],
                            all: count,
                        }
                        res.json(result)
                    })
                }
            });
        })

    },
    // scan_price
    functionScanPrice: async(req, res) => {
            let body = req.body;
            var data = JSON.parse(body.data);
            var columnScan = JSON.parse(body.columnScan);
            var arrayScan = [0, 1, 2, 3, 4, 5, 6]
            if (columnScan.length < 1)
                columnScan = arrayScan
            var array = data;
            for (let d = 0; d < array.length; d++) {
                array[d]['priceHNC'] = await dataScraping('HNC', array[d].linkHNC)
                array[d]['priceGearVN'] = await dataScraping('GEARVN', array[d].linkGVN)
                array[d]['pricePhucAnh'] = await dataScraping('PA', array[d].linkPA)
                array[d]['priceAnPhat'] = await dataScraping('AP', array[d].linkAP)
                array[d]['pricePhongVu'] = await dataScraping('PV', array[d].linkPV)
                array[d]['priceXG'] = await dataScraping('XGEAR', array[d].linkXG)
                array[d]['priceCELLPHONES'] = await dataScraping('CELLPHONES', array[d].linkCELLPHONES)
            }
            var result = {
                status: Constant.STATUS.SUCCESS,
                message: '',
                array: array,
            }
            console.log(array);
            res.json(result);
            database.connectDatabase().then(async db => {
                for (var i = 0; i < array.length; i++) {
                    var links = await mtblLinkGetPrice(db).findAll({
                        where: { IDHangHoa: array[i].idHangHoa }
                    })
                    await createPrice(links, db, array[i]);
                }
            })
        }
        // var group5 = {};
        // var group4 = {};
        // var group3 = {};
        // var group2 = {};
        // var group1 = {};
        // var group0 = {};
        // var count1 = 0;
        // var count2 = 0;
        // var count3 = 0;
        // var count4 = 0;
        // var count5 = 0;
        // var count0 = 0;
        // var goods = []
        // // push vào obj: obj gửi vào service cào giá
        // for (var i = 0; i < data.length; i++) {
        //     if (array[i].idHangHoa) {
        //         var link = await mtblLinkGetPrice(db).findAll({
        //             where: { IDHangHoa: data[i].idHangHoa }
        //         })
        //         for (var j = 0; j < link.length; j++) {
        //             if (link[j].EnumLoaiLink === 5) {
        //                 if (count5 = 20) {
        //                     await getPriceFromService(5, group5, goods);
        //                     group5 = {};
        //                     count5 = 0;
        //                 }
        //                 group5[count5] = {
        //                     code: data[i].code,
        //                     url: link[j].LinkAddress
        //                 }
        //                 count5 += 1;
        //             }
        //             if (link[j].EnumLoaiLink === 4) {
        //                 if (count4 = 20) {
        //                     await getPriceFromService(4, group4, goods);
        //                     group4 = {};
        //                     count4 = 0;
        //                 }
        //                 group4[count4] = {
        //                     code: data[i].code,
        //                     url: link[j].LinkAddress
        //                 }
        //                 count4 += 1;
        //             }
        //             if (link[j].EnumLoaiLink === 3) {
        //                 if (count3 = 20) {
        //                     await getPriceFromService(3, group3, goods);
        //                     group3 = {};
        //                     count3 = 0;
        //                 }
        //                 group3[count3] = {
        //                     code: data[i].code,
        //                     url: link[j].LinkAddress
        //                 }
        //                 count3 += 1
        //             }
        //             if (link[j].EnumLoaiLink === 2) {
        //                 if (count2 = 20) {
        //                     await getPriceFromService(2, group2, goods);
        //                     group2 = {};
        //                     count2 = 0;
        //                 }
        //                 group2[count2] = {
        //                     code: data[i].code,
        //                     url: link[j].LinkAddress
        //                 }
        //                 count2 += 1;
        //             }
        //             if (link[j].EnumLoaiLink === 1) {
        //                 if (count1 = 20) {
        //                     await getPriceFromService(1, group1, goods);
        //                     group1 = {};
        //                     count1 = 0;
        //                 }
        //                 group1[count1] = {
        //                     code: data[i].code,
        //                     url: link[j].LinkAddress
        //                 }
        //                 count1 += 1;
        //             }
        //             if (link[j].EnumLoaiLink === 0) {
        //                 if (count0 = 20) {
        //                     await getPriceFromService(0, group0, goods);
        //                     group0 = {};
        //                     count0 = 0;
        //                 }
        //                 group0[count0] = {
        //                     code: data[i].code,
        //                     url: link[j].LinkAddress
        //                 }
        //                 count0 += 1;
        //             }
        //         }
        //     }
        // }
        // if (columnScan.indexOf(5) != -1)
        //     await getPriceFromService(5, group5, goods)
        // if (columnScan.indexOf(4) != -1)
        //     await getPriceFromService(4, group4, goods)
        // if (columnScan.indexOf(3) != -1)
        //     await getPriceFromService(3, group3, goods)
        // if (columnScan.indexOf(2) != -1)
        //     await getPriceFromService(2, group2, goods)
        // if (columnScan.indexOf(1) != -1)
        //     await getPriceFromService(1, group1, goods)
        // if (columnScan.indexOf(0) != -1)
        //     await getPriceFromService(0, group0, goods)
        // // push giá vào list gửi về FE
        // for (var i = 0; i < data.length; i++) {
        //     array[i]['priceHNC'] = 0;
        //     array[i]['priceGearVN'] = 0;
        //     array[i]['pricePhucAnh'] = 0;
        //     array[i]['priceAnPhat'] = 0;
        //     array[i]['pricePhongVu'] = 0;
        //     array[i]['priceXG'] = 0;
        //     for (var j = 0; j < goods.length; j++) {
        //         if (goods[j].key == 5 && data[i].code == goods[j].code) {
        //             array[i]['priceXG'] = converPriceToNumber(goods[j].price);
        //         }
        //         if (goods[j].key == 4 && data[i].code == goods[j].code) {
        //             array[i]['priceHNC'] = converPriceToNumber(goods[j].price);
        //         }
        //         if (goods[j].key == 3 && data[i].code == goods[j].code) {
        //             array[i]['priceGearVN'] = converPriceToNumber(goods[j].price);
        //         }
        //         if (goods[j].key == 2 && data[i].code == goods[j].code) {
        //             array[i]['pricePhucAnh'] = converPriceToNumber(goods[j].price);

    //         }
    //         if (goods[j].key == 1 && data[i].code == goods[j].code) {
    //             array[i]['priceAnPhat'] = converPriceToNumber(goods[j].price);

    //         }
    //         if (goods[j].key == 0 && data[i].code == goods[j].code) {
    //             array[i]['pricePhongVu'] = converPriceToNumber(goods[j].price);

    //         }
    //     }
    // }
}