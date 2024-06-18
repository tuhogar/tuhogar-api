import { extname } from 'path';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';


export const editFileName = (req: Request, file: Express.Multer.File, callback: Function) => {
  const user = req['user'] as AuthenticatedUser
  const fileExtName = extname(file.originalname);
  const randomName = uuidv4();
  callback(null, `${req.params?.advertisementid || user.userId}-${randomName}${fileExtName}`);
};

export const imageFileFilter = (req: Request, file: Express.Multer.File, callback: Function) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
    return callback(new Error('invalid.only.image.files.are.allowed'), false);
  }
  callback(null, true);
};