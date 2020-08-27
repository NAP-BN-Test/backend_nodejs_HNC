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

    // Hàng hóa group 1
    var mtblHangHoaGroup1 = require('./controllers/hang-hoa-group1');
    app.route('/hnc/add_goods_group1').post(checkToken.checkToken, mtblHangHoaGroup1.addGoodsGroup1);
    app.route('/hnc/update_goods_group1').post(checkToken.checkToken, mtblHangHoaGroup1.updateGoodsGroup1);
    app.route('/hnc/delete_goods_group1').post(checkToken.checkToken, mtblHangHoaGroup1.deleteGoodsGroup1);
    app.route('/hnc/get_list_goods_group1').post(checkToken.checkToken, mtblHangHoaGroup1.getListGoodsGroup1);

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

}