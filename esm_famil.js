const Bot = require('telegram-bot-manager');
const bot = new Bot('468320808:AAG1ZdQ2dfHCc75lsW-_wwxq6Kr8MhVEno8');
const express = require('express');
const mongoose = require('mongoose');
const app = express();

/////////////////////////////////////////////////////////////////////

mongoose.connect("mongodb://localhost/esm_famil");
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
    name:String,
    username:String,
    vip:String,
    user_id:Number,
    rating:[],
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
    fake_point:{
        type:Number,
        default:0
    },
    message_id:Number,
    callback:Number,
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
        name:String,
    }],
    capacity: {
        type:Number,
        default:2
    },
    deleted:{
        type: Boolean,
        default: false
    },
    alphabet:String
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

let usermodelalllobby = mongoose.model('all_lobby',alllobby);
let usermodellobby = mongoose.model('lobby',lobby);
let usermodeluser = mongoose.model('user',user);
let usermodelmain = mongoose.model('main',main);
let usermodelservey = mongoose.model('servey',servey);

//////////////////////////////////////////////////////////////////////

let update_id = 0;

//////////////////////////////////////////////////////////////////////

let runningbot = setInterval(()=>{
    bot.getUpdates({offset:update_id})
        .then((pm) => {
            pm['result'].forEach((update) => {
                update_id = update['update_id'] + 1;
                if(!update['callback_query']){
                    process(update);
                }
                else{
                    callback(update);
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
                    user_id:update['message']['chat']['id']
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
                text: text.welcome+'\t'+'telegram.me/esme_famile_bot?start=',
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
                    text:text.laugh,
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

function find_main(update, res) {
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
                                            reso['first_name'].forEach((name) => {
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
                        bot.sendMessage({
                            chat_id:update['callback_query']['from']['id'],
                            text:text.last_name_with+'\t'+res['alphabet']+ ':',
                            reply_markup:{
                                inline_keyboard:[
                                    [
                                        {text:strs.main_menu.idk, callback_data:strs.main_menu.idk},{text:strs.main_menu.help, callback_data:strs.main_menu.help}
                                    ]
                                ]
                            }
                        }).then((res) => {
                            usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                if(err){
                                    throw err;
                                }
                            })
                        });
                        bot.editMessageText({
                            chat_id:update['callback_query']['from']['id'],
                            message_id:update['callback_query']['message']['message_id'],
                            text:text.idk0point+'\n'+text.name_with+'\t'+res['alphabet']+ ':',
                        });
                        res['members'].forEach((id) =>{
                            if(id['user_id'] === rese['user_id']){
                                usermodeluser.update({user_id:rese['user_id']}, {level:'accident_game3'}, (err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                });
                            }
                        });
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game2'){
                        if(rese['coin'] === 0){
                            bot.sendMessage({
                                chat_id:update['callback_query']['from']['id'],
                                text:text.you_dont_have_enough_coin+'\n'+ text.last_name_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text:strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data:strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.name_with+'\t'+res['alphabet']+ ':',
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game3'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                        else {
                            res['members'].forEach((id) => {
                                if (id['user_id'] === rese['user_id']) {
                                    rese['coin'] = rese['coin'] - 1;
                                    rese['fake_point'] = rese['fake_point'] + 10;
                                    rese.save();
                                }
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game3'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                            bot.sendMessage({
                                chat_id: update['callback_query']['from']['id'],
                                text: text.last_name_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text: strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data: strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.name_with+'\t'+res['alphabet']+ ':',
                            });
                        }
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game3'){
                        bot.sendMessage({
                            chat_id:update['callback_query']['from']['id'],
                            text:text.color_with+'\t'+res['alphabet']+ ':',
                            reply_markup:{
                                inline_keyboard:[
                                    [
                                        {text:strs.main_menu.idk, callback_data:strs.main_menu.idk},{text:strs.main_menu.help, callback_data:strs.main_menu.help}
                                    ]
                                ]
                            }
                        }).then((res) => {
                            usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                if(err){
                                    throw err;
                                }
                            })
                        });
                        bot.editMessageText({
                            chat_id:update['callback_query']['from']['id'],
                            message_id:update['callback_query']['message']['message_id'],
                            text:text.idk0point+'\n'+text.last_name_with+'\t'+res['alphabet']+ ':',
                        }).then((res) => {
                            console.log(res);
                            usermodeluser.update({name:rese['name']}, {callback:res['result']['message_id']} ,(err, res) => {
                                if(err){
                                    throw err;
                                }
                            })
                        });
                        res['members'].forEach((id) =>{
                            if(id['user_id'] === rese['user_id']){
                                usermodeluser.update({user_id:rese['user_id']}, {level:'accident_game4'}, (err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                });
                            }
                        });
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game3'){
                        if(rese['coin'] === 0){
                            bot.sendMessage({
                                chat_id:update['callback_query']['from']['id'],
                                text:text.you_dont_have_enough_coin+'\n'+ text.color_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text:strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data:strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.last_name_with+'\t'+res['alphabet']+ ':',
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game4'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                        else {
                            res['members'].forEach((id) => {
                                if (id['user_id'] === rese['user_id']) {
                                    rese['coin'] = rese['coin'] - 1;
                                    rese['fake_point'] = rese['fake_point'] + 10;
                                    rese.save();
                                }
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game4'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                            bot.sendMessage({
                                chat_id: update['callback_query']['from']['id'],
                                text: text.color_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text: strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data: strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.last_name_with+'\t'+res['alphabet']+ ':',
                            });
                        }
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game4'){
                        bot.sendMessage({
                            chat_id:update['callback_query']['from']['id'],
                            text:text.food_with+'\t'+res['alphabet']+ ':',
                            reply_markup:{
                                inline_keyboard:[
                                    [
                                        {text:strs.main_menu.idk, callback_data:strs.main_menu.idk},{text:strs.main_menu.help, callback_data:strs.main_menu.help}
                                    ]
                                ]
                            }
                        }).then((res) => {
                            usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                if(err){
                                    throw err;
                                }
                            })
                        });
                        bot.editMessageText({
                            chat_id:update['callback_query']['from']['id'],
                            message_id:update['callback_query']['message']['message_id'],
                            text:text.idk0point+'\n'+text.color_with+'\t'+res['alphabet']+ ':',
                        });
                        res['members'].forEach((id) =>{
                            if(id['user_id'] === rese['user_id']){
                                usermodeluser.update({user_id:rese['user_id']}, {level:'accident_game5'}, (err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                });
                            }
                        });
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game4'){
                        if(rese['coin'] === 0){
                            bot.sendMessage({
                                chat_id:update['callback_query']['from']['id'],
                                text:text.you_dont_have_enough_coin+'\n'+ text.food_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text:strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data:strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.color_with+'\t'+res['alphabet']+ ':',
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game5'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                        else {
                            res['members'].forEach((id) => {
                                if (id['user_id'] === rese['user_id']) {
                                    rese['coin'] = rese['coin'] - 1;
                                    rese['fake_point'] = rese['fake_point'] + 10;
                                    rese.save();
                                }
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game5'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                            bot.sendMessage({
                                chat_id: update['callback_query']['from']['id'],
                                text: text.food_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text: strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data: strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.color_with+'\t'+res['alphabet']+ ':',
                            });
                        }
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game5'){
                        bot.sendMessage({
                            chat_id:update['callback_query']['from']['id'],
                            text:text.animal_with+'\t'+res['alphabet']+ ':',
                            reply_markup:{
                                inline_keyboard:[
                                    [
                                        {text:strs.main_menu.idk, callback_data:strs.main_menu.idk},{text:strs.main_menu.help, callback_data:strs.main_menu.help}
                                    ]
                                ]
                            }
                        }).then((res) => {
                            usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                if(err){
                                    throw err;
                                }
                            })
                        });
                        bot.editMessageText({
                            chat_id:update['callback_query']['from']['id'],
                            message_id:update['callback_query']['message']['message_id'],
                            text:text.idk0point+'\n'+text.food_with+'\t'+res['alphabet']+ ':',
                        });
                        res['members'].forEach((id) =>{
                            if(id['user_id'] === rese['user_id']){
                                usermodeluser.update({user_id:rese['user_id']}, {level:'accident_game6'}, (err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                });
                            }
                        });
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game5'){
                        if(rese['coin'] === 0){
                            bot.sendMessage({
                                chat_id:update['callback_query']['from']['id'],
                                text:text.you_dont_have_enough_coin+'\n'+ text.animal_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text:strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data:strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.food_with+'\t'+res['alphabet']+ ':',
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game6'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                        else {
                            res['members'].forEach((id) => {
                                if (id['user_id'] === rese['user_id']) {
                                    rese['coin'] = rese['coin'] - 1;
                                    rese['fake_point'] = rese['fake_point'] + 10;
                                    rese.save();
                                }
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game6'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                            bot.sendMessage({
                                chat_id: update['callback_query']['from']['id'],
                                text: text.animal_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text: strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data: strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.food_with+'\t'+res['alphabet']+ ':',
                            });
                        }
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game6'){
                        bot.sendMessage({
                            chat_id:update['callback_query']['from']['id'],
                            text:text.city_with+'\t'+res['alphabet']+ ':',
                            reply_markup:{
                                inline_keyboard:[
                                    [
                                        {text:strs.main_menu.idk, callback_data:strs.main_menu.idk},{text:strs.main_menu.help, callback_data:strs.main_menu.help}
                                    ]
                                ]
                            }
                        }).then((res) => {
                            usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                if(err){
                                    throw err;
                                }
                            })
                        });
                        bot.editMessageText({
                            chat_id:update['callback_query']['from']['id'],
                            message_id:update['callback_query']['message']['message_id'],
                            text:text.idk0point+'\n'+text.animal_with+'\t'+res['alphabet']+ ':',
                        });
                        res['members'].forEach((id) =>{
                            if(id['user_id'] === rese['user_id']){
                                usermodeluser.update({user_id:rese['user_id']}, {level:'accident_game7'}, (err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                });
                            }
                        });
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game6'){
                        if(rese['coin'] === 0){
                            bot.sendMessage({
                                chat_id:update['callback_query']['from']['id'],
                                text:text.you_dont_have_enough_coin+'\n'+ text.city_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text:strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data:strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.animal_with+'\t'+res['alphabet']+ ':',
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game7'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                        else {
                            res['members'].forEach((id) => {
                                if (id['user_id'] === rese['user_id']) {
                                    rese['coin'] = rese['coin'] - 1;
                                    rese['fake_point'] = rese['fake_point'] + 10;
                                    rese.save();
                                }
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game7'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                            bot.sendMessage({
                                chat_id: update['callback_query']['from']['id'],
                                text: text.city_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text: strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data: strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.animal_with+'\t'+res['alphabet']+ ':',
                            });
                        }
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game7'){
                        bot.sendMessage({
                            chat_id:update['callback_query']['from']['id'],
                            text:text.country_with+'\t'+res['alphabet']+ ':',
                            reply_markup:{
                                inline_keyboard:[
                                    [
                                        {text:strs.main_menu.idk, callback_data:strs.main_menu.idk},{text:strs.main_menu.help, callback_data:strs.main_menu.help}
                                    ]
                                ]
                            }
                        }).then((res) => {
                            usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                if(err){
                                    throw err;
                                }
                            })
                        });
                        bot.editMessageText({
                            chat_id:update['callback_query']['from']['id'],
                            message_id:update['callback_query']['message']['message_id'],
                            text:text.idk0point+'\n'+text.city_with+'\t'+res['alphabet']+ ':',
                        });
                        res['members'].forEach((id) =>{
                            if(id['user_id'] === rese['user_id']){
                                usermodeluser.update({user_id:rese['user_id']}, {level:'accident_game8'}, (err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                });
                            }
                        });
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game7'){
                        if(rese['coin'] === 0){
                            bot.sendMessage({
                                chat_id:update['callback_query']['from']['id'],
                                text:text.you_dont_have_enough_coin+'\n'+ text.country_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text:strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data:strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.city_with+'\t'+res['alphabet']+ ':',
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game8'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                        else {
                            res['members'].forEach((id) => {
                                if (id['user_id'] === rese['user_id']) {
                                    rese['coin'] = rese['coin'] - 1;
                                    rese['fake_point'] = rese['fake_point'] + 10;
                                    rese.save();
                                }
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game8'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                            bot.sendMessage({
                                chat_id: update['callback_query']['from']['id'],
                                text: text.country_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text: strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data: strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.city_with+'\t'+res['alphabet']+ ':',
                            });
                        }
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game8'){
                        bot.sendMessage({
                            chat_id:update['callback_query']['from']['id'],
                            text:text.car_with+'\t'+res['alphabet']+ ':',
                            reply_markup:{
                                inline_keyboard:[
                                    [
                                        {text:strs.main_menu.idk, callback_data:strs.main_menu.idk},{text:strs.main_menu.help, callback_data:strs.main_menu.help}
                                    ]
                                ]
                            }
                        }).then((res) => {
                            usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                if(err){
                                    throw err;
                                }
                            })
                        });
                        bot.editMessageText({
                            chat_id:update['callback_query']['from']['id'],
                            message_id:update['callback_query']['message']['message_id'],
                            text:text.idk0point+'\n'+text.country_with+'\t'+res['alphabet']+ ':',
                        });
                        res['members'].forEach((id) =>{
                            if(id['user_id'] === rese['user_id']){
                                usermodeluser.update({user_id:rese['user_id']}, {level:'accident_game9'}, (err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                });
                            }
                        });
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game8'){
                        if(rese['coin'] === 0){
                            bot.sendMessage({
                                chat_id:update['callback_query']['from']['id'],
                                text:text.you_dont_have_enough_coin+'\n'+ text.car_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text:strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data:strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.country_with+'\t'+res['alphabet']+ ':',
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game9'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                        else {
                            res['members'].forEach((id) => {
                                if (id['user_id'] === rese['user_id']) {
                                    rese['coin'] = rese['coin'] - 1;
                                    rese['fake_point'] = rese['fake_point'] + 10;
                                    rese.save();
                                }
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game9'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                            bot.sendMessage({
                                chat_id: update['callback_query']['from']['id'],
                                text: text.car_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text: strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data: strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.country_with+'\t'+res['alphabet']+ ':',
                            });
                        }
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game9'){
                        bot.sendMessage({
                            chat_id:update['callback_query']['from']['id'],
                            text:text.fruit_with+'\t'+res['alphabet']+ ':',
                            reply_markup:{
                                inline_keyboard:[
                                    [
                                        {text:strs.main_menu.idk, callback_data:strs.main_menu.idk},{text:strs.main_menu.help, callback_data:strs.main_menu.help}
                                    ]
                                ]
                            }
                        }).then((res) => {
                            usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                if(err){
                                    throw err;
                                }
                            })
                        });
                        bot.editMessageText({
                            chat_id:update['callback_query']['from']['id'],
                            message_id:update['callback_query']['message']['message_id'],
                            text:text.idk0point+'\n'+text.car_with+'\t'+res['alphabet']+ ':',
                        });
                        res['members'].forEach((id) =>{
                            if(id['user_id'] === rese['user_id']){
                                usermodeluser.update({user_id:rese['user_id']}, {level:'accident_game10'}, (err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                });
                            }
                        });
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game9'){
                        if(rese['coin'] === 0){
                            bot.sendMessage({
                                chat_id:update['callback_query']['from']['id'],
                                text:text.you_dont_have_enough_coin+'\n'+ text.fruit_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text:strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data:strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.car_with+'\t'+res['alphabet']+ ':',
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game10'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                        else {
                            res['members'].forEach((id) => {
                                if (id['user_id'] === rese['user_id']) {
                                    rese['coin'] = rese['coin'] - 1;
                                    rese['fake_point'] = rese['fake_point'] + 10;
                                    rese.save();
                                }
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game10'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                            bot.sendMessage({
                                chat_id: update['callback_query']['from']['id'],
                                text: text.fruit_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text: strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data: strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.car_with+'\t'+res['alphabet']+ ':',
                            });
                        }
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game10'){
                        bot.sendMessage({
                            chat_id:update['callback_query']['from']['id'],
                            text:text.flower_with+'\t'+res['alphabet']+ ':',
                            reply_markup:{
                                inline_keyboard:[
                                    [
                                        {text:strs.main_menu.idk, callback_data:strs.main_menu.idk},{text:strs.main_menu.help, callback_data:strs.main_menu.help}
                                    ]
                                ]
                            }
                        }).then((res) => {
                            usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                if(err){
                                    throw err;
                                }
                            })
                        });
                        bot.editMessageText({
                            chat_id:update['callback_query']['from']['id'],
                            message_id:update['callback_query']['message']['message_id'],
                            text:text.idk0point+'\n'+text.fruit_with+'\t'+res['alphabet']+ ':',
                        });
                        res['members'].forEach((id) =>{
                            if(id['user_id'] === rese['user_id']){
                                usermodeluser.update({user_id:rese['user_id']}, {level:'accident_game11'}, (err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                });
                            }
                        });
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game10'){
                        if(rese['coin'] === 0){
                            bot.sendMessage({
                                chat_id:update['callback_query']['from']['id'],
                                text:text.you_dont_have_enough_coin+'\n'+ text.flower_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text:strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data:strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.fruit_with+'\t'+res['alphabet']+ ':',
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game11'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                        else {
                            res['members'].forEach((id) => {
                                if (id['user_id'] === rese['user_id']) {
                                    rese['coin'] = rese['coin'] - 1;
                                    rese['fake_point'] = rese['fake_point'] + 10;
                                    rese.save();
                                }
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game11'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                            bot.sendMessage({
                                chat_id: update['callback_query']['from']['id'],
                                text: text.flower_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text: strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data: strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.fruit_with+'\t'+res['alphabet']+ ':',
                            });
                        }
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game11'){
                        bot.sendMessage({
                            chat_id:update['callback_query']['from']['id'],
                            text:text.things_with+'\t'+res['alphabet']+ ':',
                            reply_markup:{
                                inline_keyboard:[
                                    [
                                        {text:strs.main_menu.idk, callback_data:strs.main_menu.idk},{text:strs.main_menu.help, callback_data:strs.main_menu.help}
                                    ]
                                ]
                            }
                        }).then((res) => {
                            usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                if(err){
                                    throw err;
                                }
                            })
                        });
                        bot.editMessageText({
                            chat_id:update['callback_query']['from']['id'],
                            message_id:update['callback_query']['message']['message_id'],
                            text:text.idk0point+'\n'+text.flower_with+'\t'+res['alphabet']+ ':',
                        });
                        res['members'].forEach((id) =>{
                            if(id['user_id'] === rese['user_id']){
                                usermodeluser.update({user_id:rese['user_id']}, {level:'accident_game12'}, (err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                });
                            }
                        });
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game11'){
                        if(rese['coin'] === 0){
                            bot.sendMessage({
                                chat_id:update['callback_query']['from']['id'],
                                text:text.you_dont_have_enough_coin+'\n'+ text.things_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text:strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data:strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.flower_with+'\t'+res['alphabet']+ ':',
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game12'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                        else {
                            res['members'].forEach((id) => {
                                if (id['user_id'] === rese['user_id']) {
                                    rese['coin'] = rese['coin'] - 1;
                                    rese['fake_point'] = rese['fake_point'] + 10;
                                    rese.save();
                                }
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game12'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                            bot.sendMessage({
                                chat_id: update['callback_query']['from']['id'],
                                text: text.things_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text: strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data: strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.flower_with+'\t'+res['alphabet']+ ':',
                            });
                        }
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.idk && rese['level'] === 'accident_game12'){
                        bot.sendMessage({
                            chat_id:update['callback_query']['from']['id'],
                            text:text.organ_with+'\t'+res['alphabet']+ ':',
                            reply_markup:{
                                inline_keyboard:[
                                    [
                                        {text:strs.main_menu.idk, callback_data:strs.main_menu.idk},{text:strs.main_menu.help, callback_data:strs.main_menu.help}
                                    ]
                                ]
                            }
                        }).then((res) => {
                            usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                if(err){
                                    throw err;
                                }
                            })
                        });
                        bot.editMessageText({
                            chat_id:update['callback_query']['from']['id'],
                            message_id:update['callback_query']['message']['message_id'],
                            text:text.idk0point+'\n'+text.things_with+'\t'+res['alphabet']+ ':',
                        });
                        res['members'].forEach((id) =>{
                            if(id['user_id'] === rese['user_id']){
                                usermodeluser.update({user_id:rese['user_id']}, {level:'accident_game13'}, (err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                });
                            }
                        });
                    }
                    else if(update['callback_query']['data'] === strs.main_menu.help && rese['level'] === 'accident_game12'){
                        if(rese['coin'] === 0){
                            bot.sendMessage({
                                chat_id:update['callback_query']['from']['id'],
                                text:text.you_dont_have_enough_coin+'\n'+ text.organ_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text:strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data:strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.things_with+'\t'+res['alphabet']+ ':',
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game13'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                        }
                        else {
                            res['members'].forEach((id) => {
                                if (id['user_id'] === rese['user_id']) {
                                    rese['coin'] = rese['coin'] - 1;
                                    rese['fake_point'] = rese['fake_point'] + 10;
                                    rese.save();
                                }
                            });
                            usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game13'}, (err, res) => {
                                if (err) {
                                    throw err;
                                }
                            });
                            bot.sendMessage({
                                chat_id: update['callback_query']['from']['id'],
                                text: text.organ_with + '\t' + res['alphabet'] + ':',
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {text: strs.main_menu.idk, callback_data: strs.main_menu.idk}, {text: strs.main_menu.help,callback_data: strs.main_menu.help}
                                        ]
                                    ]
                                }
                            }).then((res) => {
                                usermodeluser.update({user_id:rese['user_id']}, {message_id:res['result']['message_id']} ,(err, res) => {
                                    if(err){
                                        throw err;
                                    }
                                })
                            });
                            bot.editMessageText({
                                chat_id:update['callback_query']['from']['id'],
                                message_id:update['callback_query']['message']['message_id'],
                                text:text.things_with+'\t'+res['alphabet']+ ':',
                            });
                        }
                    }
                }
            });
        }
    });
}

////////////////////////////////////////////////////////////////////////////////////////

function accident_game2(update, res) {
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
                                        rese['fake_point'] = rese['fake_point'] + 10;
                                        rese.save();
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.last_name_with + '\t' + resi['alphabet'] + ':',
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
                                            text:text.name_with+'\t'+resi['alphabet']+':',
                                        });
                                        bot.editMessageText({
                                           chat_id:rese['user_id'],
                                            message_id:rese['callback'],
                                            text:text.name_with+'\t'+resi['alphabet']+':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game3'}, (err, res) => {
                                            if (err) {
                                                throw err;
                                            }
                                        });
                                    }
                                    else if (resq === 2) {
                                        resi['members'].forEach((id) => {
                                            if(id['user_id'] === rese['user_id']) {
                                                id['first_name'] = update['message']['text']+10;

                                                id.save((err, res) =>{
                                                    if(err){
                                                        throw err;
                                                    }
                                                    else{
                                                        console.log(res)
                                                    }
                                                });
                                                console.log(id['first_name'])
                                            }
                                        });
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.last_name_with + '\t' + resi['alphabet'] + ':',
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
                                            text:text.name_with+'\t'+resi['alphabet']+':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game3'}, (err, res) => {
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

//////////////////////////////////////////////////////////////////////////////////////

function accident_game3(update, res) {
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
                                        rese['fake_point'] = rese['fake_point'] + 10;
                                        rese.save();
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.color_with + '\t' + resi['alphabet'] + ':',
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
                                            text:text.last_name_with+'\t'+resi['alphabet']+':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game4'}, (err, res) => {
                                            if (err) {
                                                throw err;
                                            }
                                        });
                                    }
                                    else if (resq === 2) {
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.color_with + '\t' + resi['alphabet'] + ':',
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
                                                text:text.last_name_with+'\t'+resi['alphabet']+ ':',
                                            });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game4'}, (err, res) => {
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

///////////////////////////////////////////////////////////////////////////////

function accident_game4(update, res) {
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
                                        rese['fake_point'] = rese['fake_point'] + 10;
                                        rese.save();
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.food_with + '\t' + resi['alphabet'] + ':',
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
                                            chat_id:res['user_id'],
                                            message_id:rese['message_id'],
                                            text:text.color_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game5'}, (err, res) => {
                                            if (err) {
                                                throw err;
                                            }
                                        });
                                    }
                                    else if (resq === 2) {
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.food_with + '\t' + resi['alphabet'] + ':',
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
                                            text:text.color_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game5'}, (err, res) => {
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

function accident_game5(update, res) {
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
                                        rese['fake_point'] = rese['fake_point'] + 10;
                                        rese.save();
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.city_with + '\t' + resi['alphabet'] + ':',
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
                                            text:text.food_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game6'}, (err, res) => {
                                            if (err) {
                                                throw err;
                                            }
                                        });
                                    }
                                    else if (resq === 2) {
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.city_with + '\t' + resi['alphabet'] + ':',
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
                                            text:text.food_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game6'}, (err, res) => {
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

function accident_game6(update, res) {
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
                            find_main(update, res)
                                .then((resq) => {
                                    if (resq === 1) {
                                        rese['fake_point'] = rese['fake_point'] + 10;
                                        rese.save();
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.country_with + '\t' + resi['alphabet'] + ':',
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
                                        }).then((resq) => {
                                            usermodeluser.update({user_id:rese['user_id']}, {message_id:resq['result']['message_id']},(err, res) => {
                                                if(err){
                                                    throw err;
                                                }
                                            });
                                        });
                                        bot.editMessageText({
                                            chat_id: rese['user_id'],
                                            message_id: rese['message_id'],
                                            text: text.city_with + '\t' + resi['alphabet'] + ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game7'}, (err, res) => {
                                            if (err) {
                                                throw err;
                                            }
                                        });
                                    }
                                    else if (resq === 2) {
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.country_with + '\t' + resi['alphabet'] + ':',
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
                                        }).then((resq) => {
                                            usermodeluser.update({user_id:rese['user_id']}, {message_id:resq['result']['message_id']},(err, res) => {
                                                if(err){
                                                    throw err;
                                                }
                                            });
                                        });
                                        bot.editMessageText({
                                            chat_id: rese['user_id'],
                                            message_id: rese['message_id'],
                                            text: text.city_with + '\t' + resi['alphabet'] + ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game7'}, (err, res) => {
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

///////////////////////////////////////////////////////////////////////////////

function accident_game7(update, res) {
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
                                        rese['fake_point'] = rese['fake_point'] + 10;
                                        rese.save();
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.car_with + '\t' + resi['alphabet'] + ':',
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
                                            text:text.country_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game8'}, (err, res) => {
                                            if (err) {
                                                throw err;
                                            }
                                        });
                                    }
                                    else if (resq === 2) {
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.car_with + '\t' + resi['alphabet'] + ':',
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
                                            text:text.country_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game8'}, (err, res) => {
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

///////////////////////////////////////////////////////////////////////////////

function accident_game8(update, res) {
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
                                        rese['fake_point'] = rese['fake_point'] + 10;
                                        rese.save();
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.fruit_with + '\t' + resi['alphabet'] + ':',
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
                                            text:text.car_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game9'}, (err, res) => {
                                            if (err) {
                                                throw err;
                                            }
                                        });
                                    }
                                    else if (resq === 2) {
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.fruit_with + '\t' + resi['alphabet'] + ':',
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
                                            text:text.car_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game9'}, (err, res) => {
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

///////////////////////////////////////////////////////////////////////////////

function accident_game9(update, res) {
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
                                        rese['fake_point'] = rese['fake_point'] + 10;
                                        rese.save();
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.flower_with + '\t' + resi['alphabet'] + ':',
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
                                            text:text.fruit_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game10'}, (err, res) => {
                                            if (err) {
                                                throw err;
                                            }
                                        });
                                    }
                                    else if (resq === 2) {
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.flower_with + '\t' + resi['alphabet'] + ':',
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
                                            text:text.fruit_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game10'}, (err, res) => {
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

///////////////////////////////////////////////////////////////////////////////

function accident_game10(update, res) {
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
                                        rese['fake_point'] = rese['fake_point'] + 10;
                                        rese.save();
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.things_with + '\t' + resi['alphabet'] + ':',
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
                                            text:text.flower_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game11'}, (err, res) => {
                                            if (err) {
                                                throw err;
                                            }
                                        });
                                    }
                                    else if (resq === 2) {
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.things_with + '\t' + resi['alphabet'] + ':',
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
                                            text:text.flower_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game11'}, (err, res) => {
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

function accident_game11(update, res) {
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
                                        rese['fake_point'] = rese['fake_point'] + 10;
                                        rese.save();
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.organ_with + '\t' + resi['alphabet'] + ':',
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
                                            text:text.things_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game12'}, (err, res) => {
                                            if (err) {
                                                throw err;
                                            }
                                        });
                                    }
                                    else if (resq === 2) {
                                        bot.sendMessage({
                                            chat_id: rese['user_id'],
                                            text: text.organ_with + '\t' + resi['alphabet'] + ':',
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
                                            text:text.things_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game12'}, (err, res) => {
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

/////////////////////////////////////////////////////////////////////////////////

function accident_game12(update, res) {
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
                                        rese['fake_point'] = rese['fake_point'] + 10;
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
                                            text:text.things_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game13'}, (err, res) => {
                                            if (err) {
                                                throw err;
                                            }
                                        });
                                    }
                                    else if (resq === 2) {
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
                                            text:text.things_with+'\t'+resi['alphabet']+ ':',
                                        });
                                        usermodeluser.update({user_id: rese['user_id']}, {level: 'accident_game13'}, (err, res) => {
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

function accident_game13(update, res) {
    usermodeluser.findOne({name:res['name']}, (err, rese) =>{
        if(err){
            throw err;
        }
        else{
            if(update['message']['text'] === text.stop){
                usermodellobby.findOne({name:res['name']}, (err, reso) => {
                    if(err){
                        throw err;
                    }
                    else{
                        reso['members'].forEach((name) => {
                            if(rese['_id'] === name['object_id']){

                            }
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