# 1Password 学生优惠激活链接生成器

纯前端网页版工具，粘贴 GitHub Student 授权后的跳转 URL，即可一键生成 1Password 学生优惠激活链接。

## 在线使用

> 部署成功后，GitHub Pages 地址通常为：
> `https://handsomezhuzhu.github.io/1password_students/`

## 本地使用

直接打开 `index.html` 即可，无需后端服务器。

如果网页提示 CORS / 网络错误，请改用 Node.js 方式运行。浏览器会限制跨域请求，但 Node.js 不受浏览器 CORS 限制。

### Node.js 本机运行

要求 Node.js 18 或更高版本。

```powershell
node -v
```

如果没有安装 Node.js，可在 Windows 上用：

```powershell
winget install OpenJS.NodeJS.LTS
```

运行方式一：启动后粘贴 URL。

```powershell
git clone https://github.com/handsomezhuzhu/1password_students.git
cd 1password_students
npm run activate
```

运行方式二：直接把 URL 作为参数传入。

```powershell
npm run activate -- "https://1password.com/developers/students/complete?code=你的code&state=你的state"
```

也可以不用 npm：

```powershell
node scripts/activate.js "https://1password.com/developers/students/complete?code=你的code&state=你的state"
```

## 使用步骤

1. 完成 GitHub Student Developer Pack 中 1Password 的授权流程。
2. 在跳转页面复制完整的 URL（例如 `https://1password.com/developers/students/complete?code=xxxxxxxxx&state=xxxxxxxxx`）。
3. 打开本工具网页，粘贴 URL，点击「生成激活链接」。
4. 按需复制「新用户注册链接」或「老用户登录链接」。

## 注意事项

- **code 通常单次使用且很快过期**，拿到 URL 后请尽快生成链接。
- 若浏览器报 CORS / 网络错误，说明该接口不支持浏览器跨域调用，可改用 Node.js 脚本或自行搭建代理。

## 部署

仓库已配置 GitHub Actions（`.github/workflows/deploy.yml`）。推送代码到 `main` 分支后会自动部署到 GitHub Pages。

如需开启 Pages：

1. 进入仓库 **Settings → Pages**。
2. Source 选择 **Deploy from a branch**。
3. Branch 选择 **gh-pages**，保存即可。

## License

MIT
