const mongoose=require('mongoose');
const S=new mongoose.Schema({scope:{type:String,unique:true,index:true},values:{type:mongoose.Schema.Types.Mixed,default:{}}},{timestamps:true});
module.exports=mongoose.models.Setting||mongoose.model('Setting',S);
