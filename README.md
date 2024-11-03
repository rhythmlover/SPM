# SPM G3T4

[![Dev Branch CI status](https://github.com/rhythmlover/SPM/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/rhythmlover/SPM/actions/workflows/ci.yml)
[![Dev Branch CI (Backend) status](https://github.com/rhythmlover/SPM/actions/workflows/ci_backend.yml/badge.svg?branch=dev)](https://github.com/rhythmlover/SPM/actions/workflows/ci_backend.yml)
[![Dev Branch CD status](https://github.com/rhythmlover/SPM/actions/workflows/cd_preview.yml/badge.svg)](https://github.com/rhythmlover/SPM/actions/workflows/cd_preview.yml)
[![Master Branch CD Status](https://github.com/rhythmlover/SPM/actions/workflows/cd_prod.yml/badge.svg)](https://github.com/rhythmlover/SPM/actions/workflows/cd_prod.yml)
G3 Team 4's IS212 SPM Project.

## Table of Contents

- [SPM G3T4](#spm-g3t4)
  - [Table of Contents](#table-of-contents)
- [Project Setup](#project-setup)
  - [Install Dependencies](#install-dependencies)
  - [Compile and Hot-Reload for Development](#compile-and-hot-reload-for-development)
  - [Compile and Minify for Production](#compile-and-minify-for-production)
- [For Dev Checks](#for-dev-checks)
  - [Run Unit Tests](#run-unit-tests)
  - [Run ESLint](#run-eslint)
  - [To fix linting issues](#to-fix-linting-issues)
  - [Formatting with Prettier](#formatting-with-prettier)
  - [Checking test coverage](#checking-test-coverage)
- [Tech Stack](#tech-stack)
- [Testing Stack](#testing-stack)
- [Scrum processes video](#scrum-processes-video)

| Role                                  |            Function             |                                   Description                                    |       Status       |
| ------------------------------------- | :-----------------------------: | :------------------------------------------------------------------------------: | :----------------: |
| Human Resources and Senior Management | View overall and team schedule  | Able to see the list and number of staff in the office and at home by department | :white_check_mark: |
| Managers and Directors                |       View team schedule        |          Able to see who is in the office and at home in own department          | :white_check_mark: |
| Managers and Directors                | Approve and reject arrangements |       Approve and reject arrangements. To have a list of pending requests        | :white_check_mark: |
| Staff                                 |       View team schedule        |          Able to see who is in the office and at home in own department          | :white_check_mark: |
| Staff                                 |        View own schedule        |                             Able to see own schedule                             | :white_check_mark: |
| Staff                                 |      Apply for arrangement      |                              Apply for arrangement                               | :white_check_mark: |
| Staff                                 |      Withdraw arrangement       |           Withdraw an approved arrangement or cancel a pending request           | :white_check_mark: |

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

You can run command below to run all CI checks locally before a push, or you can run the following checks individually

```sh
npm run checkall
```

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

### Checking test coverage

```sh
npm run coverage
```

# Tech Stack

- Vue (Composition API)
- [Bootstrap-vue-next](https://bootstrap-vue-next.github.io/bootstrap-vue-next/)
- Express.js
- Vercel
- Render
- Avien
- GitHub Actions

# Testing Stack

- Vitest + @Vue/Test-Utils@Next + JsDom (Frontend)
- Jest + Test Container (Backend)

# Scrum processes video

<a href="http://www.youtube.com/watch?feature=player_embedded&v=DTk_VyDDwBc
" target="_blank"><img src="http://img.youtube.com/vi/DTk_VyDDwBc/0.jpg" 
alt="IMAGE ALT TEXT HERE" width="240" height="180" border="10" /></a>
