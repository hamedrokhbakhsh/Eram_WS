var express = require('express');
var router = express.Router();
var app = require('../app').con;
var db = require('../public/db');
var sql = require('mssql');
var Status;

router.post('/', function (req, res, next) {
    var Message = req.body.message;
    var Phone = req.body.phone;

    var qryStr =
        "SELECT [TokenKey] FROM [app].[MobileDeviceInfo] " +
        "WHERE (NOT ([TokenKey] IS NULL)) AND (PhoneNumber = \'%s\') ";

    var registrationToken = [];

    var payload = {
        data: {
            score: "850",
            time: "2:45",
            message: Message,
            type: "2"
        }
    };

    sql.connect(db, function (err) {
        var request = new sql.Request();

        request.query(util.format(qryStr, Phone), function (err, recordset) {

            if (err) {
                res.send({status: false, "errmessage": err});
                sql.close();
                res.end();
                return;
            }
            if (recordset.rowsAffected.length > 0) {

                registrationToken = recordset.recordset[0].TokenKey.toString();

                admin.messaging().sendToDevice(registrationToken, payload)
                    .then(function (response) {
                        console.log("Successfully sent message:", response);
                    })
                    .catch(function (error) {
                        console.log("Error sending message:", error);
                    });

                res.send({status: true, "errmessage": ""});
                sql.close();
                res.end();
                return;
            }
        });
    });

});
module.exports = router;