import mongoose from "mongoose";
import passportLocolMongoose from "passport-local-mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        require: true,
        unique: true
    }
});

UserSchema.plugin(passportLocolMongoose);

const User = mongoose.model('User', UserSchema);

export default User;