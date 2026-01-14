# Kiro Console

涓€涓敤 Rust 缂栧啓鐨?Anthropic Claude API 鍏煎浠ｇ悊鏈嶅姟锛屽皢 Anthropic API 璇锋眰杞崲涓?Kiro API 璇锋眰銆?

## 鍏嶈矗澹版槑
鏈」鐩粎渚涚爺绌朵娇鐢? Use at your own risk, 浣跨敤鏈」鐩墍瀵艰嚧鐨勪换浣曞悗鏋滅敱浣跨敤浜烘壙鎷? 涓庢湰椤圭洰鏃犲叧銆?
鏈」鐩笌 AWS/KIRO/Anthropic/Claude 绛夊畼鏂规棤鍏? 鏈」鐩笉浠ｈ〃瀹樻柟绔嬪満銆?

## 娉ㄦ剰锛?
鍥?tls 搴撲粠 native-tls 鍒囨崲鑷?rustls, 浣犲彲鑳介渶瑕佷笓闂ㄥ畨瑁呰瘉涔﹀悗鎵嶈兘閰嶇疆 HTTP PROXY

## 鍔熻兘鐗规€?

- **Anthropic API 鍏煎**: 瀹屾暣鏀寔 Anthropic Claude API 鏍煎紡
- **娴佸紡鍝嶅簲**: 鏀寔 SSE (Server-Sent Events) 娴佸紡杈撳嚭
- **Token 鑷姩鍒锋柊**: 鑷姩绠＄悊鍜屽埛鏂?OAuth Token
- **澶氬嚟鎹敮鎸?*: 鏀寔閰嶇疆澶氫釜鍑嵁锛屾寜浼樺厛绾ц嚜鍔ㄦ晠闅滆浆绉?
- **鏅鸿兘閲嶈瘯**: 鍗曞嚟鎹渶澶氶噸璇?3 娆★紝鍗曡姹傛渶澶氶噸璇?9 娆?
- **鍑嵁鍥炲啓**: 澶氬嚟鎹牸寮忎笅鑷姩鍥炲啓鍒锋柊鍚庣殑 Token
- **Thinking 妯″紡**: 鏀寔 Claude 鐨?extended thinking 鍔熻兘
- **宸ュ叿璋冪敤**: 瀹屾暣鏀寔 function calling / tool use
- **澶氭ā鍨嬫敮鎸?*: 鏀寔 Sonnet銆丱pus銆丠aiku 绯诲垪妯″瀷

## 鏀寔鐨?API 绔偣

| 绔偣 | 鏂规硶 | 鎻忚堪          |
|------|------|-------------|
| `/v1/models` | GET | 鑾峰彇鍙敤妯″瀷鍒楄〃    |
| `/v1/messages` | POST | 鍒涘缓娑堟伅锛堝璇濓級    |
| `/v1/messages/count_tokens` | POST | 浼扮畻 Token 鏁伴噺 |

## 蹇€熷紑濮?

> **鍓嶇疆姝ラ**锛氱紪璇戝墠闇€瑕佸厛鏋勫缓鍓嶇 Admin UI锛?
> ```bash
> cd admin-ui && npm install && npm run build
> ```

### 1. 缂栬瘧椤圭洰

```bash
cargo build --release
```

### 2. 閰嶇疆鏂囦欢

> **鎻愮ず**锛氫粠 2026.1.5 璧凤紝绋嬪簭棣栨杩愯浼氳嚜鍔ㄧ敓鎴?`config.json`锛屽叾涓櫎 API 鐩稿叧瀵嗛挜澶栫殑瀛楁閮藉凡缁忓啓鍏ユ帹鑽愰粯璁ゅ€笺€備竴鑸儏鍐典笅鏃犻渶鎵嬪姩缂栬緫锛岀洿鎺ヨ繍琛屽苟鍦?Admin UI 涓缃鐞嗗憳瀵嗛挜涓庡澶?API Key 鍗冲彲銆傚鏋滈渶瑕佸鐩戝惉鍦板潃銆佺鍙ｆ垨浠ｇ悊鍋氶珮绾у畾鍒讹紝鍙啀缂栬緫璇ユ枃浠躲€?

鍒涘缓 `config.json` 閰嶇疆鏂囦欢锛堝彲閫夛紝鑻ヤ笉瀛樺湪鍚姩鏃朵細鑷姩鍐欏叆浠ヤ笅绀轰緥锛夛細

```json
{
   "host": "127.0.0.1",   // 蹇呴厤, 鐩戝惉鍦板潃
   "port": 8990,  // 蹇呴厤, 鐩戝惉绔彛
   "apiKey": "sk-kiro-console-qazWSXedcRFV123456",  // 蹇呴厤, 璇锋眰鐨勯壌鏉?token
   "region": "us-east-1",  // 蹇呴厤, 鍖哄煙, 涓€鑸繚鎸侀粯璁ゅ嵆鍙?
   "kiroVersion": "0.8.0",  // 鍙€? 鐢ㄤ簬鑷畾涔夎姹傜壒寰? 涓嶉渶瑕佽鍒犻櫎: kiro ide 鐗堟湰
   "machineId": "濡傛灉浣犻渶瑕佽嚜瀹氫箟鏈哄櫒鐮佽灏?4浣嶆満鍣ㄧ爜濉埌杩欓噷", // 鍙€? 鐢ㄤ簬鑷畾涔夎姹傜壒寰? 涓嶉渶瑕佽鍒犻櫎: 鏈哄櫒鐮?
   "systemVersion": "darwin#24.6.0",  // 鍙€? 鐢ㄤ簬鑷畾涔夎姹傜壒寰? 涓嶉渶瑕佽鍒犻櫎: 绯荤粺鐗堟湰
   "nodeVersion": "22.21.1",  // 鍙€? 鐢ㄤ簬鑷畾涔夎姹傜壒寰? 涓嶉渶瑕佽鍒犻櫎: node 鐗堟湰
   "countTokensApiUrl": "https://api.example.com/v1/messages/count_tokens", // 鍙€? 鐢ㄤ簬鑷畾涔塼oken缁熻API, 涓嶉渶瑕佽鍒犻櫎
   "countTokensApiKey": "sk-your-count-tokens-api-key",  // 鍙€? 鐢ㄤ簬鑷畾涔塼oken缁熻API, 涓嶉渶瑕佽鍒犻櫎
   "countTokensAuthType": "x-api-key",  // 鍙€? 鐢ㄤ簬鑷畾涔塼oken缁熻API, 涓嶉渶瑕佽鍒犻櫎
   "proxyUrl": "http://127.0.0.1:7890", // 鍙€? HTTP/SOCK5浠ｇ悊, 涓嶉渶瑕佽鍒犻櫎
   "proxyUsername": "user",  // 鍙€? HTTP/SOCK5浠ｇ悊鐢ㄦ埛鍚? 涓嶉渶瑕佽鍒犻櫎
   "proxyPassword": "pass",  // 鍙€? HTTP/SOCK5浠ｇ悊瀵嗙爜, 涓嶉渶瑕佽鍒犻櫎
   "adminApiKey": "sk-admin-your-secret-key"  // 鍙€? Admin API 瀵嗛挜, 鐢ㄤ簬鍚敤鍑嵁绠＄悊 API, 涓嶉渶瑕佽鍒犻櫎
}
```
鏈€灏忓惎鍔ㄩ厤缃负: 
```json
{
   "host": "127.0.0.1",
   "port": 8990,
   "apiKey": "sk-kiro-console-qazWSXedcRFV123456",
   "region": "us-east-1"
}
```

> 濡傛灉闇€瑕佸湪鍚姩鏃跺己鍒堕噸缃鐞嗗憳鐧诲綍瀵嗛挜鎴栧澶?API Key锛屽彲鍦ㄥ懡浠よ澧炲姞 `--reset-admin-key` 鎴?`--reset-api-key` 鍙傛暟锛屼緥濡傦細
> ```
> cargo run --release -- --reset-admin-key --config config.json --credentials credentials.json
> ```
> 杩欐牱鍦ㄨ闂?`http://127.0.0.1:PORT/admin` 鏃朵細鍐嶆杩涘叆鍒濆鍖栨祦绋嬨€?

### 3. 鍑瘉鏂囦欢

鍒涘缓 `credentials.json` 鍑瘉鏂囦欢锛堜粠 Kiro IDE 鑾峰彇锛夈€傛敮鎸佷袱绉嶆牸寮忥細

#### 鍗曞嚟鎹牸寮忥紙鏃ф牸寮忥紝鍚戝悗鍏煎锛?

```json
{
   "accessToken": "杩欓噷鏄姹倀oken 涓€鑸湁鏁堟湡涓€灏忔椂",  // 鍙€? 涓嶉渶瑕佽鍒犻櫎, 鍙互鑷姩鍒锋柊
   "refreshToken": "杩欓噷鏄埛鏂皌oken 涓€鑸湁鏁堟湡7-30澶╀笉绛?,  // 蹇呴厤, 鏍规嵁瀹為檯濉啓
   "profileArn": "杩欐槸profileArn, 濡傛灉娌℃湁璇蜂綘鍒犻櫎璇ュ瓧娈碉紝 閰嶇疆搴旇鍍忚繖涓?arn:aws:codewhisperer:us-east-1:111112222233:profile/QWER1QAZSDFGH",  // 鍙€? 涓嶉渶瑕佽鍒犻櫎
   "expiresAt": "杩欓噷鏄姹倀oken杩囨湡鏃堕棿, 涓€鑸牸寮忔槸杩欐牱2025-12-31T02:32:45.144Z, 鍦ㄨ繃鏈熷墠 kirors 涓嶄細璇锋眰鍒锋柊璇锋眰token",  // 蹇呴厤, 涓嶇‘瀹氫綘闇€瑕佸啓涓€涓凡缁忚繃鏈熺殑UTC鏃堕棿
   "authMethod": "杩欓噷鏄璇佹柟寮?social/Social 鎴栬€呮槸 idc/IdC",  // 蹇呴厤, 鏍规嵁浣?Token 鐧诲綍鏉ユ簮鍐冲畾
   "clientId": "濡傛灉浣犳槸 IdC 鐧诲綍 闇€瑕侀厤缃繖涓?,  // 鍙€? 涓嶉渶瑕佽鍒犻櫎
   "clientSecret": "濡傛灉浣犳槸 IdC 鐧诲綍 闇€瑕侀厤缃繖涓?  // 鍙€? 涓嶉渶瑕佽鍒犻櫎
}
```

#### 澶氬嚟鎹牸寮忥紙鏂版牸寮忥紝鏀寔鏁呴殰杞Щ鍜岃嚜鍔ㄥ洖鍐欙級

```json
[
   {
      "refreshToken": "绗竴涓嚟鎹殑鍒锋柊token",
      "expiresAt": "2025-12-31T02:32:45.144Z",
      "authMethod": "social",
      "priority": 0
   },
   {
      "refreshToken": "绗簩涓嚟鎹殑鍒锋柊token",
      "expiresAt": "2025-12-31T02:32:45.144Z",
      "authMethod": "idc",
      "clientId": "xxxxxxxxx",
      "clientSecret": "xxxxxxxxx",
      "region": "us-east-2",
      "priority": 1
   }
]
```

> **澶氬嚟鎹壒鎬ц鏄?*锛?
> - 鎸?`priority` 瀛楁鎺掑簭锛屾暟瀛楄秺灏忎紭鍏堢骇瓒婇珮锛堥粯璁や负 0锛?
> - 鍗曞嚟鎹渶澶氶噸璇?3 娆★紝鍗曡姹傛渶澶氶噸璇?9 娆?
> - 鑷姩鏁呴殰杞Щ鍒颁笅涓€涓彲鐢ㄥ嚟鎹?
> - 澶氬嚟鎹牸寮忎笅 Token 鍒锋柊鍚庤嚜鍔ㄥ洖鍐欏埌婧愭枃浠?
> - 鍙€夌殑 `region` 瀛楁锛氱敤浜?OIDC token 鍒锋柊鏃舵寚瀹?endpoint 鍖哄煙锛屾湭閰嶇疆鏃跺洖閫€鍒?config.json 鐨?region

鏈€灏忓惎鍔ㄩ厤缃?social):
```json
{
   "refreshToken": "XXXXXXXXXXXXXXXX",
   "expiresAt": "2025-12-31T02:32:45.144Z",
   "authMethod": "social"
}
```

鏈€灏忓惎鍔ㄩ厤缃?idc):
```json
{
   "refreshToken": "XXXXXXXXXXXXXXXX",
   "expiresAt": "2025-12-31T02:32:45.144Z",
   "authMethod": "idc",
   "clientId": "xxxxxxxxx",
   "clientSecret": "xxxxxxxxx"
}
```
### 4. 鍚姩鏈嶅姟

```bash
./target/release/kiro-console
```

鎴栨寚瀹氶厤缃枃浠惰矾寰勶細

```bash
./target/release/kiro-console -c /path/to/config.json --credentials /path/to/credentials.json
```

### 5. 浣跨敤 API

```bash
curl http://127.0.0.1:8990/v1/messages \
  -H "Content-Type: application/json" \
  -H "x-api-key: sk-your-custom-api-key" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [
      {"role": "user", "content": "Hello, Claude!"}
    ]
  }'
```

## Docker 涓€閿儴缃?
Kiro Console 鎻愪緵鑷寘鍚殑 Docker 闀滃儚锛岃剼鏈彲鍦ㄥ共鍑€ Ubuntu 涓婁竴鏉″懡浠ゅ畬鎴愬畨瑁呫€佹瀯寤轰笌鍚姩銆?
### 鏋侀€熻剼鏈紙鎺ㄨ崘锛?
```bash
curl -fsSL https://raw.githubusercontent.com/lilizero123/Kiro-Console/master/tools/docker/oneclick.sh | sudo bash
```

鑴氭湰灏嗚嚜鍔細

1. 瀹夎缂哄け鐨?Docker / Git锛圲buntu锛?2. 浼樺厛鎷夊彇棰勬瀯寤洪暅鍍忥紙榛樿 `kiro-console:latest`锛屽鏋滈暅鍍忎笉瀛樺湪鍒欒嚜鍔ㄥ厠闅?`master` 鍒嗘敮婧愮爜骞舵湰鍦版瀯寤猴級
3. 鍦?`/var/lib/kiro-console` 鍑嗗 `config.json` 涓?`credentials.json`
4. 浠?`kiro-console` 瀹瑰櫒鍚嶅惎鍔ㄥ苟鏄犲皠 `8990` 绔彛

鐜鍙橀噺鍙鐩栧叧閿厤缃細

| 鍙橀噺 | 璇存槑 | 榛樿鍊?|
|------|------|--------|
| `KIRO_CONSOLE_PORT` | 瀵瑰鏆撮湶绔彛 | `8990` |
| `KIRO_CONSOLE_IMAGE` | 鏋勫缓鍚庣殑闀滃儚鏍囩 | `kiro-console:latest` |
| `KIRO_CONSOLE_CONTAINER` | 瀹瑰櫒鍚嶇О | `kiro-console` |
| `KIRO_CONSOLE_CONFIG_DIR` | 瀹夸富鏈洪厤缃洰褰曪紙鎸傝浇鍒?`/app/config`锛?| `/var/lib/kiro-console` |
| `KIRO_CONSOLE_REPO` | Git 浠撳簱鍦板潃 | `https://github.com/lilizero123/Kiro-Console.git` |
| `KIRO_CONSOLE_BRANCH` | 鎷夊彇鍒嗘敮 | `master` |
| `KIRO_CONSOLE_FORCE_BUILD` | 璁句负 `1` 鏃跺缁堜粠婧愮爜鏋勫缓 | `0` |

> **闀滃儚绛栫暐**锛氳剼鏈細鍏堟墽琛?`docker pull ${KIRO_CONSOLE_IMAGE}`銆傚鏋滀綘宸茬粡鍦?Docker Hub/GHCR 鍙戝竷浜?`lilizero123/kiro-console:latest` 绛夐暅鍍忥紝鐢ㄦ埛鍙渶璁剧疆 `KIRO_CONSOLE_IMAGE` 鍗冲彲绉掔骇閮ㄧ讲锛涜嫢鎷夊彇澶辫触鍒欒嚜鍔ㄥ洖閫€鍒版簮鐮佹瀯寤恒€傝嫢鎯冲己鍒堕噸鏂扮紪璇戯紙渚嬪璋冭瘯鍒嗘敮锛夛紝鍙湪鍛戒护鍓嶈缃?`KIRO_CONSOLE_FORCE_BUILD=1`銆?
> **鍙戝竷鎻愮ず**锛氬缓璁湪 CI 鎴栨湰鍦版墽琛屼竴娆?`docker build -t lilizero123/kiro-console:2026.1.5 .`锛岀劧鍚?`docker push` 鍒拌嚜宸辩殑 Registry锛屽啀灏?`KIRO_CONSOLE_IMAGE` 榛樿鍊兼寚鍚戣闀滃儚锛岃繖鏍风粓绔敤鎴锋棤闇€绛夊緟婕暱鐨勭紪璇戣繃绋嬨€?
绀轰緥锛氳嚜瀹氫箟绔彛涓?`8080`

```bash
curl -fsSL https://raw.githubusercontent.com/lilizero123/Kiro-Console/master/tools/docker/oneclick.sh \
  | sudo env KIRO_CONSOLE_PORT=8080 bash
```

鍐嶆鎵ц鑴氭湰鍗冲彲鑾峰彇鏈€鏂颁唬鐮佸苟鑷姩閲嶅缓瀹瑰櫒銆?
### 鎵嬪姩鏋勫缓 / 杩愯

```bash
docker build -t kiro-console .
mkdir -p /opt/kiro-console
cp config.example.json /opt/kiro-console/config.json
cp credentials.example.multiple.json /opt/kiro-console/credentials.json
docker run -d \\
  --name kiro-console \\
  --restart unless-stopped \\
  -p 8990:8990 \\
  -v /opt/kiro-console:/app/config \\
  kiro-console:latest
```

棣栨鍚姩鍚庤闂?`http://鏈嶅姟鍣↖P:8990/admin` 璁剧疆绠＄悊鍛樺瘑閽ュ強瀵瑰 API Key銆?

## 閰嶇疆璇存槑

### config.json

| 瀛楁 | 绫诲瀷 | 榛樿鍊?| 鎻忚堪                      |
|------|------|--------|-------------------------|
| `host` | string | `127.0.0.1` | 鏈嶅姟鐩戝惉鍦板潃                  |
| `port` | number | `8080` | 鏈嶅姟鐩戝惉绔彛                  |
| `apiKey` | string | - | 鑷畾涔?API Key锛堢敤浜庡鎴风璁よ瘉锛?   |
| `region` | string | `us-east-1` | AWS 鍖哄煙                  |
| `kiroVersion` | string | `0.8.0` | Kiro 鐗堟湰鍙?               |
| `machineId` | string | - | 鑷畾涔夋満鍣ㄧ爜锛?4浣嶅崄鍏繘鍒讹級涓嶅畾涔夊垯鑷姩鐢熸垚 |
| `systemVersion` | string | 闅忔満 | 绯荤粺鐗堟湰鏍囪瘑                  |
| `nodeVersion` | string | `22.21.1` | Node.js 鐗堟湰鏍囪瘑            |
| `countTokensApiUrl` | string | - | 澶栭儴 count_tokens API 鍦板潃锛堝彲閫夛級 |
| `countTokensApiKey` | string | - | 澶栭儴 count_tokens API 瀵嗛挜锛堝彲閫夛級 |
| `countTokensAuthType` | string | `x-api-key` | 澶栭儴 API 璁よ瘉绫诲瀷锛歚x-api-key` 鎴?`bearer` |
| `proxyUrl` | string | - | HTTP/SOCKS5 浠ｇ悊鍦板潃锛堝彲閫夛級 |
| `proxyUsername` | string | - | 浠ｇ悊鐢ㄦ埛鍚嶏紙鍙€夛級 |
| `proxyPassword` | string | - | 浠ｇ悊瀵嗙爜锛堝彲閫夛級 |
| `adminApiKey` | string | - | Admin API 瀵嗛挜锛岄厤缃悗鍚敤鍑嵁绠＄悊 API锛堝彲閫夛級 |

### credentials.json

鏀寔鍗曞璞℃牸寮忥紙鍚戝悗鍏煎锛夋垨鏁扮粍鏍煎紡锛堝鍑嵁锛夈€?

| 瀛楁 | 绫诲瀷 | 鎻忚堪                      |
|------|------|-------------------------|
| `accessToken` | string | OAuth 璁块棶浠ょ墝锛堝彲閫夛紝鍙嚜鍔ㄥ埛鏂帮級    |
| `refreshToken` | string | OAuth 鍒锋柊浠ょ墝              |
| `profileArn` | string | AWS Profile ARN锛堝彲閫夛紝鐧诲綍鏃惰繑鍥烇級 |
| `expiresAt` | string | Token 杩囨湡鏃堕棿 (RFC3339)    |
| `authMethod` | string | 璁よ瘉鏂瑰紡锛坰ocial 鎴?idc锛?     |
| `clientId` | string | IdC 鐧诲綍鐨勫鎴风 ID锛堝彲閫夛級      |
| `clientSecret` | string | IdC 鐧诲綍鐨勫鎴风瀵嗛挜锛堝彲閫夛級      |
| `priority` | number | 鍑嵁浼樺厛绾э紝鏁板瓧瓒婂皬瓒婁紭鍏堬紝榛樿涓?0锛堝鍑嵁鏍煎紡鏃舵湁鏁堬級|
| `region` | string | 鍑嵁绾?region锛堝彲閫夛級锛岀敤浜?OIDC token 鍒锋柊鏃舵寚瀹?endpoint 鐨勫尯鍩熴€傛湭閰嶇疆鏃跺洖閫€鍒?config.json 鐨?region銆傛敞鎰忥細API 璋冪敤濮嬬粓浣跨敤 config.json 鐨?region |
| `machineId` | string | 鍑嵁绾ф満鍣ㄧ爜锛堝彲閫夛紝64浣嶅崄鍏繘鍒讹級銆傛湭閰嶇疆鏃跺洖閫€鍒?config.json 鐨?machineId锛涢兘鏈厤缃椂鐢?refreshToken 娲剧敓 |

## 妯″瀷鏄犲皠

| Anthropic 妯″瀷 | Kiro 妯″瀷 |
|----------------|-----------|
| `*sonnet*` | `claude-sonnet-4.5` |
| `*opus*` | `claude-opus-4.5` |
| `*haiku*` | `claude-haiku-4.5` |

## 椤圭洰缁撴瀯

```
kiro-console/
鈹溾攢鈹€ src/
鈹?  鈹溾攢鈹€ main.rs                 # 绋嬪簭鍏ュ彛
鈹?  鈹溾攢鈹€ model/                  # 閰嶇疆鍜屽弬鏁版ā鍨?
鈹?  鈹?  鈹溾攢鈹€ config.rs           # 搴旂敤閰嶇疆
鈹?  鈹?  鈹斺攢鈹€ arg.rs              # 鍛戒护琛屽弬鏁?
鈹?  鈹溾攢鈹€ anthropic/              # Anthropic API 鍏煎灞?
鈹?  鈹?  鈹溾攢鈹€ router.rs           # 璺敱閰嶇疆
鈹?  鈹?  鈹溾攢鈹€ handlers.rs         # 璇锋眰澶勭悊鍣?
鈹?  鈹?  鈹溾攢鈹€ middleware.rs       # 璁よ瘉涓棿浠?
鈹?  鈹?  鈹溾攢鈹€ types.rs            # 绫诲瀷瀹氫箟
鈹?  鈹?  鈹溾攢鈹€ converter.rs        # 鍗忚杞崲鍣?
鈹?  鈹?  鈹溾攢鈹€ stream.rs           # 娴佸紡鍝嶅簲澶勭悊
鈹?  鈹?  鈹斺攢鈹€ token.rs            # Token 浼扮畻
鈹?  鈹斺攢鈹€ kiro/                   # Kiro API 瀹㈡埛绔?
鈹?      鈹溾攢鈹€ provider.rs         # API 鎻愪緵鑰?
鈹?      鈹溾攢鈹€ token_manager.rs    # Token 绠＄悊
鈹?      鈹溾攢鈹€ machine_id.rs       # 璁惧鎸囩汗鐢熸垚
鈹?      鈹溾攢鈹€ model/              # 鏁版嵁妯″瀷
鈹?      鈹?  鈹溾攢鈹€ credentials.rs  # OAuth 鍑瘉
鈹?      鈹?  鈹溾攢鈹€ events/         # 鍝嶅簲浜嬩欢绫诲瀷
鈹?      鈹?  鈹溾攢鈹€ requests/       # 璇锋眰绫诲瀷
鈹?      鈹?  鈹斺攢鈹€ common/         # 鍏变韩绫诲瀷
鈹?      鈹斺攢鈹€ parser/             # AWS Event Stream 瑙ｆ瀽鍣?
鈹?          鈹溾攢鈹€ decoder.rs      # 娴佸紡瑙ｇ爜鍣?
鈹?          鈹溾攢鈹€ frame.rs        # 甯цВ鏋?
鈹?          鈹溾攢鈹€ header.rs       # 澶撮儴瑙ｆ瀽
鈹?          鈹斺攢鈹€ crc.rs          # CRC 鏍￠獙
鈹溾攢鈹€ Cargo.toml                  # 椤圭洰閰嶇疆
鈹溾攢鈹€ config.example.json         # 閰嶇疆绀轰緥
鈹溾攢鈹€ credentials.example.social.json   # Social 鍑瘉绀轰緥
鈹溾攢鈹€ credentials.example.idc.json      # IdC 鍑瘉绀轰緥
鈹斺攢鈹€ credentials.example.multiple.json # 澶氬嚟鎹ず渚?
```

## 鎶€鏈爤

- **Web 妗嗘灦**: [Axum](https://github.com/tokio-rs/axum) 0.8
- **寮傛杩愯鏃?*: [Tokio](https://tokio.rs/)
- **HTTP 瀹㈡埛绔?*: [Reqwest](https://github.com/seanmonstar/reqwest)
- **搴忓垪鍖?*: [Serde](https://serde.rs/)
- **鏃ュ織**: [tracing](https://github.com/tokio-rs/tracing)
- **鍛戒护琛?*: [Clap](https://github.com/clap-rs/clap)

## 楂樼骇鍔熻兘

### Thinking 妯″紡

鏀寔 Claude 鐨?extended thinking 鍔熻兘锛?

```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 16000,
  "thinking": {
    "type": "enabled",
    "budget_tokens": 10000
  },
  "messages": [...]
}
```

### 宸ュ叿璋冪敤

瀹屾暣鏀寔 Anthropic 鐨?tool use 鍔熻兘锛?

```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "tools": [
    {
      "name": "get_weather",
      "description": "鑾峰彇鎸囧畾鍩庡競鐨勫ぉ姘?,
      "input_schema": {
        "type": "object",
        "properties": {
          "city": {"type": "string"}
        },
        "required": ["city"]
      }
    }
  ],
  "messages": [...]
}
```

### 娴佸紡鍝嶅簲

璁剧疆 `stream: true` 鍚敤 SSE 娴佸紡鍝嶅簲锛?

```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 1024,
  "stream": true,
  "messages": [...]
}
```

## 璁よ瘉鏂瑰紡

鏀寔涓ょ API Key 璁よ瘉鏂瑰紡锛?

1. **x-api-key Header**
   ```
   x-api-key: sk-your-api-key
   ```

2. **Authorization Bearer**
   ```
   Authorization: Bearer sk-your-api-key
   ```

## 鐜鍙橀噺

鍙€氳繃鐜鍙橀噺閰嶇疆鏃ュ織绾у埆锛?

```bash
RUST_LOG=debug ./target/release/kiro-console
```

## 娉ㄦ剰浜嬮」

1. **鍑瘉瀹夊叏**: 璇峰Ε鍠勪繚绠?`credentials.json` 鏂囦欢锛屼笉瑕佹彁浜ゅ埌鐗堟湰鎺у埗
2. **Token 鍒锋柊**: 鏈嶅姟浼氳嚜鍔ㄥ埛鏂拌繃鏈熺殑 Token锛屾棤闇€鎵嬪姩骞查
3. **涓嶆敮鎸佺殑宸ュ叿**: `web_search` 鍜?`websearch` 宸ュ叿浼氳鑷姩杩囨护

## License

MIT

## 鑷磋阿

鏈」鐩殑瀹炵幇绂讳笉寮€鍓嶈緢鐨勫姫鍔?  
 - [kiro2api](https://github.com/caidaoli/kiro2api)
 - [proxycast](https://github.com/aiclientproxy/proxycast)

鏈」鐩儴鍒嗛€昏緫鍙傝€冧簡浠ヤ笂鐨勯」鐩? 鍐嶆鐢辫》鐨勬劅璋?


