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

### Fastify

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
