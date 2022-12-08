# 쿠팡 가격 알리미

쿠팡, 다나와, 오늘의집

## 💻 개발 환경

- macOS 12.6
- [Node.js](https://nodejs.org/en/) 18.12
- [Yarn](https://yarnpkg.com/getting-started/install#install-corepack) 3.3
- [Git](https://git-scm.com/download) 2.38

## ☁ 클라우드

- [Vercel](https://vercel.com)
- [Google Cloud Run](https://cloud.google.com/run)
- [Google Cloud Storage](https://cloud.google.com/storage)
- [Google Cloud Build](https://cloud.google.com/build)
- [Google Container Registry](https://cloud.google.com/container-registry)
- [Oracle Virtual Machine](https://www.oracle.com/kr/cloud/compute/virtual-machines/)

## 📦 설치

### 소스코드 다운로드

프로젝트 소스코드를 다운로드 받고 의존 패키지를 설치합니다.

```
git clone https://github.com/rmfpdlxmtidl/jayudam-backend.git
cd jayudam-backend
yarn
```

### PostgreSQL 서버 실행

PostgreSQL 서버를 설정하는 방법은 아래와 같이 2가지 있습니다.

#### 1. Docker 환경

아래는 SSL 연결만 허용하는 설정입니다.

```bash
# set variables
POSTGRES_HOST=DB서버주소
POSTGRES_USER=DB계정이름
POSTGRES_PASSWORD=DB계정암호
POSTGRES_DB=DB이름
POSTGRES_DOCKER_VOLUME_NAME=DB도커볼륨이름

# https://www.postgresql.org/docs/14/ssl-tcp.html
openssl req -new -nodes -text -out root.csr \
  -keyout root.key -subj "/CN=$POSTGRES_USER"

chmod og-rwx root.key

openssl x509 -req -in root.csr -text -days 3650 \
  -extfile /etc/ssl/openssl.cnf -extensions v3_ca \
  -signkey root.key -out root.crt

openssl req -new -nodes -text -out server.csr \
  -keyout server.key -subj "/CN=$POSTGRES_HOST"

openssl x509 -req -in server.csr -text -days 365 \
  -CA root.crt -CAkey root.key -CAcreateserial \
  -out server.crt

# https://stackoverflow.com/questions/55072221/deploying-postgresql-docker-with-ssl-certificate-and-key-with-volumes
sudo chown 0:70 server.key
sudo chmod 640 server.key

# https://www.postgresql.org/docs/14/auth-pg-hba-conf.html
echo "
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# 'local' is for Unix domain socket connections only
local   all             all                                     trust
# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
# IPv6 local connections:
host    all             all             ::1/128                 trust
# Allow replication connections from localhost, by a user with the
# replication privilege.
local   replication     all                                     trust
host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust

hostssl all all all scram-sha-256
" > pg_hba.conf

# start a postgres docker container, mapping the .key and .crt into the image.
sudo docker volume create $POSTGRES_DOCKER_VOLUME_NAME
sudo docker container create --name dummy-container --volume $POSTGRES_DOCKER_VOLUME_NAME:/root hello-world
sudo docker cp ./root.crt dummy-container:/root
sudo docker cp ./server.crt dummy-container:/root
sudo docker cp ./server.key dummy-container:/root
sudo docker cp ./pg_hba.conf dummy-container:/root
sudo docker rm dummy-container

sudo docker run \
  -d \
  -e POSTGRES_USER=$POSTGRES_USER \
  -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD \
  -e POSTGRES_DB=$POSTGRES_DB \
  -e LANG=ko_KR.UTF8 \
  -e LC_COLLATE=C \
  -e POSTGRES_INITDB_ARGS=--data-checksums \
  --name postgres \
  -p 5432:5432 \
  --restart=on-failure \
  --shm-size=256MB \
  --volume $POSTGRES_DOCKER_VOLUME_NAME:/var/lib/postgresql \
  postgres:14-alpine \
  -c ssl=on \
  -c ssl_ca_file=/var/lib/postgresql/root.crt \
  -c ssl_cert_file=/var/lib/postgresql/server.crt \
  -c ssl_key_file=/var/lib/postgresql/server.key \
  -c hba_file=/var/lib/postgresql/pg_hba.conf
```

위 명령어를 실행하면 아래와 같은 파일이 생성됩니다.

- `pg_hba.conf`: PostgreSQL 클라이언트 연결 방식 설정
- `root.crt`: 루트 인증서. 서버에서 사용. 클라이언트 쪽에 복사
- `root.csr`: ?
- `root.key`: 루트/리프 인증서 생성 시 필요. 유츌되면 새로 만들어야 함
- `server.crt`: 리프 인증서. 서버에서 사용
- `server.csr`: ?
- `server.key`: 리프 인증서 생성 시 필요. 서버에서 사용

그리고 아래 스크립트를 실행하거나 수동으로 데이터베이스에 더미 데이터를 넣어줍니다.

```
yarn import
```

#### 2. PostgreSQL 환경

PostgreSQL 서버에 접속해서 아래와 같이 사용자와 데이터베이스를 생성합니다. PostgreSQL 기본 관리자 이름은 `postgres` 입니다.

```sql
CREATE USER DB_사용자_이름 WITH PASSWORD 'DB_사용자_비밀번호';
CREATE DATABASE DB_이름 OWNER DB_사용자_이름 TEMPLATE template0 LC_COLLATE "C" LC_CTYPE "ko_KR.UTF-8";

\c DB_이름 DB_관리자_이름
ALTER SCHEMA public OWNER TO DB_사용자_이름;
```

그리고 아래 스크립트를 실행하거나 수동으로 데이터베이스에 더미 데이터를 넣어줍니다.

```
yarn import
```

### Redis 서버 실행

Redis 서버를 실행합니다.

```bash
# https://redis.io/docs/manual/security/encryption/
git clone https://github.com/redis/redis.git
vi ./redis/utils/gen-test-certs.sh
```

인증서의 CN을 수정해줍니다.

```bash
# set variables
REDIS_USER=REDIS_계정_이름
REDIS_PASSWORD=REDIS_계정_암호
REDIS_HOST=REDIS_주소
REDIS_DOCKER_VOLUME_NAME=REDIS_도커_볼륨_이름

# generate certificates
# https://github.com/redis/redis/blob/unstable/utils/gen-test-certs.sh
./redis/utils/gen-test-certs.sh $REDIS_HOST

echo "
user default off
user $REDIS_USER on >$REDIS_PASSWORD allkeys allchannels allcommands
" > users.acl

# https://github.com/moby/moby/issues/25245#issuecomment-365970076
sudo docker volume create $REDIS_DOCKER_VOLUME_NAME
sudo docker container create --name dummy-container -v $REDIS_DOCKER_VOLUME_NAME:/root hello-world
sudo docker cp ./tests/tls/server.crt dummy-container:/root
sudo docker cp ./tests/tls/server.key dummy-container:/root
sudo docker cp ./tests/tls/ca.crt dummy-container:/root
sudo docker cp ./tests/tls/redis.dh dummy-container:/root
sudo docker cp ./users.acl dummy-container:/root
sudo docker rm dummy-container

sudo docker run \
  --detach \
  -e REDIS_PASSWORD=redis \
  --name=redis \
  --publish 6379:6379 \
  --restart=on-failure \
  --volume $REDIS_DOCKER_VOLUME_NAME:/data \
  redis:7-alpine \
  redis-server \
  --loglevel warning \
  --tls-port 6379 --port 0 \
  --tls-cert-file /data/server.crt \
  --tls-key-file /data/server.key \
  --tls-ca-cert-file /data/ca.crt \
  --tls-dh-params-file /data/redis.dh \
  --appendonly yes --appendfsync no \
  --requirepass $REDIS_PASSWORD \
  --aclfile /data/users.acl
```

그리고 아래와 같은 명령어로 Redis 서버에 접속할 수 있습니다. `client.crt`, `client.key`, `ca.crt` 파일은 서버에서 가져옵니다.

```bash
redis-cli \
  -h $REDIS_HOST \
  -p 포트번호 \
  --user $REDIS_USER \
  --askpass \
  --tls \
  --cert ./client.crt \
  --key ./client.key \
  --cacert ./ca.crt
```

### 환경변수 제작

루트 폴더에 아래와 같은 내용이 담긴 환경 변수 파일을 생성합니다.

필요한 환경변수 목록은 [`src/common/constants.ts`](src/common/constants.ts) 파일 안에 있습니다.

- `.env.local`: `yarn start` 실행 시 필요
- `.env.local.dev`: `yarn dev` 실행 시 필요
- `.env.local.docker`: `docker-compose up` 실행 시 필요
- `.env.test`: `yarn test` 실행 시 필요

### Node.js 서버 실행

Node.js 서버를 실행하는 방법은 아래와 같이 3가지 있습니다.

1. 동적 번들링 및 Nodemon으로 서버를 실행합니다.

```
yarn dev
```

2. TypeScript 파일을 JavaScript로 트랜스파일 및 번들링 후 Node.js로 서버를 실행합니다.

```
yarn build && yarn start
```

3. Docker 환경에서 Node.js 서버, PostgreSQL 서버, Redis 서버를 실행합니다.

```
docker-compose --env-file .env.local.docker up --detach --build --force-recreate
```

### CI/CD

GitHub에 push 할 때마다 자동으로 `Cloud Build`에서 새로운 Docker 이미지를 만들어서 `Container Registry`에 저장합니다. 그리고 `Cloud Run`에 요청이 들어오면 새로운 이미지를 기반으로 Docker 컨테이너를 생성합니다.

## 👨‍💻 개발 과정

### Yarn berry

> https://yarnpkg.com/getting-started/install

```bash
corepack enable
mkdir 폴더이름
cd 폴더이름
yarn init -2
```

### Git

> https://www.toptal.com/developers/gitignore

`.gitignore` 파일을 생성하고 적절히 수정합니다.

`.gitattributes` 파일을 아래와 같이 생성합니다:

```
# Auto detect text files and perform LF normalization
* text eol=lf

# These files are binary and should be left untouched
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.webp binary
*.pdf binary

*.otf binary
*.ttf binary
*.woff binary
*.woff2 binary

그외 바이너리로 취급할 파일 목록
```

### package.json

> https://docs.npmjs.com/cli/v8/configuring-npm/package-json

`package.json` 파일을 수정합니다:

```json
{
  "name": "프로젝트 이름",
  "version": "프로젝트 버전",
  "description": "프로젝트 설명",
  "homepage": "홈페이지 주소",
  "bugs": {
    "url": "버그 제보 주소",
    "email": "버그 제보 이메일"
  },
  "license": "라이선스",
  "author": "개발자",
  "main": "프로그램 진입점 파일 경로",
  "repository": "저장소 주소",
  "scripts": {
    // ...
  },
  "dependencies": {
    // ...
  },
  "devDependencies": {
    // ...
  },
  "engines": {
    "node": ">=18.2.0"
  },
  "private": true,
  "packageManager": "yarn@3.3.0"
}
```

### TypeScript

> https://www.typescriptlang.org/download \
> https://stackoverflow.com/questions/72380007/what-typescript-configuration-produces-output-closest-to-node-js-18-capabilities/72380008#72380008

```bash
yarn add --dev typescript
yarn tsc --init
```

`package.json` 파일을 수정합니다:

```json
{
  // ...
  "type": "module"
}
```

`tsconfig.json` 파일을 수정합니다:

```json
{
  "compilerOptions": {
    // ...
    "allowSyntheticDefaultImports": true,
    "lib": ["ES2022"],
    "module": "ES2022",
    "moduleResolution": "node",
    "target": "ES2022"
  }
}
```

### Prettier

> https://prettier.io/docs/en/install.html

Prettier를 설치합니다.

```bash
yarn add --dev --exact prettier
echo {}> .prettierrc.json
```

`.prettierrc.json` 파일을 수정합니다:

```json
{
  "printWidth": 100,
  "semi": false,
  "singleQuote": true
}
```

`.prettierignore` 파일을 아래와 같이 생성합니다:

```
.yarn
.pnp.*
```

### ESLint

> https://eslint.org/docs/latest/user-guide/getting-started \
> https://github.com/standard/eslint-config-standard \
> https://github.com/import-js/eslint-plugin-import \
> https://github.com/weiran-zsd/eslint-plugin-node#readme \
> https://github.com/xjamundx/eslint-plugin-promise \

```bash
npm init @eslint/config -- --config standard
✔ How would you like to use ESLint? · style
✔ What type of modules does your project use? · esm
✔ Which framework does your project use? · none
✔ Does your project use TypeScript? · No / Yes
✔ Where does your code run? · node
✔ How would you like to define a style for your project? · guide
✔ Which style guide do you want to follow? · standard
✔ What format do you want your config file to be in? · JSON
Checking peerDependencies of eslint-config-standard@latest
Local ESLint installation not found.
The config that you've selected requires the following dependencies:

@typescript-eslint/eslint-plugin@latest eslint-config-standard@latest eslint@^8.0.1 eslint-plugin-import@^2.25.2 eslint-plugin-n@^15.0.0 eslint-plugin-promise@^6.0.0 @typescript-eslint/parser@latest
✔ Would you like to install them now? · No

yarn add --dev @typescript-eslint/eslint-plugin@latest eslint-config-standard@latest eslint@^8.0.1 eslint-plugin-import@^2.25.2 eslint-plugin-n@^15.0.0 eslint-plugin-promise@^6.0.0 @typescript-eslint/parser@latest
```

`eslintrc.json` 파일을 수정합니다:

```json
{
  "env": {
    "es2022": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:n/recommended",
    "plugin:promise/recommended",
    "plugin:@typescript-eslint/recommended",
    "standard"
  ]
  // ...
}
```

### ESLint + (Prettier, Jest)

> https://github.com/prettier/eslint-config-prettier \
> https://github.com/jest-community/eslint-plugin-jest

```bash
yarn add --dev eslint eslint-plugin-jest eslint-config-prettier
```

`eslintrc.json` 파일을 수정합니다:

```json
{
  "env": {
    // ...
    "jest/globals": true
  },
  "extends": [
    // ...
    "prettier"
  ],
  "overrides": [
    {
      "extends": ["plugin:jest/all"],
      "files": ["test/**"],
      "rules": {
        "jest/prefer-expect-assertions": "off"
      }
    }
  ]
  // ...
}
```

`package.json` 파일을 수정합니다:

```json
{
  "scripts": {
    "lint": "eslint . --fix --ignore-path .gitignore",
    "format": "prettier . --write"
    // ...
  }
  // ...
}
```

### Yarn berry + (ESLint, Prettier, TypeScript, VSCode, Next.js)

> https://yarnpkg.com/getting-started/editor-sdks \
> https://yarnpkg.com/cli/upgrade-interactive

```bash
yarn dlx @yarnpkg/sdks vscode
yarn plugin import interactive-tools
```

### Husky

> https://typicode.github.io/husky/#/?id=automatic-recommended \
> https://typicode.github.io/husky/#/?id=yarn-on-windows

Husky를 설치합니다.

```bash
yarn dlx husky-init --yarn2 && yarn
```

`.husky/common.sh` 파일을 생성합니다:

```sh
command_exists () {
  command -v "$1" >/dev/null 2>&1
}

# Workaround for Windows 10, Git Bash and Yarn
if command*exists winpty && test -t 1; then
  exec < /dev/tty
fi
```

`.husky/pre-push` 파일을 수정합니다:

```sh
#!/usr/bin/env sh
. "$(dirname -- "$0")/*/husky.sh"
. "$(dirname -- "$0")/common.sh"

yarn tsc
```

### VSCode

`.vscode/settings.json` 파일을 수정합니다:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnPaste": true,
  "editor.formatOnSave": true,
  "editor.insertSpaces": true,
  "editor.tabSize": 2,
  "files.autoSave": "onFocusChange",
  "files.eol": "\n",
  "sort-imports.default-sort-style": "module"

  // ...
}
```

`.vscode/recommendations.json` 파일을 수정합니다:

```json
{
  "recommendations": [
    "visualstudioexptteam.vscodeintellicode",
    "christian-kohler.npm-intellisense",
    "christian-kohler.path-intellisense",
    "tabnine.tabnine-vscode",
    "amatiasq.sort-imports",
    "ms-azuretools.vscode-docker",
    "bradymholt.pgformatter",
    "foxundermoon.shell-format",
    "ckolkman.vscode-postgres"

    // ...
  ]
}
```

### Environment variables

> https://github.com/motdotla/dotenv

```bash
yarn add dotenv
```

아래 파일을 생성합니다:

| 파일 이름           | `NODE_ENV`  | 환경     | 특징            |
| ------------------- | ----------- | -------- | --------------- |
| `.env`              | production  | 클라우드 | 실 서버         |
| `.env.dev`          | production  | 클라우드 | 스테이징 서버   |
| `.env.local`        | production  | 로컬     | 코드 축소       |
| `.env.local.dev`    | development | 로컬     | Fast refresh    |
| `.env.local.docker` | production  | 로컬     | Docker 컨테이너 |

`src/common/constants.ts` 파일을 생성합니다:

```ts
// 자동
export const NODE_ENV = process.env.NODE_ENV as string
export const K_SERVICE = process.env.K_SERVICE as string // GCP에서 실행 중일 때
export const PORT = (process.env.PORT ?? '4000') as string

// 공통
export const PROJECT_ENV = (process.env.PROJECT_ENV ?? '') as string
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string

if (!PROJECT_ENV) throw new Error('`PROJECT_ENV` 환경 변수를 설정해주세요.')
if (!JWT_SECRET_KEY) throw new Error('`JWT_SECRET_KEY` 환경 변수를 설정해주세요.')

// 개별
export const LOCALHOST_HTTPS_KEY = process.env.LOCALHOST_HTTPS_KEY as string
export const LOCALHOST_HTTPS_CERT = process.env.LOCALHOST_HTTPS_CERT as string

if (PROJECT_ENV.startsWith('local')) {
  if (!LOCALHOST_HTTPS_KEY) throw new Error('`LOCALHOST_HTTPS_KEY` 환경 변수를 설정해주세요.')
  if (!LOCALHOST_HTTPS_CERT) throw new Error('`LOCALHOST_HTTPS_CERT` 환경 변수를 설정해주세요.')
}
```

### Nodemon

> https://github.com/remy/nodemon

```bash
yarn add --dev nodemon
```

`nodemon.json` 파일을 생성합니다:

```json
{
  "ext": "cjs",
  "watch": ["out"]
}
```

### esbuild

> https://esbuild.github.io/getting-started/#bundling-for-node \
> https://esbuild.github.io/api/#metafile

```bash
yarn add --dev esbuild
```

`esbuild.js` 파일을 생성합니다:

```js
import esbuild from 'esbuild'

const NODE_ENV = process.env.NODE_ENV

esbuild
  .build({
    bundle: true,
    entryPoints: ['src/index.ts'],
    loader: {
      '.sql': 'text',
    },
    metafile: true,
    minify: NODE_ENV === 'production',
    outfile: 'out/index.cjs',
    platform: 'node',
    target: ['node18'],
    treeShaking: true,
    watch: NODE_ENV === 'development' && {
      onRebuild: (error, result) => {
        if (error) {
          console.error('watch build failed:', error)
        } else {
          showOutfilesSize(result)
        }
      },
    },
  })
  .then((result) => showOutfilesSize(result))
  .catch((error) => {
    throw new Error(error)
  })

function showOutfilesSize(result) {
  const outputs = result.metafile.outputs
  for (const output in outputs) {
    console.log(`${output}: ${(outputs[output].bytes / 1_000_000).toFixed(2)} MB`)
  }
}
```

`package.json` 파일을 수정합니다:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development node esbuild.js & NODE_ENV=development nodemon -r dotenv/config out/index.cjs dotenv_config_path=.env.local.dev",
    "build": "NODE_ENV=production node esbuild.js",
    "start": "NODE_ENV=production node -r dotenv/config out/index.cjs dotenv_config_path=.env.local"
    // ...
  }
  // ...
}
```

`src/global-env.d.ts` 파일을 생성합니다:

```ts
declare module '*.sql' {
  const content: string
  export default content
}
```

### Fastify

> https://www.fastify.io/docs/latest/Guides/Getting-Started/ \

```bash
yarn add fastify
```

`src/routes/index.ts` 파일을 생성합니다:

```ts
import Fastify from 'fastify'

import { K_SERVICE, NODE_ENV, PORT, PROJECT_ENV } from '../common/constants'
import productRoute from './product'
import userRoute from './user'

const fastify = Fastify({
  logger: NODE_ENV === 'production',
})

fastify.register(productRoute)
fastify.register(userRoute)

export default async function startServer() {
  try {
    await fastify.listen({ port: +PORT, host: K_SERVICE ? '0.0.0.0' : 'localhost' })
  } catch (err) {
    fastify.log.error(err)
    throw new Error()
  }
}
```

`.vscode/typescript.code-snippets` 파일을 생성합니다:

```json
{
  "Fastify Routes": {
    "prefix": "routes",
    "body": [
      "import { FastifyInstance } from 'fastify'",
      "",
      "export default async function routes(fastify: FastifyInstance, options: object) {",
      "  fastify.get('/${TM_FILENAME_BASE}', async (request, reply) => {",
      "    return { hello: '${TM_FILENAME_BASE}' }",
      "  })",
      "}",
      ""
    ],
    "description": "Fastify Routes"
  }
}
```

`src/routes/product.ts` 파일을 생성하고 `routes` 단축어를 입력해 아래 코드를 자동 완성합니다:

```ts
import { FastifyInstance } from 'fastify'

export default async function routes(fastify: FastifyInstance, options: object) {
  fastify.get('/product', async (request, reply) => {
    return { hello: 'product' }
  })
}
```

`src/routes/user.ts` 파일을 생성하고 `routes` 단축어를 입력해 아래 코드를 자동 완성합니다:

```ts
import { FastifyInstance } from 'fastify'

export default async function routes(fastify: FastifyInstance, options: object) {
  fastify.get('/user', async (request, reply) => {
    return { hello: 'user' }
  })
}
```

### Fastify + HTTP2

> https://www.fastify.io/docs/latest/Reference/HTTP2/

`src/routes/index.ts` 파일을 수정합니다:

```ts
import {
  // ...
  LOCALHOST_HTTPS_CERT,
  LOCALHOST_HTTPS_KEY,
  PROJECT_ENV,
} from '../common/constants'

const fastify = Fastify({
  // ...
  http2: true,
  ...(PROJECT_ENV.startsWith('local') && {
    https: {
      key: `-----BEGIN PRIVATE KEY-----\n${LOCALHOST_HTTPS_KEY}\n-----END PRIVATE KEY-----`,
      cert: `-----BEGIN CERTIFICATE-----\n${LOCALHOST_HTTPS_CERT}\n-----END CERTIFICATE-----`,
    },
  }),
})

// ...
```

HTTPS 인증서를 생성합니다:

```bash

```

### Fastify + CORS

> https://github.com/fastify/fastify-cors

```bash
yarn add @fastify/cors
```

`src/routes/index.ts` 파일을 수정합니다:

```ts
import cors from '@fastify/cors'

// ...

fastify.register(cors, {
  origin: [
    'http://localhost:3000',
    // ...
  ],
})
```

### Fastify + Prevent DoS

> https://github.com/fastify/fastify-rate-limit

```bash
yarn add @fastify/rate-limit
```

`src/routes/index.ts` 파일을 수정합니다:

```ts
import rateLimit from '@fastify/rate-limit'

// ...

fastify.register(rateLimit, {
  ...(NODE_ENV === 'development' && {
    allowList: ['127.0.0.1'],
  }),
})
```

### Fastify + JWT

> https://github.com/fastify/fastify-jwt

```bash
yarn add @fastify/jwt
```

`src/routes/index.ts` 파일을 수정합니다:

```ts
import fastifyJWT from '@fastify/jwt'
import {
  // ...
  JWT_SECRET_KEY,
} from '../common/constants'

// ...

fastify.register(fastifyJWT, {
  secret: JWT_SECRET_KEY,
})

type QuerystringJWT = {
  Querystring: {
    jwt?: string
  }
}

fastify.addHook<QuerystringJWT>('onRequest', async (request, reply) => {
  const jwt = request.headers.authorization ?? request.query.jwt
  if (!jwt) return

  request.headers.authorization = jwt

  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
})
```

### Fastify + Schema

> https://www.fastify.io/docs/latest/Reference/Type-Providers/ \
> https://github.com/sinclairzx81/typebox \
> https://github.com/fastify/fastify-type-provider-typebox

```bash
yarn add @sinclair/typebox
yarn add --dev @fastify/type-provider-typebox
```

`src/routes/index.ts` 파일을 수정합니다:

```ts
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import { Type } from '@sinclair/typebox'

// ...

const fastify = Fastify({
  // ...
}).withTypeProvider<TypeBoxTypeProvider>()

const schema = {
  schema: {
    querystring: Type.Object({
      foo: Type.Optional(Type.Number()),
      bar: Type.Optional(Type.String()),
    }),
    response: {
      200: Type.Object({
        hello: Type.String(),
        foo: Type.Optional(Type.Number()),
        bar: Type.Optional(Type.String()),
      }),
    },
  },
}

fastify.get('/', schema, async (request, _) => {
  const { foo, bar } = request.query
  return { hello: 'world', foo, bar }
})
```

### Fastify + Swagger

```bash
yarn add @fastify/swagger
```

### Fastify + File uploader

```bash
yarn add
```

### PostgreSQL

> https://node-postgres.com/ \
> https://pgtyped.vercel.app/docs/getting-started

```bash
yarn add pg
yarn add --dev @types/pg
yarn add --dev @pgtyped/cli @pgtyped/query
```

`pgtyped.config.json` 파일을 생성합니다:

```json
{
  "transforms": [
    {
      "mode": "sql",
      "include": "**/*.sql",
      "emitTemplate": "{{dir}}/{{name}}.ts"
    }
  ],
  "srcDir": "src/"
}
```

`database/export.ts` 파일을 생성합니다:
`database/import.ts` 파일을 생성합니다:
`database/index.ts` 파일을 생성합니다:
`database/pgtyped.sh` 파일을 생성합니다:

`package.json` 파일을 수정합니다:

```json
{
  "scripts": {
    "pgtyped": "database/pgtyped.sh",
    "export": "tsc --project database/tsconfig.json && node database/dist/export.js",
    "import": "tsc --project database/tsconfig.json && node database/dist/import.js",
    ...
  },
  ...
}
```

### Script: dev

https://stackoverflow.com/a/35455532/16868717 \
