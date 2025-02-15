import { User} from "@prisma/client";


export type JwtPayloadType = Pick<User, 'id'> & {

  iat: number;
  exp: number;

  
};
