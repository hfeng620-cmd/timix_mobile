# TiMix Mobile 独立仓库

此项目现在作为移动端独立仓库维护，目标远端是：

```text
https://github.com/hfeng620-cmd/timix_mobile.git
```

桌面 Web 版本继续在 `timix_share` 维护，移动端 APK / Capacitor / Android 配置只放在这里。

## 分支说明

- **`main`**: 新移动端仓库主分支，GitHub Actions 默认从这里构建 APK。
- **`mobile-app`**: 旧本地迁移分支，可推送到新仓库 `main` 后继续以 `main` 为主线开发。

## 首次迁移推送

如果本地仍在旧目录 `D:\github\TiMix_Mibille` 的 `mobile-app` 分支，优先把 `origin` 指到移动端仓库：

```powershell
git remote set-url origin https://github.com/hfeng620-cmd/timix_mobile.git
git switch mobile-app
git push -u origin mobile-app:main
```

如果你仍保留 `mobile` 远端，也可以这样修正：

```powershell
git remote set-url mobile https://github.com/hfeng620-cmd/timix_mobile.git
```

不要使用 `git push --all` 或 `git push --mirror`，避免把网页分支和历史构建分支推入移动仓库。

## 开发流程

```powershell
git switch main
git pull

# 修改代码后只添加需要的源码文件，避免把 release/*.apk 和临时文件提交进去。
git status --short
git add <changed-source-files>
git commit -m "fix(mobile): 修复XXX问题"
git push
```

## 发布移动端 APK

```powershell
git switch main
git tag v1.0.x
git push origin v1.0.x

# GitHub Actions 自动构建 APK 并发布到 Release
```

## 已完成的移动端优化

- Ultimate Mobile App Audit (4阶段)
- Desktop Purge (450+ hover转换)
- Touch Ergonomics (44px标准)
- Modal -> Bottom Sheet (11个模态框)
- Visual Harmony & Safe Areas
- Feed密度优化
- Modal对比度修复

## 构建状态

- 构建触发：推送到 `main` / `mobile-app` 分支，或打 `v*` / `mobile-v*` 标签
- 构建平台：GitHub Actions
- 构建产物：TiMix-debug.apk
- 发布位置：GitHub Releases

## 注意事项

1. 不要把移动端改动提交回 `timix_share` 的网页主线。
2. 不要提交 `release/*.apk`、构建输出目录或临时 txt。
3. 移动端仓库需要配置 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 两个 GitHub Secrets。
4. Android APK workflow 只负责移动端构建，不再服务桌面 Web 部署。

## 相关链接

- Mobile Releases: https://github.com/hfeng620-cmd/timix_mobile/releases
- Mobile Issues: https://github.com/hfeng620-cmd/timix_mobile/issues
- Desktop Web Repo: https://github.com/hfeng620-cmd/timix_share
