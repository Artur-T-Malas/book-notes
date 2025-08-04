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
        // Check if the username and email address are not taken already
        const existingUser = await this.dbService.getUserByUsername(username);
        if (existingUser) {
            if (existingUser.username === username) {
                console.warn('An attempt has been made to create a new user for already existing username: ', username, email);
                return { success: false, statusCode: 409, alreadyExists: true };
            }
        }
        const isEmailAlreadyUsed = await this.dbService.isEmailAlreadyUsed(email);
        if (isEmailAlreadyUsed) {
            console.warn(`Tried creating user ${username} with email ${email} which is already in use.`);
            return { success: false, statusCode: 409, isEmailAlreadyUsed: isEmailAlreadyUsed };
        }
        
        const passwordHash = hash(password);
        const newAddedUserId = await this.dbService.createUser(username, email, passwordHash);
        if (!newAddedUserId) {
            console.warn(`Registration for ${username}, ${email} failed.`);
            return { success: false, statusCode: 500 };
        }
        return { success: true, userId: newAddedUserId };
    }
}


function hash(string) {
    /*
    Creates a hash using sha256
    */
    return createHash('sha256').update(string).digest('hex');
}