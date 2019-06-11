# yuque-source-sync

synchronize **yuqyue** source file to local, default file type is **markdown**.

## getting started

```bash
$ npm i yuque-source-sync -g
```

```bash
$ yuqueSync -t <token> -g <group> -r <repository> -d <dist>
```

## options

### t

the `access token` you can find here on https://www.yuque.com/settings/tokens is required

### g

the `group` arg is required

### r

the `repository` in the specified `group`

### d

the target path you wanna put yuque source file in, it should be relative to `cwd`

## have a try

assume that you wanna sync https://www.yuque.com/yuque/help source file to local `dist` folder relative to `cwd`, you can

```bash
$ yuqueSync -t <token> -g yuque -r help -d dist
```
