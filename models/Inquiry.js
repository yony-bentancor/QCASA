const mongoose=require('mongoose');
const S=new mongoose.Schema({legacyId:{type:String,unique:true,sparse:true,index:true},propertyId:{type:String,index:true},propertyTitle:String,name:String,phone:String,email:String,message:String,status:{type:String,index:true}},{timestamps:true});
module.exports=mongoose.models.Inquiry||mongoose.model('Inquiry',S);
