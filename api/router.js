module.exports = function (app) {
    var mtblSysUser = require('./controllers/sys-user');
    var checkToken = require('./constants/token')
    app.route('/hnc/login').post(mtblSysUser.login);
    app.route('/hnc/add_user').post(checkToken.checkToken, mtblSysUser.addUser);
    app.route('/hnc/delete_list_user').post(checkToken.checkToken, mtblSysUser.deleteUser);
    app.route('/hnc/update_user').post(checkToken.checkToken, mtblSysUser.updateUser);
    app.route('/hnc/get_list_user').post(checkToken.checkToken, mtblSysUser.getListUser);

    // Hàng hóa
    var mtblHangHoa = require('./controllers/hang-hoa');
    app.route('/hnc/add_goods').post(checkToken.checkToken, mtblHangHoa.addGoods);
    app.route('/hnc/update_goods').post(checkToken.checkToken, mtblHangHoa.updateGoods);
    app.route('/hnc/delete_goods').post(checkToken.checkToken, mtblHangHoa.deleteGoods);
    app.route('/hnc/get_list_goods').post(checkToken.checkToken, mtblHangHoa.getListGoods);
    app.route('/hnc/get_detail_goods').post(checkToken.checkToken, mtblHangHoa.getDetailGoods);

    // Hàng hóa group 1
    var mtblHangHoaGroup1 = require('./controllers/hang-hoa-group1');
    app.route('/hnc/add_goods_group1').post(checkToken.checkToken, mtblHangHoaGroup1.addGoodsGroup1);
    app.route('/hnc/update_goods_group1').post(checkToken.checkToken, mtblHangHoaGroup1.updateGoodsGroup1);
    app.route('/hnc/delete_goods_group1').post(checkToken.checkToken, mtblHangHoaGroup1.deleteGoodsGroup1);
    app.route('/hnc/get_list_goods_group1').post(checkToken.checkToken, mtblHangHoaGroup1.getListGoodsGroup1);
    app.route('/hnc/get_groups_from_group1').post(checkToken.checkToken, mtblHangHoaGroup1.getGroupsFromGroup1);
    app.route('/hnc/add_goods_groups').post(checkToken.checkToken, mtblHangHoaGroup1.addGoodsGroups);

    // Hàng hóa group 2
    var mtblHangHoaGroup2 = require('./controllers/hang-hoa-group2');
    app.route('/hnc/add_goods_group2').post(checkToken.checkToken, mtblHangHoaGroup2.addGoodsGroup2);
    app.route('/hnc/update_goods_group2').post(checkToken.checkToken, mtblHangHoaGroup2.updateGoodsGroup2);
    app.route('/hnc/delete_goods_group2').post(checkToken.checkToken, mtblHangHoaGroup2.deleteGoodsGroup2);
    app.route('/hnc/get_list_goods_group2').post(checkToken.checkToken, mtblHangHoaGroup2.getListGoodsGroup2);

    // Hàng hóa group 3
    var mtblHangHoaGroup3 = require('./controllers/hang-hoa-group3');
    app.route('/hnc/add_goods_group3').post(checkToken.checkToken, mtblHangHoaGroup3.addGoodsGroup3);
    app.route('/hnc/update_goods_group3').post(checkToken.checkToken, mtblHangHoaGroup3.updateGoodsGroup3);
    app.route('/hnc/delete_goods_group3').post(checkToken.checkToken, mtblHangHoaGroup3.deleteGoodsGroup3);
    app.route('/hnc/get_list_goods_group3').post(checkToken.checkToken, mtblHangHoaGroup3.getListGoodsGroup3);

    // price
    var mtblprice = require('./controllers/price');
    app.route('/hnc/add_price').post(checkToken.checkToken, mtblprice.addPrice);
    app.route('/hnc/update_price').post(checkToken.checkToken, mtblprice.updatePrice);
    app.route('/hnc/delete_price').post(checkToken.checkToken, mtblprice.deletePrice);
    app.route('/hnc/get_list_price').post(checkToken.checkToken, mtblprice.getListPrice);

    // link get price chưa test
    var mtbllinkgetprice = require('./controllers/link-get-price');
    app.route('/hnc/add_link_get_price').post(checkToken.checkToken, mtbllinkgetprice.addLinkGetPrice);
    app.route('/hnc/update_link_get_price').post(checkToken.checkToken, mtbllinkgetprice.updateLinkGetPrice);
    app.route('/hnc/delete_link_get_price').post(checkToken.checkToken, mtbllinkgetprice.deleteLinkGetPrice);
    app.route('/hnc/get_list_link_get_price').post(checkToken.checkToken, mtbllinkgetprice.getListLinkGetPrice);

    // menu
    var mNhomHangHoa = require('./controllers/nhom-hang-hoa')
    app.route('/hnc/update_group').post(checkToken.checkToken, mNhomHangHoa.updateGroup);

    // import_file
    var mImportFile = require('./controllers/import_file')
    app.route('/hnc/import_file').post(checkToken.checkToken, mImportFile.importFile);

    // scan_price
    var mScanPrice = require('./controllers/scan')
    app.route('/hnc/search_goods').post(checkToken.checkToken, mScanPrice.functionSearchGoods);
    app.route('/hnc/scan_price').post(checkToken.checkToken, mScanPrice.functionScanPrice);

}