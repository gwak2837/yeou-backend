# 쿠팡 가격 알리미

## 💻 개발 환경

- macOS 12.6
- [Node.js](https://nodejs.org/en/) 18.12
- [Yarn](https://yarnpkg.com/getting-started/install#install-corepack) 3.3
- [Git](https://git-scm.com/download) 2.38

## ☁ Cloud

- [Vercel](https://vercel.com)
- [Google Cloud Run](https://cloud.google.com/run)
- [Google Cloud Storage](https://cloud.google.com/storage)
- [Google Cloud Build](https://cloud.google.com/build)
- [Google Container Registry](https://cloud.google.com/container-registry)
- [Oracle Virtual Machine](https://www.oracle.com/kr/cloud/compute/virtual-machines/)

## 📦 과정

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
    ...
  },
  "dependencies": {
    ...
  },
  "devDependencies": {
    ...
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
  ...
  "type": "module"
}
```

`tsconfig.json` 파일을 수정합니다:

```json
{
  "compilerOptions": {
    ...
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
  ],
  ...
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
    ...
    "jest/globals": true
  },
  "extends": [
    ...
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
  ],
  ...
}
```

`package.json` 파일을 수정합니다:

```json
{
  "scripts": {
    "lint": "eslint . --fix --ignore-path .gitignore",
    "format": "prettier . --write",
    ...
  },
  ...
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
  "sort-imports.default-sort-style": "module",

  ...
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
    "ckolkman.vscode-postgres",

    ...
  ]
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

const buildResult = esbuild.buildSync({
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

showOutfilesSize(buildResult)

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
    "build": "NODE_ENV=production node esbuild.js",
    "start": "NODE_ENV=production node -r dotenv/config out/index.cjs dotenv_config_path=.env.local",
    ...
  },
  ...
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

`src/common/constants.ts` 파일을 생성합니다:

```ts
export const NODE_ENV = process.env.NODE_ENV as string
export const PROJECT_ENV = process.env.PROJECT_ENV as string
export const K_SERVICE = process.env.K_SERVICE as string
export const PORT = process.env.PORT as string
```

### Fastify + HTTP2

> https://www.fastify.io/docs/latest/Reference/HTTP2/

`src/routes/index.ts` 파일을 수정합니다:

```ts
import { ..., LOCALHOST_HTTPS_CERT, LOCALHOST_HTTPS_KEY, PROJECT_ENV } from '../common/constants'

const fastify = Fastify({
  ...

  http2: true,
  ...(PROJECT_ENV.startsWith('local') && {
    https: {
      key: `-----BEGIN PRIVATE KEY-----\n${LOCALHOST_HTTPS_KEY}\n-----END PRIVATE KEY-----`,
      cert: `-----BEGIN CERTIFICATE-----\n${LOCALHOST_HTTPS_CERT}\n-----END CERTIFICATE-----`,
    },
  }),
})
```

`src/common/constants.ts` 파일을 수정합니다:

```ts
...
export const LOCALHOST_HTTPS_KEY = process.env.LOCALHOST_HTTPS_KEY as string
export const LOCALHOST_HTTPS_CERT = process.env.LOCALHOST_HTTPS_CERT as string
```

### Fastify + CORS

> https://github.com/fastify/fastify-cors

```bash
yarn add @fastify/cors
```

`src/routes/index.ts` 파일을 수정합니다:

```ts
import cors from '@fastify/cors'

...

export default async function startServer() {
  await fastify.register(cors, {
    origin: ['http://localhost:3000'],
  })

  ...
}
```

### Fastify + Prevent DoS

> https://github.com/fastify/fastify-rate-limit

```bash
yarn add @fastify/rate-limit
```

`src/routes/index.ts` 파일을 수정합니다:

```ts
import rateLimit from '@fastify/rate-limit'

...

export default async function startServer() {
  await fastify.register(rateLimit, {
    ...(NODE_ENV === 'development' && {
      allowList: ['127.0.0.1'],
    }),
  })

  ...
}
```

### Fastify + JWT

### Fastify + Swagger

```bash
yarn add @fastify/swagger
```

### Fastify + Schema

### Fastify + File uploader

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
