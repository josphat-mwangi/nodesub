const Mongodb = require("./db");

const paypal = require('paypal-rest-sdk');

// paypal auth configuration

const config = {
  "port" : 5000,
  "api" : {

    "host" : "api.sandbox.paypal.com",

    "port" : "",            

    "client_id" : process.env.CLIENT_ID, 

    "client_secret" : process.env.CLIENT_SECRET 

  }

}

paypal.configure(config.api);


 
const self={

    isUserExists:(data,callback)=>{

        const response={};

        Mongodb.onConnect(function(db,ObjectID){

            db.collection('user').findOne(data,function(err, result){

            if(result != null ){

                response.process = "success";

                response.isUserExists = true;

                response.id = result._id;

                response.name = result.name;

            }else{

                response.process = "failed";

                response.isUserExists = false;

            }

            callback(response);

            });

            });

    },

    insertPayment:(data,callback)=>{

        const response={};

        Mongodb.onConnect(function(db,ObjectID){

            db.collection('payments').insertOne(data,function(err, result) {

                if(err){

                    response.isPaymentAdded = false;

                    response.message = "Something went Wrong,try after sometime.";

                }else{

                    response.isPaymentAdded = true;

                    response.id=result.ops[0]._id;

                    response.message = "Payment added.";

                }

                callback(response);     

            });

        });

    },

    getSubscriptionInfo:function(data,callback){

        const response={};

        Mongodb.onConnect(function(db,ObjectID){

            data._id = new ObjectID(data._id);

            db.collection('subscription').findOne(data,function(err, result){
                if(result != null ){

                    response.error = false;

                    response.data = result;

                }else{

                    response.error = true;

                }

                    callback(response);

            });

        });

    },

    getAllSubscription:function(data,callback){

        Mongodb.onConnect(function(db,ObjectID){

            db.collection('subscription').find().toArray(function(err, result){

                callback(result);

                db.close();

            });

        });

    },

    payNow:function(paymentData,callback){

        let response ={};

    

    /* Creating Payment JSON for Paypal starts */

        const payment = {

            "intent": "authorize",

            "payer": {

            "payment_method": "paypal"

        },

        "redirect_urls": {

            "return_url": "http://127.0.0.1:81/execute",

            "cancel_url": "http://127.0.0.1:81/cancel"

        },

        "transactions": [{

            "amount": {

                "total": paymentData.data.price,

                "currency": "USD"

            },

            "description": paymentData.data.name

        }]

    };

    /* Creating Payment JSON for Paypal ends */

    /* Creating Paypal Payment for Paypal starts */

    paypal.payment.create(payment, function (error, payment) {

    if (error) {

    console.log(error);

    } else {

        if(payment.payer.payment_method === 'paypal') {

        response.paymentId = payment.id;

        var redirectUrl;

        response.payment = payment;

        for(var i=0; i < payment.links.length; i++) {

        var link = payment.links[i];

        if (link.method === 'REDIRECT') {

        redirectUrl = link.href;

        }

        }

        response.redirectUrl = redirectUrl;

        }

        }

        /*

        * Sending Back Paypal Payment response

        */

        callback(error,response);

    });

    /* Creating Paypal Payment for Paypal ends */

    },

    getResponse:function(data,PayerID,callback){

        let response = {};

        const serverAmount = parseFloat(data.paypalData.payment.transactions[0].amount.total);

        const clientAmount = parseFloat(data.clientData.price);

        const paymentId = data.paypalData.paymentId;

        const details = {

            "payer_id": PayerID

        };

        response.userData= {

            userID : data.sessionData.userID,

            name : data.sessionData.name

        };

        if (serverAmount !== clientAmount) {

        response.error = true;

        response.message = "Payment amount doesn't matched.";

        callback(response);

        } else{

            paypal.payment.execute(paymentId, details, function (error, payment) {

                if (error) {

                console.log(error);

                response.error = false;

                response.message = "Payment Successful.";

                callback(response);

                } else {

                /*

                * inserting paypal Payment in DB

                */
                    const insertPayment={

                        userId : userId,

                        paymentId : paymentId,

                        createTime : payment.create_time,

                        state : payment.state,

                        currency : "USD",

                        amount: serverAmount,

                        createAt : new Date().toISOString()

                    }

                    self.insertPayment(insertPayment,function(result){

                        if(! result.isPaymentAdded){

                            response.error = true;

                            response.message = "Payment Successful, but not stored.";

                            callback(response);

                        }else{

                            response.error = false;

                            response.message = "Payment Successful.";

                            callback(response);

                        };

                    });

                };

            });

        };

    }

}

module.exports = self;