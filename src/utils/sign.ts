import jwt from 'jsonwebtoken';
import { execSync } from 'child_process';

class SignUtil {
  public normal = {
    sign: (params: any, secret: string) => {
      return jwt.sign(params, secret);
    },
    verify: (token: string, secret: string) => {
      return jwt.verify(token, secret);
    }
  };
  public rs256 = {
    generateKey: () => {
      execSync('openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:2048');
      execSync('openssl rsa -pubout -in private_key.pem -out public_key.pem');
    },
    sign(params: any, privateKey: jwt.Secret) {
      return jwt.sign(params, privateKey, {
        algorithm: 'RS256',
      });
    },
    verify(token: string, privateKey: jwt.Secret) {
      const result = jwt.verify(token, privateKey, {
        algorithms: ['RS256'],
      });
      return result;
    }
  }

  getJwt() {
    return jwt;
  }
}

export const signUtil = new SignUtil();