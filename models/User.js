const mongoose=require('mongoose');
const S=new mongoose.Schema({legacyId:{type:String,unique:true,sparse:true,index:true},scope:{type:String,enum:['qpropiedades','qcasa'],required:true,index:true},role:{type:String,required:true,index:true},name:String,email:{type:String,required:true,index:true},phone:String,password:String,active:{type:Boolean,default:true},ownerId:{type:String,default:null}},{timestamps:true});
S.index({scope:1,email:1},{unique:true});
module.exports=mongoose.models.User||mongoose.model('User',S);
