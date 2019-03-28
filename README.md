# kinStub
[![pipeline status](https://gitlab.com/k-masa2501/kinStub/badges/master/pipeline.svg)](https://gitlab.com/k-masa2501/kinStub/commits/master)
[![coverage report](https://gitlab.com/k-masa2501/kinStub/badges/master/coverage.svg)](https://gitlab.com/k-masa2501/kinStub/commits/master)  
nodejsでkintoneアプリ/プラグインの動作確認や自動テストを行う際、kintone javascript APIのスタブとして動作します。  
Stub of kintone javascript API that works with nodejs.
## 利用方法 
```
% npm install --save--dev kinstub
or
% npm install -g kinstub
```  
ソースコード中をモジュールをインポートしてください。 
```
const kintone = require("kinstub");
global.kintone = kintone(".kinStubSetting.json");
```  
引数にkintoneのdomain,username,passwordを記載したjsonファイルを指定します。これらの値はrestApiでkintoneと通信する際に
宛先情報として利用します。  
　  
.kinStubSetting.json
```
{
    "domain": "example.cybozu.com",
    "username": "example@example.com",
    "password": "example",
    "proxy": "http://example:example123@example.com:8080",
    "userinfo": {
        "default": {
            "id": "1",
            "code": "example",
            "name": "example",
            "email": "example@example.com",
            "url": "http://example.com",
            "employeeNumber": "",
            "phone": "0426-12-3456",
            "mobilePhone": "09012345678",
            "extensionNumber": "",
            "timezone": "Asia/Tokyo",
            "isGuest": "false",
            "language": "ja"
        }
    }
}
```  
## スタブについて
以下のスタブはkintoneに対してrequestを送信し、結果を得る動作をします。  
* kintone.api
* kintone.proxy
* kintone.proxy.upload
* kintone.plugin.app.proxy
* kintone.plugin.app.proxy.upload
  
kintone.api(POST)で投入したレコードは"kintone.postDataTrash()"を実行することで一括削除することが出来ます。
  
非通信系のスタブはsetメソッドを実行してダミー値を設定したのち、get系のスタブを実行します。  
例えば"kintone.app.getId”を実行したい場合は、あらかじめ"kintone.app.setId('アプリID')"を実行することで
設定したアプリIDを取得します。

```
kintone.app.setId("10");
const APLID = kintone.app.getId();
⇒ result "10"
```  
  
htmlエレメント取得系のメソッドはHTML DOMのドライバーが必要です。  
単体テスト実行時は"jsdom-global"モジュールを利用してドキュメント、ウィンドウ、その他のDOM APIをNode.js環境に注入しました。
    
引数や戻り値、メソッド名はkintone javascript APIの仕様に準じますが、間違ってたら一報をくれると幸いです。  
詳細な利用方法はテストコードを参考にしてもらえると助かります。。  
https://github.com/k-masa2501/kinStub/tree/master/test  

## 作成したスタブのリスト(2019/03/27)
* kintone.events.on
* kintone.events.off
* kintone.api
* kintone.api.url
* kintone.api.urlForGet
* kintone.getRequestToken
* kintone.api.getConcurrencyLimit
* kintone.proxy
* kintone.proxy.upload
* kintone.app.record.getId
* kintone.app.record.get
* kintone.app.record.set
* kintone.app.getQueryCondition
* kintone.app.getQuery
* kintone.app.getId
* kintone.app.getLookupTargetAppId
* kintone.app.getRelatedRecordsTargetAppId
* kintone.getLoginUser
* kintone.getUiVersion
* kintone.app.record.setFieldShown
* kintone.app.record.setGroupFieldOpen
* kintone.app.record.getFieldElement
* kintone.app.record.getHeaderMenuSpaceElement
* kintone.app.record.getSpaceElement
* kintone.app.getFieldElements
* kintone.app.getHeaderMenuSpaceElement
* kintone.app.getHeaderSpaceElement
* kintone.mobile.app.getHeaderSpaceElement
* kintone.plugin.app.getConfig
* kintone.plugin.app.setConfig
* kintone.plugin.app.proxy
* kintone.plugin.app.getProxyConfig
* kintone.plugin.app.setProxyConfig
* kintone.plugin.app.proxy.upload
