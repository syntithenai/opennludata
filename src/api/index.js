
const commitSkill = require('./commitSkill');
const express = require('express');
const bodyParser= require('body-parser')
const cookieParser = require('cookie-parser');
var session = require('express-session')
require('dotenv').config()
let config = require('./config');
const path = require('path');
const fs = require('fs'),
    http = require('http'),
    https = require('https')
var flash = require('connect-flash');
var md5 = require('md5');
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const restify = require('express-restify-mongoose')
var cors = require('cors')

mongoose.connect(config.databaseConnection+config.database, {useNewUrlParser: true})

const {skillsSchema, skillTagsSchema, entitiesSchema, utterancesSchema, regexpsSchema} = require('./schemas')


var loginSystem = require('express-oauth-login-system-server')

loginSystem(config).then(function(login) {
    const loginRouter = login.router
    const authenticate = login.authenticate
    const csrf = login.csrf
    var router = express.Router();
    
    
    function checkMedia(req,res,next) {
        let cookie = req.cookies['access-token'] ? req.cookies['access-token']  : '';
        let parameter = req.query._media ? req.query._media : (req.body._media ? req.body._media : '')
        if (md5(cookie) === parameter) {
            next()
        } else {
            res.send({error:'media check failed'})
        }
    }

    // use media authentication with cookie and req parameter because media element cannot send auth in header.
    router.use('/api/protectedimage',cors(),csrf.checkToken, checkMedia,function (req,res) {
        const stream = fs.createReadStream(__dirname + '/lock.jpg')
        stream.pipe(res)
    });


    router.use('/api/csrfimage',cors(),csrf.checkToken,function (req,res) {
        const stream = fs.createReadStream(__dirname + '/protect.jpg')
        stream.pipe(res)
    });

    // An api endpoint that returns a short list of items
    router.use('/api/getlist',cors(), authenticate, (req,res) => {
        var list = ["item1", "item2", "item3"];
        res.send([{items:list}]);
    });

    var options = {
        findOneAndUpdate: false,
        allowRegexp: false,
         // only owners can create and update
        preCreate: (req, res, next) => {
            var loginUser = res.locals && res.locals.oauth && res.locals.oauth.token && res.locals.oauth.token.user ? res.locals.oauth.token.user : {}
            if (loginUser && loginUser._id) { 
                req.body.created_date = new Date().getTime();
                req.body.updated_date = new Date().getTime();
                req.body.user = loginUser._id
                req.body.userAvatar = loginUser.avatar
                console.log(['PRECREATE ',req.body.tags])
                if (req.body.tags) {
                    skillTagModel = mongoose.model('SkillTags',skillTagsSchema)
                    skillTagModel.insertMany(req.body.tags.map(function(tag) { return {tag:tag}  }), {ordered: true}).then(function(res) {
                      console.log(['INSERTED TAGS',res])  
                    })
                }
               
                next()
            } else {
                return res.sendStatus("401")
            }
        },
        
        preUpdate: (req, res, next) => {
            var loginUser = res.locals && res.locals.oauth && res.locals.oauth.token && res.locals.oauth.token.user ? res.locals.oauth.token.user : {}
            console.log(['PREUPDATE',loginUser])
            if (loginUser&& loginUser._id) { 
                req.body.updated_date = new Date().getTime();
                req.body.user = loginUser._id
                req.body.userAvatar = loginUser.avatar
                console.log(['PREUPDATE ',req.body.tags])
                if (req.body.tags) {
                    skillTagModel = mongoose.model('SkillTags',skillTagsSchema)
                    skillTagModel.insertMany(req.body.tags.map(function(tag) { return {tag:tag}  }), {ordered: true}).then(function(res) {
                      console.log(['INSERTED TAGS',res])  
                    })
                }
                //if ()
                
                next()
            } else {
                return res.sendStatus("401")
            }
        },
        
        preDelete: (req, res, next) => {
          var loginUser = res.locals && res.locals.oauth && res.locals.oauth.token && res.locals.oauth.token.user ? res.locals.oauth.token.user : {}
            console.log(['PREDELETE',loginUser])
            if (loginUser&& loginUser._id) { 
                next()
            } else {
                return res.sendStatus("401")
            }
        }, 

        postCreate: (req, res, next) => {
            const skill = req.erm.result         // unfiltered document or object
            const statusCode = req.erm.statusCode // 201

            commitSkill(skill).then(result => {
              console.log(result)
              next()
            }).catch(err => {
              console.error(err)
              next(err)
            })
        }, 
        
        postUpdate: (req, res, next) => {
          const skill = req.erm.result         // unfiltered document or object
          const statusCode = req.erm.statusCode // 200

          commitSkill(skill).then(result => {
              console.log(result)
              next()
            }).catch(err => {
              console.error(err)
              next(err)
            })
        },
        
        postDelete: (req, res, next) => {
          const result = req.erm.result         // unfiltered document or object
          const statusCode = req.erm.statusCode // 204
            
          //commitSkill({title:'testskill', user: '7687sdfwe76d7d', userAvatar:"westwing", intents:[{id: "873w27g7h908d", intent:'doit', example:'do it now please', entities:[]}]}).then(result => {
              //console.log(result)
              //next()
            //}).catch(err => {
              //console.error(err)
              //next(err)
            //})
        }
        

    }
    //var skillOptions = JSON.parse(JSON.stringify(options))
    //skill.options.pre
    
    var restifyRouter = express.Router();
    restify.serve(restifyRouter, mongoose.model('Skill',skillsSchema ), options)
    //restify.serve(restifyRouter, mongoose.model('Entities',entitiesSchema ), options)
    //restify.serve(restifyRouter, mongoose.model('Utterance',utterancesSchema ), options)
    //restify.serve(restifyRouter, mongoose.model('Regexp',regexpsSchema ), options)
    restify.serve(restifyRouter, mongoose.model('SkillTags',skillTagsSchema ), {
        preCreate: function(req,res,next) {return res.sendStatus("401")},
        preUpdate: function(req,res,next) {return res.sendStatus("401")},
        preDelete: function(req,res,next) {return res.sendStatus("401")}
    })
    // SSL
    // allow self generated certs
    //process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    //var options = {
        //key: fs.readFileSync('./key.pem'),
        //cert: fs.readFileSync('./certificate.pem'),
    //};

    //var webServer = https.createServer(options, app).listen(port, function(){
      //console.log("Express server listening on port " + port);
    //});
    const app = express();
    app.use(cors())
    app.use(methodOverride())
    app.use(bodyParser.json());
    app.use(cookieParser());
    // session required for twitter login
    app.use(session({ secret: config.sessionSalt ? config.sessionSalt : 'board GOAT boring do boat'}));
    app.use('/api/login',loginRouter);
    app.use(router);
    app.use('/public',cors(),restifyRouter);
    app.use("/",authenticate, cors(), restifyRouter);
    router.use('/',function(req,res,next) {
        console.log(['URL',req.url]); //,req.cookies,req.headers
        next()
    });

    router.get('/',cors(), (req, res) => {
      res.send('Hello World!')
    })


    //router.use('/api',function (req,res) {
        //console.log('API')
        //res.send({error:'Invalid request'})
    //});

    app.use(function (err, req, res, next) {
        console.log('ERR');
        console.log(err);
        res.sendStatus("500")
    });
    var options = {}
    let port=config.authServerPort ? String(parseInt(config.authServerPort))  : '5000'
    app.listen(port, () => {
      console.log(`opennludata listening at http://localhost:${port}`)
    })
})
