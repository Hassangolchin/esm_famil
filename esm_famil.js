const Bot = require('telegram-bot-manager');
const bot = new Bot('468320808:AAG1ZdQ2dfHCc75lsW-_wwxq6Kr8MhVEno8');
const express = require('express');
const mongoose = require('mongoose');
const app = express();

/////////////////////////////////////////////////////////////////////

mongoose.connect("mongodb://localhost/esm_famili");
let db = mongoose.connection;
db.on('error' , function () {
   console.log('mongodb disconnect')
});
db.once('connected',function () {
    console.log('mongodb connect')
});
/////////////////////////////////////////////////////////////////////
const strs = {
    main_menu:{
       profile: 'پروفایل',
        opinion: 'نظر سنجی',
        accident_game:'بازی تصادفی',
        other_game:'بازی های دیگر',
        add_username:'اضافه کردن نام کاربری',
        main_menu:'منو اصلی',
        your_profile:'پروفایل شما',
        team_game:'بازی تیمی',
        VIP:'وی ای پی',
        rating:'رده بندی',
        custom_game:'بازی شخصی سازی شده',
        join:'عضویت',
        unlimited_game:'بازی بدون محدودیت',
        custom_vip_game:'بازی شخصی سازی شده 10 نفره',
        idk:'نمیدونم',
        help:'کمک',
        stop:'استپ'
    }
};

const text = {
    invalid:'متن شما قابل فهم نیست',
    welcome:'به بات اسم فامیل خوش امدید',
    empty:'خالی',
    add_your_username:'لطفا نام کاربری خود را وارد کنید',
    save_your_username:'نام کاربری شما دخیره شد',
    laugh:':D',
    join_vip:'شما وارد vip شدید',
    link:'برای عضویت در vip باید لینک زیر را برای 5 تا از دوستان خود ارسال کنید',
    in_process:'در حال اتصال به بازی کن تصادفی...',
    begin:'شروع',
    name_with:'اسم با حرف',
    last_name_with:'فامیلی با حرف',
    color_with:'رنگ با حرف',
    food_with:'غذا با حرف',
    city_with:'شهر با حرف',
    country_with:'کشور با حرف',
    car_with:'ماشین با حرف',
    flower_with:'گل با حرف',
    animal_with:'حیوان با حرف',
    organ_with:'اعضای بدن با حرف',
    things_with:'اشیا با حرف',
    fruit_with:'میوه با حرف',
    idk0point:'نمیدونم 0 امتیاز',
    you_dont_have_enough_coin:'شما به اندازه کافی سکه ندارید',
    end_game:'بازی تمام شد'+'\n'+ 'برای توقف بازی روی دکمه استپ بزنید',
};

/////////////////////////////////////////////////////////////////////

let user = new mongoose.Schema({
    counter:{
        type:Number,
        default:0,
    },
    own_name:String,
    own_last_name:String,
    name:String,
    username:String,
    vip:String,
    user_id:Number,
    rating:[{}],
    point:{
        type:Number,
        default:0
    },
    coin:{
        type:Number,
        default:10
    },
    temp:String,
    level:{
        type:String,
        default:'begin'
    },
    fake_point:[{}],
    message_id:Number,
    callback:Number,
    first_name:String,
    last_name:String,
    color:String,
    food:String,
    city:String,
    country:String,
    car:String,
    flower:String,
    animal:String,
    organ:String,
    things:String,
    fruit:String,
});
let lobby = new mongoose.Schema({
    name:String,
    full:{
        type:Boolean,
        default:false
    },
    members:[{
        object_id:Object,
        user_id:Number,
    }],
    capacity: {
        type:Number,
        default:2
    },
    deleted:{
        type: Boolean,
        default: false
    },
    alphabet:String,
    end_name:String,
});
let main = new mongoose.Schema({
    first_name:['ارمین','ارزو',"بهمن","بهراد"],
    last_name:["ارمینی"],
    color:["ابی"],
    food:["اش"],
    city:["اذربایجان"],
    country:["المان"],
    car:["ازرا"],
    flower:["ارغوانی"],
    animal:["اهو"],
    organ:["اشل"],
    things:["اش پ"],
    fruit:["اب"],
    name:String,
});
let servey = new mongoose.Schema({
    user_id:Number,
    opinoin:[{
        message_id:[{
            like:String,
            dislike:String
        }]
    }],
    name:String,
});
let alllobby = new mongoose.Schema({
   accident_game:[],
    name:String,
});

let usermodelalllobby = mongoose.model('all_lobbies',alllobby);
let usermodellobby = mongoose.model('lobbies',lobby);
let usermodeluser = mongoose.model('users',user);
let usermodelmain = mongoose.model('mains',main);
let usermodelservey = mongoose.model('servey',servey);

//////////////////////////////////////////////////////////////////////

let update_id = 0;
let memcache_key = "vCH1vGWJxfSeofSAs0K5PA";

//////////////////////////////////////////////////////////////////////

let runningbot = setInterval(()=>{
    bot.getUpdates({offset:update_id})
        .then((pm) => {
            pm['result'].forEach((update) => {
                update_id = update['update_id'] + 1;
                // console.log(update['inline_query']);
                if(!update['callback_query'] && !update['inline_query']){
                    process(update);
                }
                else if(!update['inline_query']){
                    callback(update);
                }
                else{
                    inline(update);
                }
            });
        })
},5000);

///////////////////////////////////////////////////////////////////////

function process(update) {
    usermodeluser.findOne({user_id:update['message']['chat']['id']},(err, res) => {
        if(err){
            throw err;
        }
        else{
            if(res === null){
                let user = new usermodeluser({
                    own_name:update['message']['chat']['first_name'],
                    own_last_name:update['message']['chat']['last_name'],
                    user_id:update['message']['chat']['id'],
                    first_name:'0',
                    last_name:'0',
                    color:'0',
                    food:'0',
                    city:'0',
                    country:'0',
                    car:'0',
                    flower:'0',
                    animal:'0',
                    organ:'0',
                    things:'0',
                    fruit:'0',
                });
                user.save((err, res) =>{
                    if(err){
                        throw err;
                    }
                    else{
                        level_process(update, res);
                    }
                });
            }
            else{
                level_process(update, res);
            }
        }
    });
}

//////////////////////////////////////////////////////////////////////

function level_process(update, res) {
    if(update['message']['text'] === '/start'){
        start(update, res);
    }
    else if(res['level'] === 'menu'){
        if(update['message']['text'] === strs.main_menu.profile){
            profile(update, res);
        }
        else if(update['message']['text'] === strs.main_menu.other_game){
            game(update, res);
        }
        else if(update['message']['text'] === strs.main_menu.opinion){
            // inline(update, res);
        }
        else if(update['message']['text'] === strs.main_menu.accident_game){
            accident_game(update, res);

        }
        else{
            bot.sendMessage({
                chat_id:res['user_id'],
                text:text.invalid
            });
        }
    }
    else if(res['level'] === 'profile'){
        if(update['message']['text'] === strs.main_menu.add_username){
            profile2(update, res);
        }
        else if(update['message']['text'] === strs.main_menu.main_menu){
            menu(update, res);
        }
        else if(update['message']['text'] === strs.main_menu.your_profile){
            view_profile(update, res);
        }
        else{
            bot.sendMessage({
                chat_id:res['user_id'],
                text:text.invalid
            });
        }
    }
    else if(res['level'] === 'profile2'){
        profile3(update, res);
    }
    else if(res['level'] === 'game'){
        if(update['message']['text'] === strs.main_menu.team_game){
            team_game(update, res);
        }
        else if(update['message']['text'] === strs.main_menu.VIP){
            VIP(update, res);
        }
        else if(update['message']['text'] === strs.main_menu.rating){
            rating(update, res);
        }
        else if(update['message']['text'] === strs.main_menu.custom_game){

        }
        else if(update['message']['text'] === strs.main_menu.main_menu){
            menu(update, res);
        }
        else{
            bot.sendMessage({
                chat_id:res['user_id'],
                text:text.invalid
            });
        }
    }
    else if(res['level'] === 'vip'){
        add_vip(update, res);
    }
    else if(res['level'] === 'accident_game2'){
        accident_game2(update, res);
    }
    else if(res['level'] === 'accident_game3'){
        accident_game3(update, res);
    }
    else if(res['level'] === 'accident_game4'){
        accident_game4(update, res);
    }
    else if(res['level'] === 'accident_game5'){
        accident_game5(update, res);
    }
    else if(res['level'] === 'accident_game6'){
        accident_game6(update, res);
    }
    else if(res['level'] === 'accident_game7'){
        accident_game7(update, res);
    }
    else if(res['level'] === 'accident_game8'){
        accident_game8(update, res);
    }
    else if(res['level'] === 'accident_game9'){
        accident_game9(update, res);
    }
    else if(res['level'] === 'accident_game10'){
        accident_game10(update, res);
    }
    else if(res['level'] === 'accident_game11'){
        accident_game11(update, res);
    }
    else if(res['level'] === 'accident_game12'){
        accident_game12(update, res);
    }
    else if(res['level'] === 'accident_game13'){
        accident_game13(update, res);
    }
    else if(res['level'] === 'accident_game14'){
        accident_game14(update, res);
    }
}

/////////////////////////////////////////////////////////////////////////
// +'\t'+'telegram.me/esme_famile_bot?start'
function start(update, res) {
    usermodeluser.findOne({user_id:res['user_id']}, (err, res) => {
        if(err){
            throw err;
        }
        else{
            bot.sendMessage({
                chat_id:res['user_id'],
                text: text.welcome,
                reply_markup:{
                    keyboard:[
                        [{text:strs.main_menu.profile},{text:strs.main_menu.other_game}],[{text:strs.main_menu.opinion}, {text:strs.main_menu.accident_game}]
                    ],
                    resize_keyboard:true,
                    one_time_keyboard:true,
                    $wasForceClosed:true
                }
            });
            usermodeluser.update({user_id:res['user_id']}, {level:'menu'}, (err, res) => {
                if(err){
                    throw err;
                }
            });
        }
    });
}

//////////////////////////////////////////////////////////////////////////

function menu(update, res) {
    usermodeluser.findOne({user_id:res['user_id']}, (err, res) => {
        if(err){
            throw err;
        }
        else{
            bot.sendMessage({
                chat_id:res['user_id'],
                text:text.laugh,
                reply_markup:{
                    keyboard:[
                        [{text:strs.main_menu.profile},{text:strs.main_menu.other_game}],[{text:strs.main_menu.opinion}, {text:strs.main_menu.accident_game}]
                    ],
                    resize_keyboard:true,
                    one_time_keyboard:true
                }
            });
            usermodeluser.update({user_id:res['user_id']}, {level:'menu'}, (err, res) => {
                if(err){
                    throw err;
                }
            });
        }
    });
}

///////////////////////////////////////////////////////////////////////////

function profile(update, res) {
    usermodeluser.findOne({user_id:res['user_id']}, (err, res) => {
        if(err){
            throw  err;
        }
        else{
            if(res['username'] === undefined){
                bot.sendMessage({
                    chat_id:res['user_id'],
                    text:text.laugh+'\t'+'telegram.me/esme_famile_bot?start='+memcache_key,
                    reply_markup:{
                        keyboard:[
                            [{text:strs.main_menu.add_username}, {text:strs.main_menu.your_profile}],
                            [{text:strs.main_menu.main_menu}]
                        ],
                        resize_keyboard:true,
                        one_time_keyboard:true
                    }
                });
                usermodeluser.update({user_id:res['user_id']}, {level:'profile'}, (err, res) => {
                    if(err){
                        throw err;
                    }
                });
            }
            else{
                if(res['vip'] === undefined){
                    res['vip'] = text.empty
                }
                let temp = 'پروفایل شما:';
                temp = temp + '\n'+'\n';
                temp = temp+'1' + '-' +'نام کاربری'+':'+ res['username'] +'\n'+ '2' + ' - ' +'امتیاز'+':'+ res['point']+'\n'+ '3' + ' - ' +'سکه'+':'+ res['coin']+'\n'+ '4' + ' - ' +'وی ای پی'+':'+ res['vip']+'\n';
                bot.sendMessage({
                    chat_id:res['user_id'],
                    text:temp,
                    reply_markup:{
                        keyboard:[
                            [{text:strs.main_menu.profile},{text:strs.main_menu.other_game}],[{text:strs.main_menu.opinion}, {text:strs.main_menu.accident_game}]
                        ],
                        resize_keyboard:true,
                        one_time_keyboard:true
                    }
                });
                usermodeluser.update({user_id:res['user_id']}, {level:'menu'}, (err, res) => {
                    if(err){
                        throw err;
                    }
                });
            }
        }
    });
}

//////////////////////////////////////////////////////////////////////////////

function profile2(update, res) {
    usermodeluser.findOne({user_id:res['user_id']}, (err, res) => {
        if(err){
            throw err;
        }
        else{
            bot.sendMessage({
                chat_id:res['user_id'],
                text:text.add_your_username
            });
            usermodeluser.update({user_id:res['user_id']}, {level:'profile2'}, (err, res) => {
                if(err){
                    throw err;
                }
            });
        }
    });
}

///////////////////////////////////////////////////////////////////////////////

function profile3(update, res) {
    usermodeluser.findOne({user_id:res['user_id']}, (err, res) => {
        if(err){
            throw err;
        }
        else{
            res['username'] = update['message']['text'];
            res.save((err, rese) => {
                if(err){
                    throw err;
                }
                else{
                    bot.sendMessage({
                        chat_id:res['user_id'],
                        text:text.save_your_username,
                        reply_markup:{
                            keyboard:[
                                [{text:strs.main_menu.profile},{text:strs.main_menu.other_game}],[{text:strs.main_menu.opinion}, {text:strs.main_menu.accident_game}]
                            ],
                            resize_keyboard:true,
                            one_time_keyboard:true
                        }
                    });
                    usermodeluser.update({user_id:res['user_id']}, {level:'menu'}, (err, res) => {
                        if(err){
                            throw err;
                        }
                    });
                }
            });
        }
    });
}

//////////////////////////////////////////////////////////////////////////////

function view_profile(update, res) {
    usermodeluser.findOne({user_id:res['user_id']}, (err, res) => {
        if(err){
            throw err;
        }
        else{
            if(res['vip'] === undefined){
                res['vip'] = text.empty
            }
            if(res['username'] === undefined){
                res['username'] = text.empty
            }
            let temp = 'پروفایل شما:';
            temp = temp + '\n'+'\n';
            temp = temp+'1' + '-' +'نام کاربری'+' : '+ res['username'] +'\n'+ '2' + ' - ' +'امتیاز'+' : '+ res['point']+'\n'+ '3' + ' - ' +'سکه'+' : '+ res['coin']+'\n'+ '4' + ' - ' +'وی ای پی'+' : '+ res['vip']+'\n'+'\n';
            bot.sendMessage({
                chat_id:res['user_id'],
                text:temp,
                reply_markup:{
                    keyboard:[
                        [{text:strs.main_menu.profile},{text:strs.main_menu.other_game}],[{text:strs.main_menu.opinion}, {text:strs.main_menu.accident_game}]
                    ],
                    resize_keyboard:true,
                    one_time_keyboard:true
                }
            });
            usermodeluser.update({user_id:res['user_id']}, {level:'menu'}, (err, res) => {
                if(err){
                    throw err;
                }
            });
        }
    });
}

///////////////////////////////////////////////////////////////////////////////

function game(update, res) {
    usermodeluser.findOne({user_id:res['user_id']}, (err, res) => {
        if(err){
            throw err;
        }
        else{
            bot.sendMessage({
                chat_id:res['user_id'],
                text:text.laugh,
                reply_markup:{
                    keyboard:[
                        [{text:strs.main_menu.team_game},{text: strs.main_menu.custom_game}], [{text: strs.main_menu.VIP}, {text: strs.main_menu.rating}], [{text:strs.main_menu.main_menu}]
                    ],
                    resize_keyboard:true,
                    one_time_keyboard:true
                }
            });
            usermodeluser.update({user_id:res['user_id']}, {level:'game'}, (err, res) => {
                if(err){
                    throw err;
                }
            });
        }
    });
}

//////////////////////////////////////////////////////////////////////////////////////

function accident_game(update, res) {
    usermodeluser.update({user_id:res['user_id']},{level:'accident_game2'},(err, res) => {
        if(err){
            throw err;
        }
    });
    usermodeluser.findOne({user_id: res['user_id']}, (err, reso) => {
        if (err) {
            throw err;
        }
        else {
            usermodelalllobby.findOne({name:res['name']}, (err, resl) => {
                if(err){
                    throw err;
                }
                else {
                    if (resl === null) {
                        let alllobby = new usermodelalllobby({});
                        alllobby.save((err, res) => {
                            if (err) {
                                throw err;
                            }
                        });
                    }
                    usermodelmain.findOne({name: res['name']}, (err, re) => {
                        if (err) {
                            throw err;
                        }
                        else {
                            usermodelalllobby.update({name:reso['name']}, {$push: {accident_game:reso['_id']}}, (err, resb) => {
                                if (err) {
                                    throw err;
                                }
                            });
                            if (re === null) {
                                let main = new usermodelmain({
                                    first_name: ['ارمین', 'ارزو', "بهمن", "بهراد"],
                                    last_name: ["ارمینی"],
                                    color: ["ابی"],
                                    food: ["اش"],
                                    city: ["اذربایجان"],
                                    country: ["المان"],
                                    car: ["ازرا"],
                                    flower: ["ارغوانی"],
                                    animal: ["اهو"],
                                    organ: ["اشل"],
                                    things: ["اش پ"],
                                    fruit: ["اب"],
                                });
                                main.save();
                            }
                            else {
                                usermodellobby.findOne({name:res['name']}, (err, resa) => {
                                    if(err){
                                        throw err;
                                    }
                                    else{
                                        if(resa === null){
                                            bot.sendMessage({
                                                chat_id: reso['user_id'],
                                                text: text.in_process
                                            });
                                            let lobby = new usermodellobby({});
                                            lobby.save((err, resi) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    usermodellobby.findOne({members: resi['members']}, (err, rese) => {
                                                        if (err) {
                                                            throw err;
                                                        }
                                                        else {
                                                            usermodellobby.update({members: rese['members']}, {$push: {members: {user_id: reso['user_id'],object_id: reso['_id']}}}, (err, res) => {
                                                                if (err) {
                                                                    throw err;
                                                                }
                                                            }).then(() => {
                                                                usermodelalllobby.update({name:reso['name']}, {$pull: {accident_game:reso['_id']}}, (err, resb) => {
                                                                    if (err) {
                                                                        throw err;
                                                                    }
                                                                });
                                                            })
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        else if(resa['full'] === true){
                                            bot.sendMessage({
                                                chat_id: reso['user_id'],
                                                text: text.in_process
                                            });
                                            let lobby = new usermodellobby({});
                                            lobby.save((err, resi) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                else {
                                                    usermodellobby.findOne({members: resi['members']}, (err, rese) => {
                                                        if (err) {
                                                            throw err;
                                                        }
                                                        else {
                                                            usermodellobby.update({members: rese['members']}, {$push: {members: {user_id: reso['user_id'],object_id: reso['_id']}}}, (err, res) => {
                                                                if (err) {
                                                                    throw err;
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                        else if(resa['full'] === false){
                                            usermodelalllobby.findOne({name:res['name']}, (err, resf) => {
                                                if(err){
                                                    throw err;
                                                }
                                                else {
                                                    let randomnumber = Math.floor(Math.random()*32);
                                                    randomm(resf['accident_game'].length)
                                                        .then((rr) => {
                                                            let number = resf['accident_game'][rr];
                                                            resf['accident_game'].forEach((qq) => {
                                                                if (qq === number) {
                                                                    usermodellobby.findOne({members: resa['members']}, (err, rese) => {
                                                                        if (err) {
                                                                            throw err;
                                                                        }
                                                                        else {
                                                                            usermodellobby.update({members: rese['members']}, {$push: {members: {user_id: reso['user_id'], object_id: reso['_id']}}}, (err, res) => {
                                                                                if (err) {
                                                                                    throw err;
                                                                                }
                                                                            }).then(() => {
                                                                                usermodellobby.findOne({name: res['name']}, (err, resp) => {
                                                                                    if (err) {
                                                                                        throw err;
                                                                                    }
                                                                                    else {
                                                                                        resp['alphabet'] = random(randomnumber);
                                                                                        resp.save((err, r) => {
                                                                                            if (err) {
                                                                                                throw err;
                                                                                            }
                                                                                            else {
                                                                                                resp['members'].forEach((name) => {
                                                                                                    bot.sendMessage({
                                                                                                        chat_id: name['user_id'],
                                                                                                        text: text.begin + '\n' + text.name_with + '\t' + resp['alphabet'] + ':',
                                                                                                        reply_markup: {
                                                                                                            inline_keyboard: [
                                                                                                                [
                                                                                                                    {
                                                                                                                        text: strs.main_menu.idk,
                                                                                                                        callback_data: strs.main_menu.idk
                                                                                                                    }, {
                                                                                                                    text: strs.main_menu.help,
                                                                                                                    callback_data: strs.main_menu.help
                                                                                                                }
                                                                                                                ]
                                                                                                            ]
                                                                                                        }
                                                                                                    }).then((res) => {
                                                                                                        usermodeluser.update({user_id: name['user_id']}, {message_id: res['result']['message_id']}, (err, res) => {
                                                                                                            if (err) {
                                                                                                                throw err;
                                                                                                            }
                                                                                                        });
                                                                                                        usermodelalllobby.update({name:resf['name']}, {$pull:{accident_game:name['object_id']}}, (err,res) => {
                                                                                                            if(err){
                                                                                                                throw err;
                                                                                                            }
                                                                                                        })
                                                                                                    });
                                                                                                });
                                                                                            }
                                                                                        });
                                                                                    }
                                                                                });
                                                                            })

                                                                        }
                                                                    });
                                                                }
                                                            })
                                                        });
                                                }
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////////

function randomm(a) {
    let promis = new Promise(((resolve,reject) => {
        let randomenumber = Math.floor(Math.random()*a+0);
        resolve(randomenumber);
    }));
    return(promis);
}

////////////////////////////////////////////////////////////////////////////////////

function rating(update, res) {
    // console.log(res);
    usermodeluser.find({name:res['name']}, (err, res) => {
        if(err){
            throw err;
        }
        else{
            console.log(res)
            // function sortNumber(a,b) {
            //     return a - b;
            // }
            // console.log(res)
            res.forEach((rate) =>{
                // console.log(rate.length)
            //     console.log(rate)
            //     let numArray = rate['rating'];
            //     numArray.sort(sortNumber);
            //     console.log(numArray.join(","));
            });
        }
    });
}

////////////////////////////////////////////////////////////////////////////////////

function VIP(update, res) {
    usermodeluser.findOne({user_id:res['user_id']}, (err, res) => {
        if(err){
            throw err;
        }
        else{
            if(res['vip'] === undefined){
                bot.sendMessage({
                    chat_id:res['user_id'],
                    text:text.laugh,
                    reply_markup:{
                        keyboard:[
                            [{text:strs.main_menu.join}],[{text:strs.main_menu.main_menu}]
                        ],
                        resize_keyboard:true,
                        one_time_keyboard:true
                    }
                });
                usermodeluser.update({user_id:res['user_id']}, {level:'vip'}, (err, res) => {
                    if(err){
                        throw err;
                    }
                });
            }
            else{
                bot.sendMessage({
                    chat_id:res['user_id'],
                    text:text.join_vip,
                    reply_markup:{
                        keyboard:[
                            [{text:strs.main_menu.custom_vip_game},{text:strs.main_menu.unlimited_game}],[{text:strs.main_menu.main_menu}]
                        ],
                        resize_keyboard:true,
                        one_time_keyboard:true
                    }
                });
            }
        }
    });
}

/////////////////////////////////////////////////////////////////////////////////

function add_vip(update, res) {
     usermodeluser.findOne({user_id:res['user_id']}, (err, res) => {
         if(err){
             throw err;
         }
         else{
             if(update['message']['text'] === strs.main_menu.join){
                 bot.sendMessage({
                     chat_id:res['user_id'],
                     text:text.link
                 });
             }
         }
     });
}

/////////////////////////////////////////////////////////////////////////////////////

function team_game(update, res) {
    usermodeluser.findOne({user_id:res['user_id']}, (err, res) => {
        if(err){
            throw err;
        }
        else{
            bot.exportChatInviteLink({
                chat_id:res['user_id'],
            });
        }
    });
}

//////////////////////////////////////////////////////////////////////////////////////

function random(randomnumber) {
    let a = "";
    if(randomnumber === 0){
         a = 'ا'
    }
    else if(randomnumber === 1){
         a = 'ب'
    }
    else if(randomnumber === 2){
         a = 'پ'
    }
    else if(randomnumber === 3){
         a = 'ت'
    }
    else if(randomnumber === 4){
         a = 'ث'
    }
    else if(randomnumber === 5){
         a = 'ج'
    }
    else if(randomnumber === 6){
         a = 'چ'
    }
    else if(randomnumber === 7){
        a = 'ح'
    }
    else if(randomnumber === 8){
        a = 'خ'
    }
    else if(randomnumber === 9){
        a = 'د'
    }
    else if(randomnumber === 10){
        a = 'ذ'
    }
    else if(randomnumber === 11){
        a = 'ر'
    }
    else if(randomnumber === 12){
        a = 'ز'
    }
    else if(randomnumber === 13){
        a = 'ژ'
    }
    else if(randomnumber === 14){
        a = 'س'
    }
    else if(randomnumber === 15){
        a = 'ش'
    }
    else if(randomnumber === 16){
        a = 'ص'
    }
    else if(randomnumber === 17){
        a = 'ض'
    }
    else if(randomnumber === 18){
        a = 'ط'
    }
    else if(randomnumber === 19){
        a = 'ظ'
    }
    else if(randomnumber === 20){
        a = 'ع'
    }
    else if(randomnumber === 21){
        a = 'غ'
    }
    else if(randomnumber === 22){
        a = 'ف'
    }
    else if(randomnumber === 23){
        a = 'ق'
    }
    else if(randomnumber === 24){
        a = 'ک'
    }
    else if(randomnumber === 25){
        a = 'گ'
    }
    else if(randomnumber === 26){
        a = 'ل'
    }
    else if(randomnumber === 27){
        a = 'م'
    }
    else if(randomnumber === 28){
        a = 'ن'
    }
    else if(randomnumber === 29){
        a = 'و'
    }
    else if(randomnumber === 30){
        a = 'ه'
    }
    else if(randomnumber === 31){
        a = 'ی'
    }
    return(a)
}

/////////////////////////////////////////////////////////////////////////////////////

function find_main(update, res, o) {
    let promise1 = new Promise(((resolve, reject) => {
        let a;
        usermodeluser.findOne({user_id: res['user_id']}, (err, rese) => {
            if (err) {
                throw err;
            }
            else {
                usermodelmain.findOne({name: res['name']}, (err, reso) => {
                    if (err) {
                        throw err;
                    }
                    else {
                        usermodellobby.findOne({name: res['name']}, (err, resi) => {
                            if (err) {
                                throw err;
                            }
                            else {
                                let counter = 0;
                                resi['members'].forEach((user_id) => {
                                    if (user_id['user_id'] === rese['user_id']) {
                                        if (update['message']['text'][0] === resi['alphabet']) {
                                            reso[o].forEach((name) => {
                                                if (name === update['message']['text']) {
                                                    a = 1;
                                                }
                                                else {
                                                    counter++;
                                                }

                                            });
                                            let i = reso['first_name'].length;
                                            if (counter === i) {
                                                a = 2;
                                            }
                                        }
                                        else {
                                            a = 2;
                                        }
                                    }
                                });
                                resolve(a);
                            }
                        });
                    }
                })
            }
        });
    }));
    return(promise1);
}

///////////////////////////////////////////////////////////////////////////////////////
function call_idk(now, last, o, lvl) {
        this.now = now;
        this.last = last;
        this.o = o;
        this.lvl = lvl;
        this.func = function(update){
            usermodeluser.findOne({user_id:update['callback_query']['from']['id']}, (err, rese) => {
                if(err){
                    throw err;
                }
                else{
                    usermodellobby.findOne({name:rese['name']}, (err, res) => {
                        if(err){
                            throw err;
                        }
                        else {
                            bot.sendMessage({
                                chat_id: update['callback_query']['from']['id'],
                                text: now + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {
                                                text: strs.main_menu.idk,
                                                callback_data: strs.main_menu.idk
                                            }, {text: strs.main_menu.help, callback_data: strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id: rese['user_id']}, {message_id: res['result']['message_id']}, (err, res) => {
                                    if (err) {
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id: update['callback_query']['from']['id'],
                                message_id: update['callback_query']['message']['message_id'],
                                text: text.idk0point + '\n' + last + '\t' + res['alphabet'] + ':',
                            });
                            rese[o] = strs.main_menu.idk + '\t' + 0;
                            rese.save();
                            res['members'].forEach((id) => {
                                if (id['user_id'] === rese['user_id']) {
                                    usermodeluser.update({user_id: rese['user_id']}, {level: lvl}, (err, res) => {
                                        if (err) {
                                            throw err;
                                        }
                                    });
                                }
                            });

                        }
                    });
                }
            });
        };
}

/////////////////////////////////////////////////////////////////////////////////////

function call_help(now, last, o, lvl) {
    this.now = now;
    this.last = last;
    this.o = o;
    this.lvl = lvl;
    this.func = function(update){
        usermodeluser.findOne({user_id:update['callback_query']['from']['id']}, (err, rese) => {
            if(err){
                throw err;
            }
            else{
                usermodellobby.findOne({name:rese['name']}, (err, res) => {
                    if(err){
                        throw err;
                    }
                    else {
                        if (rese['coin'] === 0) {
                            rese[o] = 0;
                            rese.save();
                            bot.sendMessage({
                                chat_id: update['callback_query']['from']['id'],
                                text: text.you_dont_have_enough_coin + '\n' + now + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {
                                                text: strs.main_menu.idk,
                                                callback_data: strs.main_menu.idk
                                            }, {text: strs.main_menu.help, callback_data: strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id: rese['user_id']}, {message_id: res['result']['message_id']}, (err, res) => {
                                    if (err) {
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id: update['callback_query']['from']['id'],
                                message_id: update['callback_query']['message']['message_id'],
                                text: last + '\t' + res['alphabet'] + ':',
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level:lvl}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                        else {
                            rese['counter']++;
                            rese.save();
                            rese[o] = 10;
                            rese['coin'] = rese['coin'] - 1;
                            rese['fake_point'] = rese['counter']*10;
                            rese.save();
                            usermodeluser.update({user_id: rese['user_id']}, {level: lvl}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                            bot.sendMessage({
                                chat_id: update['callback_query']['from']['id'],
                                text: now + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {
                                                text: strs.main_menu.idk,
                                                callback_data: strs.main_menu.idk
                                            }, {text: strs.main_menu.help, callback_data: strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id: rese['user_id']}, {message_id: res['result']['message_id']}, (err, res) => {
                                    if (err) {
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id: update['callback_query']['from']['id'],
                                message_id: update['callback_query']['message']['message_id'],
                                text: last + '\t' + res['alphabet'] + ':',
                            });
                        }
                    }
                });
            }
        });
    };
}

//////////////////////////////////////////////////////////////////////////////////////

function callback(update) {
    usermodeluser.findOne({user_id:update['callback_query']['from']['id']}, (err, rese) => {
        if(err){
            throw err;
        }
        else{
            usermodellobby.findOne({name:rese['name']}, (err, res) => {
                if(err){
                    throw err;
                }
                else{
                    if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game2'){
                        const callback = new call_idk(text.last_name_with, text.name_with, 'first_name', 'accident_game3');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game2'){
                        const callback = new call_help(text.last_name_with, text.name_with, 'first_name', 'accident_game3')
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game3'){
                        const callback = new call_idk(text.color_with, text.last_name_with, 'last_name', 'accident_game4');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game3'){
                        const callback = new call_help(text.color_with, text.last_name_with, 'last_name', 'accident_game4');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game4'){
                        const callback = new call_idk(text.food_with, text.color_with, 'color', 'accident_game5');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game4'){
                        const callback = new call_help(text.food_with, text.color_with, 'color', 'accident_game5');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game5'){
                        const callback = new call_idk(text.animal_with, text.food_with, 'food', 'accident_game6');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game5'){
                        const callback = new call_help(text.animal_with, text.food_with, 'food', 'accident_game6');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game6'){
                        const callback = new call_idk(text.city_with, text.animal_with, 'animal', 'accident_game7');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game6'){
                        const callback = new call_help(text.city_with, text.animal_with, 'animal', 'accident_game7');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game7'){
                        const callback = new call_idk(text.country_with, text.animal_with, 'city', 'accident_game8');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game7'){
                        const callback = new call_idk(text.country_with, text.animal_with, 'city', 'accident_game8');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game8'){
                        const callback = new call_idk(text.car_with, text.country_with, 'country', 'accident_game9');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game8'){
                        const callback = new call_help(text.car_with, text.country_with, 'country', 'accident_game9');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game9'){
                        const callback = new call_idk(text.fruit_with, text.car_with, 'car', 'accident_game10');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game9'){
                        const callback = new call_help(text.fruit_with, text.car_with, 'car', 'accident_game10');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game10'){
                        const callback = new call_idk(text.flower_with, text.fruit_with, 'fruit', 'accident_game11');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game10'){
                        const callback = new call_help(text.flower_with, text.fruit_with, 'fruit', 'accident_game11');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game11'){
                        const callback = new call_idk(text.things_with, text.flower_with, 'flower', 'accident_game12');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game11'){
                        const callback = new call_help(text.things_with, text.flower_with, 'flower', 'accident_game12');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game12'){
                        const callback = new call_idk(text.organ_with, text.things_with, 'things', 'accident_game13');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game12'){
                        const callback = new call_help(text.organ_with, text.things_with, 'things', 'accident_game13');
                        return(callback.func(update));
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game13'){
                        bot.sendMessage({
                            chat_id:update['callback_query']['from']['id'],
                            text:text.end_game,
                            reply_markup:{
                                keyboard:[
                                    [
                                        {text:strs.main_menu.stop}
                                    ]
                                ],
                                resize_keyboard:true,
                                one_time_keyboard:true,
                            }
                        });
                        bot.editMessageText({
                            chat_id:update['callback_query']['from']['id'],
                            message_id:update['callback_query']['message']['message_id'],
                            text:text.idk0point+'\n'+text.organ_with+'\t'+res['alphabet']+ ':',
                        });
                        rese['things'] = strs.main_menu.idk+'\t'+0;
                        rese.save();
                        res['members'].forEach((id) =>{
                            if(id['user_id'] === rese['user_id']){
                                usermodeluser.update({user_id:rese['user_id']}, {level:'accident_game14'}, (err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                });
                            }
                        });
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game13'){
                        if(rese['coin'] === 0){
                            rese['organ'] = text.you_dont_have_enough_coin;
                            rese.save();
                            bot.sendMessage({
                                chat_id:update['callback_query']['from']['id'],
                                text:text.you_dont_have_enough_coin+'\n'+ text.end_game,
                                reply_markup: {
                                    keyboard: [
                                        [
                                            {text:strs.main_menu.stop}
                                        ]
                                    ],
                                    one_time_keyboard:true,
                                    resize_keyboard:true,
                                }
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.organ_with+'\t'+res['alphabet']+ ':',
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game14'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                        else {
                            rese['counter']++;
                            rese.save();
                            rese['coin'] = rese['coin'] - 1;
                            rese['fake_point'] = rese['counter']*10;
                            rese['organ'] = strs.main_menu.help+'\t'+10;
                            rese.save();
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game14'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                            bot.sendMessage({
                                chat_id:update['callback_query']['from']['id'],
                                text:text.end_game,
                                reply_markup: {
                                    keyboard: [
                                        [
                                            {text:strs.main_menu.stop}
                                        ]
                                    ],
                                    one_time_keyboard:true,
                                    resize_keyboard:true,
                                }
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.organ_with+'\t'+res['alphabet']+ ':',
                            });
                        }
                    }
                }
            });
        }
    });
}

////////////////////////////////////////////////////////////////////////////////////////

function accidentgame(now , last, o, lvl) {
    this.now = now;
    this.last = last;
    this.o = o;
    this.lvl = lvl;
    this.func = function (update, res, o) {
        this.o = o;
        usermodeluser.findOne({user_id:res['user_id']}, (err, rese) => {
            if(err){
                throw err;
            }
            else{
                usermodelmain.findOne({name:res['name']}, (err, reso) => {
                    if(err){
                        throw err;
                    }
                    else{
                        usermodellobby.findOne({name:res['name']}, (err, resi) => {
                            if(err){
                                throw err;
                            }
                            else {
                                find_main(update, res, o)
                                    .then((resq) => {
                                        if (resq === 1) {
                                            rese['counter']++;
                                            rese.save();
                                            rese[o] = update['message']['text']+'\t'+10;
                                            rese['fake_point'] = rese['counter']*10;
                                            rese.save();
                                            bot.sendMessage({
                                                chat_id: rese['user_id'],
                                                text: now + '\t' + resi['alphabet'] + ':',
                                                reply_markup: {
                                                    inline_keyboard: [
                                                        [
                                                            {text: strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help, callback_data: strs.main_menu.help}
                                                        ]
                                                    ]
                                                }
                                            }).then((resq) => {
                                                usermodeluser.update({user_id:rese['user_id']}, {message_id:resq['result']['message_id']},(err, res) => {
                                                    if(err){
                                                        throw err;
                                                    }
                                                });
                                            });
                                            bot.editMessageText({
                                                chat_id:rese['user_id'],
                                                message_id:rese['message_id'],
                                                text: last +'\t'+resi['alphabet']+':',
                                            });
                                            usermodeluser.update({user_id: rese['user_id']}, {level: lvl}, (err, res) => {
                                                if (err) {
                                                    throw err;
                                                }
                                            });
                                        }
                                        else if (resq === 2) {
                                            rese[o] = update['message']['text']+'\t'+0;
                                            rese.save();
                                            bot.sendMessage({
                                                chat_id: rese['user_id'],
                                                text: now + '\t' + resi['alphabet'] + ':',
                                                reply_markup: {
                                                    inline_keyboard: [
                                                        [
                                                            {text: strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help, callback_data: strs.main_menu.help}
                                                        ]
                                                    ]
                                                }
                                            }).then((resq) => {
                                                usermodeluser.update({user_id:rese['user_id']}, {message_id:resq['result']['message_id']},(err, res) => {
                                                    if(err){
                                                        throw err;
                                                    }
                                                });
                                            });
                                            bot.editMessageText({
                                                chat_id:rese['user_id'],
                                                message_id:rese['message_id'],
                                                text:last+'\t'+resi['alphabet']+':',
                                            });
                                            usermodeluser.update({user_id: rese['user_id']}, {level: lvl}, (err, res) => {
                                                if (err) {
                                                    throw err;
                                                }
                                            });
                                        }
                                    });
                            }
                        });
                    }
                });
            }
        });
    }
}

///////////////////////////////////////////////////////////////////////////////////////
function accident_game2(update, res) {
    const acc_game = new accidentgame(text.last_name_with , text.name_with, 'first_name', 'accident_game3');
    return(acc_game.func(update, res, 'first_name'));
}

//////////////////////////////////////////////////////////////////////////////////////

function accident_game3(update, res) {
    const acc_game = new accidentgame(text.color_with , text.last_name_with, 'last_name', 'accident_game4');
    return(acc_game.func(update, res, 'last_name'));
}

///////////////////////////////////////////////////////////////////////////////

function accident_game4(update, res) {
    const acc_game = new accidentgame(text.food_with , text.color_with, 'color', 'accident_game5');
    return(acc_game.func(update, res, 'color'));
}

////////////////////////////////////////////////////////////////////////////////

function accident_game5(update, res) {
    const acc_game = new accidentgame(text.animal_with , text.food_with, 'food', 'accident_game6');
    return(acc_game.func(update, res, 'food'));
}

///////////////////////////////////////////////////////////////////////////////

function accident_game6(update, res) {
    const acc_game = new accidentgame(text.city_with , text.animal_with, 'animal', 'accident_game7');
    return(acc_game.func(update, res, 'animal'));
}

////////////////////////////////////////////////////////////////////////////////

function accident_game7(update, res) {
    const acc_game = new accidentgame(text.country_with, text.city_with, 'city', 'accident_game8');
    return(acc_game.func(update, res, 'city'));
}

///////////////////////////////////////////////////////////////////////////////

function accident_game8(update, res) {
    const acc_game = new accidentgame(text.car_with, text.country_with, 'country', 'accident_game9');
    return(acc_game.func(update, res, 'country'));
}

///////////////////////////////////////////////////////////////////////////////

function accident_game9(update, res) {
    const acc_game = new accidentgame(text.fruit_with, text.car_with, 'car', 'accident_game10');
    return(acc_game.func(update, res, 'car'));
}

///////////////////////////////////////////////////////////////////////////////

function accident_game10(update, res) {
    const acc_game = new accidentgame(text.flower_with, text.fruit_with, 'fruit', 'accident_game11');
    return(acc_game.func(update, res, 'fruit'));
}

///////////////////////////////////////////////////////////////////////////////

function accident_game11(update, res) {
    const acc_game = new accidentgame(text.things_with , text.flower_with, 'flower', 'accident_game12');
    return(acc_game.func(update, res, 'flower'));
}

////////////////////////////////////////////////////////////////////////////////

function accident_game12(update, res) {
    const acc_game = new accidentgame(text.organ_with , text.things_with, 'things', 'accident_game13');
    return(acc_game.func(update, res, 'things'));
}

/////////////////////////////////////////////////////////////////////////////////

function accident_game13(update, res) {
    usermodeluser.findOne({user_id:res['user_id']}, (err, rese) => {
        if(err){
            throw err;
        }
        else{
            usermodelmain.findOne({name:res['name']}, (err, reso) => {
                if(err){
                    throw err;
                }
                else{
                    usermodellobby.findOne({name:res['name']}, (err, resi) => {
                        if(err){
                            throw err;
                        }
                        else {
                            find_main(update, res)
                                .then((resq) => {
                                    if (resq === 1) {
                                        rese['counter']++;
                                        rese.save();
                                        rese['organ'] = update['message']['text']+'\t'+10;
                                        rese['fake_point'] = rese['counter'] * 10;
                                        rese.save();
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text:text.end_game,
                                            reply_markup: {
                                                keyboard: [
                                                    [
                                                        {text:text.stop}
                                                    ]
                                                ],
                                                resize_keyboard:true,
                                                one_time_keyboard:true
                                            }
                                        });
                                        bot.editMessageText({
                                            chat_id:rese['user_id'],
                                            message_id:rese['message_id'],
                                            text:text.organ_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game14'}, (err, res) => {
                                            if (err) {
                                                throw err;
                                            }
                                        });
                                    }
                                    else if (resq === 2) {
                                        rese['organ'] = update['message']['text']+'\t'+0;
                                        rese.save();
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text:text.end_game,
                                            reply_markup: {
                                                keyboard: [
                                                    [
                                                        {text: text.stop}
                                                    ]
                                                ],
                                                resize_keyboard:true,
                                                one_time_keyboard:true
                                            }
                                        });
                                        bot.editMessageText({
                                            chat_id:rese['user_id'],
                                            message_id:rese['message_id'],
                                            text:text.organ_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game14'}, (err, res) => {
                                            if (err) {
                                                throw err;
                                            }
                                        });
                                    }
                                });
                        }
                    });
                }
            });
        }
    });
}

////////////////////////////////////////////////////////////////////////////////

function accident_game14(update, res) {
    usermodeluser.findOne({name:res['name']}, (err, rese) =>{
        if(err){
            throw err;
        }
        else{
            usermodellobby.findOne({name:res['name']}, (err, reso) => {
                if(err){
                    throw err;
                }
                else{
                    if(update['message']['text'] === strs.main_menu.stop && rese['level'] === 'accident_game14'){
                        console.log(123)
                        // usermodeluser.find({name:res['name']}, (err, res) => {
                        //     if(err){
                        //         throw err;
                        //     }
                        //     else{
                        //
                        //     }
                        // });
                        reso['members'].forEach((id) => {
                            console.log(id['user_id']);
                            usermodeluser.update({user_id:id['user_id']}, {level:'accident_game14'},(err, res) => {
                                if(err){
                                    throw err;
                                }
                            });
                        });
                        reso['end_name'] = update['message']['chat']['first_name'];
                        reso.save((err, resq) => {
                            if(err){
                                throw err;
                            }
                            else{
                                console.log(reso['end_name']);
                                let numArray = reso['fake_point'];
                                numArray.sort(sortNumber);
                                let counter= numArray.length;
                                numArray.forEach((q) => {
                                    counter--;
                                    console.log(numArray[counter])
                                });
                            }
                        });
                    }
                    else{
                        bot.sendMessage({
                            chat_id:rese['user_id'],
                            text:text.invalid
                        });
                    }
                }
            });
        }
    })
}

////////////////////////////////////////////////////////////////////////////

function sort_rait(update, res) {
    usermodeluser.findOne({name:res['name']}, (err, res) => {
        if(err){
            throw err;
        }
        else{
            let sort = res['fake_point']
        }
    });
}

////////////////////////////////////////////////////////////////////////////

// function inline(update) {
    // console.log(update['inline_query']['from']['id']);
    // console.log(update['inline_query']['id']);
    // usermodeluser.findOne({user_id:update['inline_query']['from']['id']}, (err, res) => {
    //     if(err){
    //         throw err;
    //     }
    //     else{
            // if(update['inline_query']['query'] === 'bloodborn'){
            //     bot.InputTextMessageContent({
            //         message_text:" بیا بازی "
                    // inline_query_id:update['inline_query']['id'],
                    // results:[
                    //     InputTextMessageContent={
                    //         message_text:" بیا بازی "
                    //     }
                        // inlineQueryResultPhoto={
                        //     type: "photo",
                        //     id : "1",
                        //     photo_url :"http://weneedfun.com/wp-content/uploads/2016/01/Anemone-Flower-15.jpg",
                        //     thumb_url :"http://weneedfun.com/wp-content/uploads/2016/01/Anemone-Flower-15.jpg",
                        //     title : "TestTitle"
                        // }
                    // ]
                // }).then((res) => {
                //     console.log(res)
                // })
            // }
        // }
    // });
// }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

function sortNumber(a,b) {
    return a - b;
}
