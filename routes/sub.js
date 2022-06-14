const router = require('express').Router();
const plan = require('../module/subscription');
const helper = require('./helper');
const verify = required('./sub.js')

const routes =(app)=>{


    router.get('/', verify, (req, res)=>{
        sessionInfo = req.user;
        
        if (typeof sessionInfo.sessionData == "undefined" || sessionInfo.sessionData=="") {
        
            res.render("index");
        
        }else{
        
            res.redirect("/home");
            
            res.end();
        
        }
            
        
    });

    router.get('/home', verify, (req, res)=>{

        sessionInfo = req.user;

        if (typeof sessionInfo.sessionData == "undefined" || sessionInfo.sessionData=="") {

            res.redirect("/");

            res.end();

        } else{

            let response ={};

            const data={

                _id : sessionInfo.sessionData.userID

            };

            /*

            * Fetching subscription and showing onto home page

            */

            helper.getAllsubscription(data,(products)=>{

                response.products = products;

                response.userData = {

                    name : sessionInfo.sessionData.name

                };

                res.render('home',{

                    response : response

                });

            });

        }

    });

    router.post('/paynow', verify, (req, res)=>{

        sessionInfo = req.user;

        if (typeof sessionInfo.sessionData == "undefined" || sessionInfo.sessionData=="") {

            res.redirect("/");

            res.end();

        } else{

            const data ={

            userID : sessionInfo.sessionData.userID,

            data : req.body

            }

            /*

            * call to paynow helper method to call paypal sdk

            */

            helper.payNow(data,function(error,result){

                if(error){

                    res.writeHead(200, {'Content-Type': 'text/plain'});

                    res.end(JSON.stringify(error));

                }else{

                    sessionInfo.paypalData = result;

                    sessionInfo.clientData = req.body;

                    res.redirect(result.redirectUrl);

                }

            });

        }

    });

    /*

    * payment success url

    */
    helper.getAllsubscription(data,function(products){

        response.products = products;

        response.userData = {

            name : sessionInfo.sessionData.name

        };

        res.render('home',{

            response : response

        });

    });
    router.get('/execute', verify, (req, res)=>{

        sessionInfo = req.user;

        let response = {};

        const PayerID = req.query.PayerID;

        if (typeof sessionInfo.sessionData == "undefined" || sessionInfo.sessionData=="") {

            res.redirect("/");

            res.end();

        } else{

            sessionInfo.state ="success";

            helper.getResponse(sessionInfo,PayerID,function(response) {

                res.render('executePayement',{

                response : response

                });

            });

        };

    });

    /*

    * payment cancel url

    */

    router.get('/cancel', verify, (req, res)=>{

        sessionInfo = req.user;

        if (typeof sessionInfo.sessionData == "undefined" || sessionInfo.sessionData=="") {

            res.redirect("/");

            res.end();

        } else{

            let response ={};

            response.error = true;

            response.message = "Payment unsuccessful.";

            response.userData = {

                name : sessionInfo.sessionData.name

            };

            res.render('executePayement',{

                response : response

            });

        }

    });


    router.get('/logout',(req, res)=>{

        req.session.sessionData = "";

        res.redirect("/");

    });
 
}

method.getroutes=function(){

return this;

}

module.exports =router;
