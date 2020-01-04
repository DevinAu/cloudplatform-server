
const mongoose = require('mongoose')//引入数据库
mongoose.connect('mongodb://localhost:27017/management',
     {useNewUrlParser:true,useUnifiedTopology: true}, function(err){
    if(err){
        console.log('Connection Error:' + err)
    }else{
        console.log('Connection success!')
    }
    })//连接数据库
const conn = mongoose.connection//获取连接对象
conn.on('connected',()=>{//绑定连接监听
    console.log('数据库连接成功')
})

//定义用户的数据库model
const UserSchema = mongoose.Schema({
    username:{//用户名
        type:String,
        require:true
    },
    password:{//密码
        type:String,
        require:true
    },
    realname:{//性别
        type:String
    },
    sexual:{//性别
        type:Number
    },
    signature:{//工作签名
        type:String
    },
    phonenumber:{//手机号
        type:Number
    },
    email:{//邮箱
        type:String
    },
    vip:{//VIP
        type:Boolean
    },
    avatar:{//头像
        type:String
    }
})

const WorkerSchema =mongoose.Schema({
    workername:{
        type:String,
        require:true
    },
    sexual:{
        type:Number,
        require:true
    },
    worktype:{
        type:String,
        require:true
    },
    phonenumber:{
        type:String,
        require:true
    },
})

const WorkOrderSchema =mongoose.Schema({
    userid:{
        type:String,
        require:true
    },
    ordercode:{//订立规则：订单号规则为0750+年份后三位+日期+三位数字，如07500191218001
        type:String,
        require:true
    },
    ordername:{
        type:String,
        require:true
    },
    orderstate:{
        type:Number,
        require:true
    },
    worktype:{
        type:Number,
        require:true
    },
    ordercaptain:{
        type:String,
        require:true
    },
    cocompany:{
        type:String,
        require:true
    },
    moneyamount:{
        type:Number,
        require:true
    },
})

const UserModel = mongoose.model('user',UserSchema)

const WorkerModel = mongoose.model('worker',WorkerSchema)

const WorkOrderModel = mongoose.model('workOrder',WorkOrderSchema)

exports.UserModel = UserModel
exports.WorkerModel = WorkerModel
exports.WorkOrderModel = WorkOrderModel