
## git tag
```bash
# 获取远程标签 tag 列表
git ls-remote --tags origin
# 同时删除本地+远程 tag
git tag | Where-Object { $_ -like 'v1.2.*' } | ForEach-Object { git push origin ":refs/tags/$_"; git tag -d $_ }
```
