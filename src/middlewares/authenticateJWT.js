import { error } from "console";
import jwt from "jsonwebtoken";

export const authenticateJWT = (req, res, next) => {
    try {const bearerToken = req.headers["authorization"];
    if(!bearerToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Bearer Token: ", bearerToken);
    const token = bearerToken.split(" ")[1];
    if(!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if(!decoded) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    console.log("Decoded Token: ", decoded);

    req.decoded = decoded;
    next();



}
    
    catch(err) {
        return res.status(401).json({ message: "Error authenticateJWT", error: err });
    }


}