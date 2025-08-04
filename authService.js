import { createHash } from "crypto";

export class AuthService {
    constructor(dbService) {
        this.dbService = dbService;
    }

    async loginUser(username, password) {
        /*
        Tries to log a user in. If provided passwords' hashes match,
        returns user's ID. Otherwise returns null.
        */
        const passwordHash = hash(password);
        const userResult = await this.dbService.getUserByUsername(username);
        if (!userResult) {
            return { success: false, isWrongUsername: true };
        }
        const user = userResult;
        if (passwordHash !== user.password_hash) {
            return { success: false, isWrongPassword: true };
        }
        return { success: true, userId: user.id, username: user.username };
    }

    async registerUser(username, email, password) {
        /*
        Registers a user.
        Returns registered user's ID.
        */
       const passwordHash = hash(password);
       const newAddedUserId = this.dbService.createUser(username, email, passwordHash);
       if (!newAddedUserId) {
        console.warn(`Registration for ${username}, ${email} failed.`);
        return null;
       }
       return newAddedUserId;
    }
}


function hash(string) {
    /*
    Creates a hash using sha256
    */
    return createHash('sha256').update(string).digest('hex');
}