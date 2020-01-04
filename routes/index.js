var express = require('express');
var router = express.Router();
const {UserModel,WorkerModel,WorkOrderModel} = require('../db/models')
const md5 = require('blueimp-md5')
const filter = {password:0,__v:0}
const date = require('silly-datetime')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//账户注册
router.post('/register',(req,res)=>{
  const {username,password} = req.body
  UserModel.findOne({username},filter,(err,user)=>{
    if(err){res.send(err)}else{
    if(user){
      //req.session.userid = user._id
      res.send({code:1,msg:'用户已存在'})
    }else{
      new UserModel({username,password:md5(password)}).save((err,user)=>{
        req.session.userid = user._id//往浏览器session保存数据
        //res.cookie('userid',user._id,{maxAge:1000*60*60*12})//浏览器保存数据，12小时内无需重复登录
        res.send({code:0,data:user})//注册成功返回数据
      })
    }}
  })
})

//账户登录
router.post('/login',(req,res)=>{
  const {username,password} = req.body
  UserModel.findOne({username,password:md5(password)},filter,(err,user)=>{
    if(err){
      res.send(err)
    }else{
      if(user){
        //登陆成功
        req.session.userid = user._id//把id值储存到session中
        //res.cookie('userid',user._id,{maxAge:1000*60*60*12})
        res.send({code:0,data:user})
      }else{
        //登陆失败
        res.send({code:1,msg:'用户名或密码错误'})
      }
    }
  })
})

//根据session的id，保存用户的资料到浏览器，实现免登录
router.get('/userinfo', function (req, res) {
  // 取出userid
  const userid = req.session.userid //从session中取值
 // 查询
  UserModel.findOne({_id: userid},filter, function (err, user) {
    // 如果没有, 返回错误提示
    if (!user) {
      // 清除浏览器保存的userid的cookie
      delete req.session.userid

      res.send({code: 1, msg: '未登录'})
    } else {
      // 如果有, 返回user
      res.send({code: 0, data: user})
    }
  })
})

//退出登录
router.get('/logout',(req,res)=>{
  delete req.session.userid
  res.end()
})

//更新个人资料
router.post('/updateuserinfo',(req,res)=>{
  const userInfo = req.body.user//关键是这里要加一个.user
  const sessionUserid = req.session.userid //从session中取值
  UserModel.findOne({_id: sessionUserid},filter, function (err, user) {
    //先确认session里的id是否正确,再确认session里的id跟现在保存的id是否同一个
    if (!user) {
      // 清除浏览器保存的userid的session
      delete req.session.userid
    return res.send({code: 1, msg: '未登录'})
    }else{
      //根据session的id找到数据库对应数据，并整个对象都替换掉
      UserModel.findByIdAndUpdate({_id:sessionUserid},userInfo,function(err,oldUser){
        if(err){
          delete req.session.userid
          res.send({code: 1})
        }else{
          //如果旧用户和更新信息不是同一个用户，也删除
          if(sessionUserid != oldUser._id){
            delete req.session.userid
            res.send({code: 1})
          }else{
            res.send({code: 0})
          }
        }
      })
    }
  })
})


//修改密码
router.post('/changepassword',(req,res)=>{
  const {oldpwd,newpwd} = req.body
  const op = md5(oldpwd)
  const np = md5(newpwd)
  const sessionUserid = req.session.userid //从session中取值
  UserModel.findOne({_id: sessionUserid}, function (err, user) {
    //先确认session里的id是否正确，防止被篡改
    if (!user) {
      // 清除浏览器保存的userid的session
      delete req.session.userid
    return res.send({code: 1, msg: '未登录'})
    }else{
      //检查旧密码是否正确
      if(op != user.password){
        return res.send({code: 1, msg: '原密码错误'})
      }else{
        //根据session的id找到数据库对应数据，并整个对象都替换掉
        UserModel.findByIdAndUpdate({_id:sessionUserid},{password:np},function(err,oldUser){
          if(err){
            delete req.session.userid
            res.send({code: 1})
          }else{
            //如果旧用户和更新信息不是同一个用户，也删除
            if(sessionUserid != oldUser._id){
              delete req.session.userid
              res.send({code: 1})
            }else{
              res.send({code: 0})
            }
          }
        })
      }
    }
  })
})


//新建工作人员
router.post('/newworker',(req,res)=>{
  const {workername,sexual,worktype,phonenumber} = req.body
  WorkerModel.findOne({workername},(err,user)=>{//先确认是否已经有该人存在
    if(err){res.send(err)}else{
      if(user){
        res.send({code:1,msg:'用户已存在'})
      }else{
        new WorkerModel({workername,sexual,worktype,phonenumber}).save((error,worker)=>{
          if(error){
            return res.send({code:1,msg:err})
          }
          if(worker){
            res.send({code:0,data:worker})
          }else{
            res.send({code:1})
          }
        })
      }
    }
  })
})

//获取worker列表
router.get('/workerlist',(req,res)=>{
  WorkerModel.find({},filter,function(err,workers){
    if(err){
      return res.send({code:1,msg:err})
    }
    if(!workers){
      res.send({code:1,msg:'没有找到任何数据'})
    }else{
      res.send({code:0,data:workers})
    }
  })
})

//删除单个worker
router.post('/deleteworker',(req,res)=>{
  const {_id} =req.body
  WorkerModel.findOne({_id},function(err,worker){
    if(err){
      return res.send({code:1,msg:err})
    }
    if(!worker){
      res.send({code:1,msg:'该人员不存在'})
    }else{
      WorkerModel.remove({_id},function(error,doc){
        if(error){
          return res.send({code:1,msg:err})
        }else{
          res.send({code:0})
        }
      })
    }
  })
})


//更新单个worker
router.post('/editworker',(req,res)=>{
  const {worker} = req.body
  
  WorkerModel.findOne({_id:worker._id},(err,wkr)=>{
    if(err){return res.send({code:1,msg:err})}
    if(!wkr){
      res.send({code:1,msg:'该人员不存在'})
    }else{
      //更新
      WorkerModel.findByIdAndUpdate({_id:worker._id},worker,(error,doc)=>{
        if(error){
          res.send({code:1,msg:error})
        }else{
          res.send({code:0})
        }
      })
    }
  })
})


//新建工单
router.post('/newworkorder',(req,res)=>{
  const {
    userid,
    ordername,
    worktype,
    ordercaptain,
    cocompany,
    moneyamount
  } = req.body
  const orderstate = 0
  //检查数据库里今日工单数，并将数量+1作为该工单号
  //先计算今日工单号开头
  let ordercode = ('750' + date.format(new Date(),'YYYMMDD') + '000')*1
  let reCode = new RegExp('^750' + date.format(new Date(),'YYYMMDD'),'g')
  WorkOrderModel.find({"ordercode":reCode},filter,function(err,workOrders){
    if(err){
      return res.send({code:1,msg:err})
    }
    ordercode =  ordercode + (workOrders.length + 1)
    ordercode = ordercode + ''
    new WorkOrderModel({
      userid,ordercode,ordername,orderstate,worktype,ordercaptain,cocompany,moneyamount
    }).save((error,workOrder)=>{
      if(error){
        return res.send({code:1,msg:error})
      }
      if(workOrder){
        res.send({code:0,data:workOrder})
      }else{
        res.send({code:1})
      }
    })
  })
})


//获取工单列表
router.get('/workorderlist',(req,res)=>{
  const userid = req.session.userid
  //先确认是否vip用户，是就直接返回所有工单，不是就按照userid查找对应工单
  UserModel.findOne({_id:userid},(err,user)=>{
    if(err){
      return res.send({code:1,msg:err})
    }
    if(!user){
      delete req.session.userid
      return res.send({code: 1, msg: '未登录'})
    }
    if(user){
      if(user.vip){
        //是vip，直接返回全部工单列表
        WorkOrderModel.find({},filter,(error,workOrders)=>{
          if(error){
            return res.send({code:1,msg:error})
          }
          return res.send({code: 0, data:workOrders})
        })
      }else{
        //不是vip，根据id返回对应工单列表
        WorkOrderModel.find({userid},filter,(error,workOrders)=>{
          if(error){
            return res.send({code:1,msg:error})
          }
          return res.send({code: 0, data:workOrders})
        })
      }
    }
  })
})




//更新单个工单
router.post('/editworkorder',(req,res)=>{
  const{orderid,ordername,orderstate,worktype,ordercaptain,cocompany,moneyamount} = req.body
  let filterOrder = {ordername,orderstate,worktype,ordercaptain,cocompany,moneyamount}
  let workOrder = {}//要更新的内容
  WorkOrderModel.findOne({_id:orderid},(err,oldWorkOrder)=>{
    if(err){
      return res.send({code:1,msg:err})
    }
    if(!oldWorkOrder){
      return res.send({code: 1, msg: '工单不存在'})
    }else{
      workOrder = oldWorkOrder
      for(let i in filterOrder){
        if(filterOrder[i] != workOrder[i]){
          workOrder[i] = filterOrder[i]
        }
      }
      WorkOrderModel.findByIdAndUpdate({_id:orderid},workOrder,(error,olddoc)=>{
        if(error){
          res.send({code:1,msg:error})
        }else{
          res.send({code:0,data:workOrder})
        }
      })
    }
  })
})

//删除单个workOrder
router.post('/deleteworkorder',(req,res)=>{
  const {_id} =req.body
  WorkOrderModel.findOne({_id},function(err,workOrder){
    if(err){
      return res.send({code:1,msg:err})
    }
    if(!workOrder){
      res.send({code:1,msg:'该人员不存在'})
    }else{
      WorkOrderModel.remove({_id},function(error,doc){
        if(error){
          return res.send({code:1,msg:err})
        }else{
          res.send({code:0})
        }
      })
    }
  })
})


//获取user列表
router.get('/userlist',(req,res)=>{
  UserModel.find({},filter,function(err,users){
    if(err){
      return res.send({code:1,msg:err})
    }
    if(!users){
      res.send({code:1,msg:'没有找到任何数据'})
    }else{
      res.send({code:0,data:users})
    }
  })
})

module.exports = router;
