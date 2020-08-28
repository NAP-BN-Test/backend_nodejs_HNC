const Result = require('../constants/result');
const Constant = require('../constants/constant');
const Op = require('sequelize').Op;
var database = require('../database');
var mSysUser = require('../tables/tblSysUser');
let jwt = require('jsonwebtoken');

var mtblPrice = require('../tables/tblPrice')


module.exports = {
    login: (req, res) => {
        let body = req.body;

        database.connectDatabase().then(async db => {
            try {
                console.log(body);
                var data = await mSysUser(db).findOne({
                    include: [{
                        model: mtblPrice(db),
                    }],
                    where: { Username: body.userName, Password: body.passWord },
                })
                if (data) {
                    var obj = {
                        id: data.ID,
                        name: data.Name,
                        userName: data.UserName,
                        passWord: data.Password,
                        permission: data.Permission,
                        // list: data.tblPrices
                    }
                    payload = {
                        "Username": req.body.userName,
                        // standard fields
                        // - Xác thực người tạo
                        "iss": "Tungnn",
                    }
                    let token = jwt.sign(payload,
                        'abcdxys',
                        {
                            algorithm: "HS256",
                            expiresIn: '24h' // expires in 24 hours
                        }
                    );
                    var result = {
                        status: Constant.STATUS.SUCCESS,
                        message: '',
                        obj: obj,
                        token: token
                    }
                    res.json(result);
                } else {
                    res.json(Result.LOGIN_FAIL)

                }
            } catch (error) {
                res.json(Result.SYS_ERROR_RESULT)
            }
        }, error => {
            res.json(error)
        })
    },
    checkUser: async function (userID) {
        var db = await database.connectDatabase();
        try {
            var data = await mSysUser(db).findOne({ where: { ID: userID } })
            return Promise.resolve(data.Permission);
        } catch (error) {
            return Promise.reject(error)
        }
    },
    deleteUser: (req, res) => {
        let body = req.body;

        database.connectDatabase().then(async db => {

            try {
                let listIDJson = JSON.parse(body.listID);
                let listID = [];
                listIDJson.forEach(item => {
                    listID.push(Number(item + ""));
                });
                mSysUser(db).destroy({
                    where: {
                        ID: { [Op.in]: listID },
                    }
                });

                res.json(Result.ACTION_SUCCESS);

            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)

            }
        })
    },
    addUser: (req, res) => {
        let body = req.body;

        database.connectDatabase().then(async db => {

            try {
                var Permission = await mSysUser(db).findOne({
                    where: { ID: body.userID }
                });
                if (Permission) {
                    var result;
                    if (Permission.Permission == Constant.USER_ROLE.MANAGER) {
                        var userExist = await mSysUser(db).findOne({
                            where: { UserName: body.userName }
                        });
                        if (userExist) {
                            result = {
                                status: Constant.STATUS.FAIL,
                                message: Constant.MESSAGE.INVALID_USER
                            }
                            res.json(result);
                        } else {
                            var userCreate = await mSysUser(db).create({
                                Name: body.name,
                                UserName: body.userName,
                                Password: body.passWord,
                                Active: true,
                                GhiChu: body.ghiChu ? body.ghiChu : '',
                                Permission: body.permission ? body.permission : 1,
                            });
                            if (userCreate)
                                res.json(Result.ACTION_SUCCESS)
                            else
                                res.json(Result.INVALID_USER)
                        }
                    } else {
                        res.json(Result.NO_PERMISSION);

                    }
                } else {
                    res.json(Result.NO_PERMISSION);
                }
            } catch (error) {
                console.log(error);
                res.json(Result.SYS_ERROR_RESULT)
            }
        }).catch(() => {
            res.json(Result.SYS_ERROR_RESULT)
        })

    },
    updateUser: (req, res) => {
        let body = req.body;

        database.connectDatabase().then(async db => {
            let listUpdate = [];

            if (body.name || body.name === '')
                listUpdate.push({ key: 'Name', value: body.name });

            if (body.passWord || body.passWord === '')
                listUpdate.push({ key: 'Password', value: body.passWord });

            if (body.userName || body.userName === '')
                listUpdate.push({ key: 'UserName', value: body.userName });

            if (body.active || body.active === '')
                listUpdate.push({ key: 'Active', value: body.active });

            if (body.ghiChu || body.ghiChu === '')
                listUpdate.push({ key: 'GhiChu', value: body.ghiChu });

            if (body.permission || body.permission === '')
                listUpdate.push({ key: 'Permission', value: body.permission });

            let update = {};
            for (let field of listUpdate) {
                update[field.key] = field.value
            }
            mSysUser(db).update(update, { where: { ID: body.id } }).then(data => {
                res.json(Result.ACTION_SUCCESS)
            }).catch(err => {
                res.json(Result.SYS_ERROR_RESULT);
            })
        })
    },
    // get_list_user 
    getListUser: (req, res) => {
        let body = req.body;
        database.connectDatabase().then(async db => {
            let where = {};
            let whereSearch = [];
            if (body.searchKey) {
                whereSearch = [
                    { Name: { [Op.like]: '%' + body.searchKey + '%' } },
                    { UserName: { [Op.like]: '%' + body.searchKey + '%' } }
                ];
            } else {
                whereSearch = [
                    { Name: { [Op.like]: '%' + '' + '%' } },
                ];
            }
            where = {
                [Op.or]: whereSearch,
            }
            var count = await mSysUser(db).count({ where: where });
            console.log(where);
            var array = [];
            var itemPerPage = 10000;
            var page = 1;
            if (body.itemPerPage) {
                itemPerPage = Number(body.itemPerPage);
                if (body.page)
                    page = Number(body.page);
            }
            await mSysUser(db).findAll({
                where: where,
                order: [['ID', 'DESC']],
                offset: itemPerPage * (page - 1),
                limit: itemPerPage
            }).then(data => {
                data.forEach(elm => {
                    array.push({
                        id: elm.ID,
                        name: elm.Name,
                        userName: elm.UserName,
                        passWord: elm.Password,
                        active: elm.Active,
                        ghiChu: elm.GhiChu ? elm.GhiChu : '',
                        permission: elm.Permission ? elm.Permission : 1,
                    })
                })
            })

            var result = {
                status: Constant.STATUS.SUCCESS,
                message: '',
                array: array,
                count: count,
            }
            res.json(result)
        })
    }

}