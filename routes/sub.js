const router = require('express').Router();
const plan = require('../module/Subscription');
const helper = require('../helper');
const verify = require('./privateroute.js')

const routes =()=>{


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

        if (typeof sessionInfo == "undefined" || sessionInfo=="") {

            res.redirect("/");

            res.end();

        } else{

            let response ={};

            const data={

                _id : sessionInfo

            };

            /*

            * Fetching subscription and showing onto home page

            */

            helper.getAllsubscription(data,(subscription)=>{

                response.subscription = subscription;

                response.userData = {

                    name : sessionInfo

                };

                res.render('home',{

                    response : response

                });

            });

        }

    });

    router.post('/paynow', verify, (req, res)=>{

        sessionInfo = req.user;

        if (typeof sessionInfo == "undefined" || sessionInfo=="") {

            res.redirect("/");

            res.end();

        } else{

            const data ={

                userID : sessionInfo,

                data : req.body

            }

            /*

            * call to paynow helper method to call paypal sdk

            */

            helper.payNow(data,(error,result)=>{

                if(error){

                    res.writeHead(200, {'Content-Type': 'text/plain'});

                    res.end(JSON.stringify(error));

                }else{

                    paypalData = result;

                    clientData = req.body;

                    res.redirect(result.redirectUrl);

                }

            });

        }

    });

    /*

    * payment success url

    */
    helper.getAllsubscription(data,(subscription)=>{

        response.subscription= subscription;

        response.userData = {

            _id : sessionInfo

        };

        res.render('home',{

            response : response

        });

    });
    router.get('/execute', verify, (req, res)=>{

        sessionInfo = req.user;

        let response = {};

        const PayerID = req.query.PayerID;

        if (typeof sessionInfo == "undefined" || sessionInfo=="") {

            res.redirect("/");

            res.end();

        } else{

            sessionInfo.state ="success";

            helper.getResponse(sessionInfo,PayerID,(response)=> {

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

        if (typeof sessionInfo == "undefined" || sessionInfo=="") {

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


    
 
}



module.exports =router;
