import bcrypt from "bcryptjs";

class passUtil {
    async compare(pass, hashedPass){
        try{if(!pass || !hashedPass){
            throw new Error("Password or hashed password is missing");
            
        }
        const isMatch = await bcrypt.compare(pass, hashedPass);
        if(!isMatch){
            throw new Error("Password does not match");
        }
        return isMatch;}
        catch(err){
            throw new Error("Error comparing password: " + err.message);
        }
    }

}

export default new passUtil();