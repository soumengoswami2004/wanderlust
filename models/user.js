const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");

const userSchema=new Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    username:{
      type:String,
      required:true,
    },
    mobile:{
      type:String,
      required:true
    },
     role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
    isAdmin: {
    type: Boolean,
    default: false, 
  },
  isSuperAdmin: {
  type: Boolean,
  default: false
}
,
  isBlocked: { 
    type: Boolean, 
    default: false,
  },
},{timestamps:true});

userSchema.plugin(passportLocalMongoose, {
  usernameField: "email",
  usernameUnique: false 
});


module.exports=mongoose.model("User",userSchema);