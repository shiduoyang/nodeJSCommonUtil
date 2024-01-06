import path from 'path';
import { signUtil } from '../src/user/sign';
import fs from 'fs';

function testNormal() {
  const normal = signUtil.normal;
  const token = normal.sign({ a: 1 }, 'hello');
  console.log(token);
  const result = normal.verify(token, 'hello');
  console.log(result);
}

// testNormal();

function testRS256() {
  // signUtil.rs256.generateKey();
  const token = signUtil.rs256.sign({ a: 1 }, fs.readFileSync(path.join(__dirname, '../tmp/private_key.pem')));
  console.log(token);
  const result = signUtil.rs256.verify(token, fs.readFileSync(path.join(__dirname, '../tmp/public_key.pem')));
  console.log(result);
}

testRS256();