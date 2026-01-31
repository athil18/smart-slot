import { User as UserModel } from '../models';

declare global {
    namespace Express {
        interface Request {
            user?: UserModel;
        }
    }
}
