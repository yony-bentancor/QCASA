const mongoose=require('mongoose');
const S=new mongoose.Schema({legacyId:{type:String,unique:true,sparse:true,index:true},audience:{type:String,enum:['user','admin'],default:'user',index:true},userId:{type:String,index:true,default:null},type:String,title:String,message:String,propertyId:{type:String,index:true,default:null},read:{type:Boolean,default:false,index:true}},{timestamps:true});
module.exports=mongoose.models.Notification||mongoose.model('Notification',S);
