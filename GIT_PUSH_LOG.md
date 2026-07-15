# Git 推送记录 — 河南大学数字校园三维展示系统

## 仓库信息

| 项目 | 详情 |
|------|------|
| 本地路径 | `C:\Users\29530\WorkBuddy\2026-07-09-17-38-54\digital-campus-3d` |
| 远程仓库 | `https://github.com/li-dy-24/-test.git` |
| SSH 地址 | `git@github.com:li-dy-24/-test.git` |
| 分支 | `main` |
| SSH Key | `~/.ssh/id_ed25519`（已存在，但有密码短语） |

## 推送前的准备工作

### 1. Git 初始化 ✅
```bash
# 仓库已在本地初始化，working tree clean
git status
# On branch main
# nothing to commit, working tree clean
```

### 2. .gitignore 配置 ✅
```
node_modules/
dist/
.env          # Cesium Token 不会泄露
.DS_Store
*.local
```

### 3. 添加 README.md 和 .env.example ✅
```bash
git add .env.example README.md
git commit -m "docs: add README and .env.example"
```

## 推送过程遇到的三道关卡

### 关卡 1：SSH 密钥未配置 ❌

```bash
ssh -T git@github.com
# git@github.com: Permission denied (publickey).
```

**原因：** GitHub 未配置 SSH 公钥，或公钥未上传到 GitHub。

**排查：**
```bash
ls ~/.ssh/
# id_ed25519  id_ed25519.pub  ← 密钥存在
```

### 关卡 2：HTTPS 代理阻拦 ❌

SSH 不行，换 HTTPS：

```bash
git remote set-url origin https://github.com/li-dy-24/-test.git
git push -u origin main
# fatal: unable to access 'https://github.com/...':
# Failed to connect to github.com port 443 via 127.0.0.1
```

**原因：** Git 全局配置了代理 `http://127.0.0.1:7890`，但该代理未运行。

**排查：**
```bash
git config --global --get http.proxy
# http://127.0.0.1:7890    ← 代理已失效

env | grep PROXY
# HTTPS_PROXY=http://127.0.0.1:7897  ← 环境变量中的代理是不同的端口
```

### 关卡 3：代理通了，缺凭证 ❌

取消 Git 代理 7890，改用环境变量的 7897 代理：

```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
git config --global http.proxy http://127.0.0.1:7897
git config --global https.proxy http://127.0.0.1:7897
git push -u origin main
# fatal: could not read Username for 'https://github.com': terminal prompts disabled
```

**原因：** HTTPS 推送需要 GitHub 用户名 + Personal Access Token，但当前环境不支持交互式输入。

### 关卡 4：SSH key 有密码短语 ❌

切回 SSH：

```bash
git remote set-url origin git@github.com:li-dy-24/-test.git
eval $(ssh-agent -s)
ssh-add ~/.ssh/id_ed25519
# Enter passphrase for /c/Users/29530/.ssh/id_ed25519:  ← 需要交互输入
```

## 解决方案（二选一）

### 方案 A：输入 SSH 密码短语（推荐）

在本机终端中执行：

```bash
cd C:\Users\29530\WorkBuddy\2026-07-09-17-38-54\digital-campus-3d
git remote set-url origin git@github.com:li-dy-24/-test.git
ssh-add ~/.ssh/id_ed25519    # 输入你的 SSH key 密码
git push -u origin main
```

### 方案 B：使用 GitHub Personal Access Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限，生成 Token
4. 执行：

```bash
cd C:\Users\29530\WorkBuddy\2026-07-09-17-38-54\digital-campus-3d
git remote set-url origin https://<你的GitHub用户名>:<生成的Token>@github.com/li-dy-24/-test.git
git push -u origin main
```

## 当前状态

- ✅ 代码已提交（3 个 commit）
- ✅ .gitignore 保护 Token 不泄露
- ✅ .env.example 供他人配置
- ✅ README.md 项目文档就绪
- ✅ 已推送至 https://github.com/li-dy-24/-test

## 最终成功的推送命令

在 PowerShell 中执行（代理 127.0.0.1:7897 可用时）：

```powershell
cd C:\Users\29530\WorkBuddy\2026-07-09-17-38-54\digital-campus-3d
$env:HTTPS_PROXY="http://127.0.0.1:7897"
$env:HTTP_PROXY="http://127.0.0.1:7897"
git push -f origin main
```

### 失败路径总结

| 方法 | 结果 | 原因 |
|------|------|------|
| SSH（无 agent） | ❌ Permission denied | 公钥未上传 GitHub / agent 未启动 |
| SSH（有 agent） | ❌ 需要交互 | 私钥有 passphrase |
| HTTPS（无代理） | ❌ 连接超时 | 直连 GitHub 不通 |
| HTTPS（git 代理 7890） | ❌ 连接拒绝 | 7890 端口代理未运行 |
| HTTPS（env 代理 7897） | ✅ **成功** | PowerShell 设置环境变量 |

### 关键教训

1. **SSH passphrase ≠ 公钥指纹**：`SHA256:...` 是公钥指纹，passphrase 是创建密钥时自己设的密码
2. **git config 代理 ≠ 环境变量代理**：两个是独立的，端口也可能不同（7890 vs 7897）
3. **Bash `unset` 在 Git Bash 中可能不生效**：用 PowerShell 设置 `$env:HTTPS_PROXY` 更可靠
4. **Token 用完要清 URL**：`git remote set-url origin git@github.com:...` 切回 SSH 避免 Token 泄露
