import { existsSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenvExpand = require('dotenv-expand');

const env =
  process.env.NODE_ENV === 'production' ? 'production' : 'development';
const envs = [`.env.${env}.local`, `.env.${env}`, '.env'];

envs.forEach((file) => {
  const filePath = resolve(process.cwd(), file);

  if (existsSync(filePath)) {
    dotenvExpand.expand(config({ path: filePath }));
  }
});
