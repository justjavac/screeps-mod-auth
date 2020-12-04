# @screepsmod/auth

> 本项目为 screeps 私服 <https://screeps.devtips.cn> 添加了使用**用户名**和**密码**进行验证的功能。

## 安装 

1. 在服务器的 screeps 安装目录运行 `npm install @screepsmod/auth`

## 使用

### 通过 web 浏览器设置

1. 打开 steam 客户端，登录到私服(此步骤用来初始化账号信息)
2. 浏览器打开 <http://screeps.devtips.cn:21025/authmod/password/>
3. 输入密码
4. 点击 **使用 Steam 登录**
5. 当 Steam 授权成功后，密码设置成功

### 使用 Server CLI

1. 打开 screeps server CLI (在服务器上运行 `npx screeps cli` 或者通过 Steam Server UI)
2. 执行 `setPassword('Username', 'YourDesiredPassword')`
3. 现在你可以通过 API 来登录到服务器了

## API

### config.auth.authUser(username,password)

返回 `Promise`，运行结果为 user object 或者在失败的时候返回 `false`

## 使用 Github 登录

使用 GitHub 登录需要在 .screepsrc 文件中添加 github client id 和 client secret
(也可以通过设置 `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET` 环境变量)

将回调链接(callback url)设置为 `/api/auth/github/return`。例如 `http://screeps.devtips.cn:21025/api/auth/github/return`。

GitHub 的 client id 和 client secret 可以在 GitHub 设置页中看到 https://github.com/settings/developers

.screepsrc
```ini
[github]
clientId = <clientId>
clientSecret = <clientSecret>
```

## 鸣谢

本项目基于 [screepsmod-auth@2.6.2](https://github.com/ScreepsMods/screepsmod-auth) 做了修改和汉化。
