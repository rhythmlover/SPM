# SPM G3T4

### Dev Branch Status
[![Dev Branch CI status](https://github.com/rhythmlover/SPM/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/rhythmlover/SPM/actions/workflows/ci.yml)
[![Master Branch Deployment Status](https://github.com/rhythmlover/SPM/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/rhythmlover/SPM/actions/workflows/cd_prod.yml)

# Project Setup

### Install Dependencies
```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

# For Dev Checks
You can run `localchecks.bat` to run all CI checks locally before a push, or you can run the following checks individually

### Run Unit Tests

```sh
npm run test
```

### Run ESLint

```sh
npm run lint
```

### To fix linting issues

```sh
npm run fix
```

### Formatting with Prettier

```sh
npm run format
```
