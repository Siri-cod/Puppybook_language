# Puppy Book

**Documentation:** [English](#english) · [中文](#中文) · [Deutsch](#deutsch)

If you find this useful, please give it a star ⭐.

如果觉得有用，欢迎点一个 ⭐！

Wenn es dir hilft, freuen wir uns über einen ⭐ Star.

---

## Screenshots / 界面截图 / Screenshots


|                                          |                             |                             |                                        |
| ---------------------------------------- | --------------------------- | --------------------------- | -------------------------------------- |
| **Open notebook** 打开笔记本 Notizbuch öffnen | **Main page** 主页 Hauptseite | **Languages** 语言设置 Sprachen | **Edit entry** 编辑条目 Eintrag bearbeiten |
|                                          |                             |                             |                                        |


---

# English

A two-person pronunciation notebook: each entry has **text and real audio** for **two languages**. Built for partners who correct each other’s pronunciation and collect phrases.

**Use online:** [https://puppynote.netlify.app/](https://puppynote.netlify.app/)

This document is for **users** (how to open, add entries, share) and **developers** (architecture, deploy, data and security).

---

## Table of contents

- [User guide](#user-guide)
  - [What is this](#what-is-this)
  - [First open](#first-open)
  - [Two passwords and “spaces”](#two-passwords-and-spaces)
  - [Add and edit entries](#add-and-edit-entries)
  - [List: search, sort, play](#list-search-sort-play)
  - [Collections (custom groups)](#collections-custom-groups)
  - [Backup and new devices](#backup-and-new-devices)
  - [Sync with a partner (cloud)](#sync-with-a-partner-cloud)
  - [Footer status](#footer-status)
- [Developer guide](#developer-guide)
  - [Project layout](#project-layout)
  - [Run and deploy](#run-and-deploy)
  - [Configure Supabase](#configure-supabase)
  - [Dual passwords and isolation](#dual-passwords-and-isolation)
  - [Data model and backup format](#data-model-and-backup-format)
- [Feature overview](#feature-overview)

---

## User guide

### What is this

#### Background

The author is job-hunting in Germany, where many roles expect German. Textbooks and apps do not cover every moment you need—and a native-speaking friend wanted to help with pronunciation. Nothing fit “**practice with one person, save our own sentences, hear each other’s real voice**.”

So **Puppy Book** was built.

**If any of these sound familiar, this may be the little notebook you open every day to keep practicing.**

---

#### I wrote German down but forgot how to say it days later. If only each line had a **play button**…

**Answer:** There is one. Tap **▶**—ideally your **friend’s** pronunciation, not a robot.  
You add a phrase in **your language** (record or text); your partner opens the same entry and adds **theirs**. Two sides, one speaking notebook—that is Puppy Book.

---

#### Why not a public pronunciation dictionary?

**Answer:** Puppy Book is **your private notebook**, not a dictionary.  
You only save sentences from chat, interviews, or daily life, with **each other’s recordings**—not someone else’s word list.

---

#### No native speaker nearby?

**Answer:** Find a **language-exchange** partner (apps, classmates, colleagues). Agree to help each other’s language; use two passwords for a private space (below).

---

#### Too many entries to find one phrase?

**Answer:** The top **search** matches **part of** either language—no need for the full sentence.

---

#### Different topics for each person?

**Answer:** Tap emoji on a card to add it to a **collection**; filter by tab at the top. Each person can use their own emoji (🐶 🌸 ⭐ …).

---

#### Playback too fast?

**Answer:** On each card, choose **0.75×–1.5×** next to the player.

---

#### Good to know

- **No sign-up**—open in the browser; add to the home screen on mobile.
- With cloud config, partners who use the **same two passwords** share one notebook (see [Two passwords and “spaces”](#two-passwords-and-spaces)).
- The first time a **password space has no real entries**, a sample with audio (*Du bist toll! / 你太棒了！*) is added; delete it if you do not need it. Empty junk entries are removed automatically.

### First open

1. Open **[https://puppynote.netlify.app/](https://puppynote.netlify.app/)** in a browser (do not open `index.html` via `file://`—storage may fail).
2. The **Open notebook** dialog appears.
3. Enter **Password 1** and **Password 2** (both required).
4. Tap **Open**.
5. Optional: **Remember on this device** (stores unlock state only, not the passwords).

Footer **Unlocked — sharing with partners who use the same passwords** means cloud sync is on. **Local only — add cloud config to sync with a partner** means data stays in this browser only.

**First visit to an empty space:** one sample entry is imported (*Du bist toll! / 你太棒了！*, with recordings). Delete via **Delete** in detail if unwanted.

**Message for your partner:**  
“Open [https://puppynote.netlify.app/](https://puppynote.netlify.app/) → enter our Password 1 and Password 2 → we can add phrases and recordings together.”

### Two passwords and “spaces”


| Topic           | Details                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------- |
| Both required   | You cannot open with only one password.                                                        |
| Same pair       | You and your partner see and edit the **same** notebook.                                       |
| Different pair  | A **different** space; wrong passwords usually show an empty list—no “wrong password” message. |
| How to agree    | Agree privately, e.g. a phrase + a PIN; avoid very weak pairs.                                 |
| Lock & sign out | Footer **Lock & sign out**—re-enter both passwords (recommended when switching users).         |


Passwords are **not** uploaded; the app derives a space id with SHA-256 locally.

### Add and edit entries

1. Tap the green **+** (bottom right).
2. **Language 1** (rename under footer **Languages**): text; upload audio (mp3, m4a, …) or **Record**.
3. **Language 2**: same.
4. Add some text or audio on at least one side, then **Save**.
5. Tap a card for detail; **Edit** or **Delete** there.

**Languages** (footer): set **names** and **card tags** (e.g. DE / ZH) for this password space; partners with the same passwords see the same labels (cloud or backup import/export).

Press Enter in a text field for a new line (does not submit the form).

### List: search, sort, play

**Search** — both languages at once.

**Sort** (top right)

- Newest / oldest
- Language 1 / 2 text length: short→long / long→short (tags from **Languages**)

**Play**

- Two sides per card (green / blue tags).
- **▶** to play/pause; speed **0.75×–1.5×**.
- Scrub the progress bar.
- “No audio” when missing.

### Collections (custom groups)


| Action             | How                                                       |
| ------------------ | --------------------------------------------------------- |
| All entries        | **All** tab                                               |
| One collection     | Its tab (e.g. 🐶 Puppy)                                   |
| Add/remove on card | Emoji buttons (bottom right); highlighted = in collection |
| New collection     | **+** on tab row → icon, name → **Save**                  |
| Rename/delete      | **Long-press** tab (mobile) or **right-click** (desktop)  |


Default collections: **🐶 Puppy**, **🌸 Flower** (editable). Each password space has its own collection list.

### Backup and new devices

Footer:

- **Export backup** — JSON (entries + collections + languages for this space).
- **Import backup** — merge JSON (same ids overwritten).

Export before clearing browser data; import on a new device.

> Import/export only affects the **currently unlocked** password space.

### Sync with a partner (cloud)

Configure `config.js` with Supabase (developer section). Anyone using the **same two passwords** shares `vaultId` and sees the same data via Realtime.

### Footer status


| Message                           | Meaning                    |
| --------------------------------- | -------------------------- |
| Enter both passwords to open      | Locked                     |
| Local only — add cloud config…    | No `config.js` or sync off |
| Cloud sync error: …               | Supabase problem           |
| Unlocked — sharing with partners… | Cloud connected            |


---

## Developer guide

### Project layout

Static frontend, no build step:


| File                 | Role                                                       |
| -------------------- | ---------------------------------------------------------- |
| `index.html`         | Unlock dialog, list, editor, collections, detail, footer   |
| `app.js`             | UI, recording, playback, collections, import/export, vault |
| `vault.js`           | Two passwords → `vaultId` (SHA-256), remember device       |
| `collections.js`     | Collection meta per `vaultId`                              |
| `languages.js`       | Language label meta per `vaultId`                          |
| `db.js`              | IndexedDB; delegates to `sync.js` when cloud ready         |
| `sync.js`            | Supabase client, `notebook_id` filter, Realtime            |
| `styles.css`         | Styles                                                     |
| `config.js`          | Local config (gitignored)                                  |
| `supabase-setup.sql` | Run once in Supabase SQL Editor                            |
| `manifest.json`      | PWA manifest                                               |
| `serve.sh`           | Optional local server script                               |
| `welcome-seed.json`  | Sample backup imported into empty spaces                   |


### Run and deploy

**Local**

```bash
cd path/to/github_audio_note
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080). Do not use `file://`.

**Phone on same Wi‑Fi:** use your LAN IP, e.g. `http://YOUR_IP:8080`; iOS Safari → Share → Add to Home Screen.

**Production:** [https://puppynote.netlify.app/](https://puppynote.netlify.app/) — deploy the folder to Netlify Drop, Vercel, Cloudflare Pages, etc.

### Configure Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. SQL Editor → run `supabase-setup.sql`.
3. Settings → API: **Project URL**, **anon public** key.
4. `cp config.example.js config.js` and fill both fields.
5. Ensure `config.js` is served (not blocked).

```js
export default {
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_PUBLIC_KEY',
};
```

Language labels live in `__meta:languages:{vaultId}` (UI **Languages**). Export/import JSON v3 includes `languages`. Storage fields `deText` / `zhText` are slot 1 / 2 (legacy names).

### Dual passwords and isolation

```
Password 1 + Password 2
        ↓
vault.js: SHA-256("puppy-book:v1\0" + pass1 + "\0" + pass2) → vaultId (64 hex)
        ↓
Supabase entries.notebook_id = vaultId
IndexedDB rows include vaultId
```

- Passwords never sent to the server.
- Wrong pair → different `vaultId` → usually empty data.
- Remember device stores `vaultId` in `localStorage`, not passwords.
- **Lock & sign out** clears sync and shows the unlock dialog again.

One Supabase project can host many `vaultId` values; use separate projects for hard isolation.

### Data model and backup format

**Entry** (`entries.data` JSONB or IndexedDB):


| Field                             | Notes                            |
| --------------------------------- | -------------------------------- |
| `id`                              | UUID                             |
| `vaultId`                         | Space id (= cloud `notebook_id`) |
| `deText` / `zhText`               | Language slots 1 / 2 text        |
| `deAudioBase64` / `zhAudioBase64` | Audio                            |
| `deAudioMime` / `zhAudioMime`     | MIME                             |
| `collections`                     | Collection id strings            |
| `createdAt` / `updatedAt`         | ms timestamps                    |


**Collection meta:** `id` = `__meta:collections:{vaultId}`.

**Export JSON (v3)**

```json
{
  "version": 3,
  "exportedAt": "ISO-8601",
  "entries": [],
  "collections": [],
  "languages": [
    { "label": "German", "tag": "DE" },
    { "label": "Chinese", "tag": "ZH" }
  ]
}
```

---

## Feature overview


| Feature               | UI                        | Tech                                           |
| --------------------- | ------------------------- | ---------------------------------------------- |
| Dual passwords        | Open dialog               | `vault.js` → SHA-256 `vaultId`                 |
| Remember / lock       | Checkbox; Lock & sign out | `localStorage`; `clearSync()`                  |
| Two languages + audio | Editor; Languages         | `de*`/`zh*` + `__meta:languages:*`             |
| Upload / record       | Record, file input        | `MediaRecorder`                                |
| Search & sort         | Search, dropdown          | Client-side                                    |
| Inline play           | ▶, scrub, speed           | `Audio`, `playbackRate`                        |
| Collections           | Tabs, card emoji          | `collections.js`                               |
| Cloud sync            | Footer status             | Supabase + Realtime                            |
| Local only            | No config                 | IndexedDB                                      |
| Import/export         | Footer buttons            | JSON v3                                        |
| PWA                   | Add to home screen        | `manifest.json`                                |
| Legacy backups        | Import old JSON           | `normalizeEntry`                               |
| Welcome sample        | Auto on empty space       | `welcome-seed.json`, `maybeSeedWelcomeEntry()` |
| Prune empty rows      | —                         | `pruneEmptyEntries()` on open                  |


---

*Puppy Book — practice pronunciation together, in each other’s languages.*

---

# Puppy Book

双人发音互助笔记本：每条记录包含**两种语言**各自的文本与真人发音，方便两人互相纠正发音、积累例句。

**在线使用：** [https://puppynote.netlify.app/](https://puppynote.netlify.app/)

本文档同时面向**使用者**（如何打开、录入、共享）和**技术人员**（架构、部署、数据与安全模型）。

---

## 目录

- [使用者指南](#使用者指南)
  - [这是什么](#这是什么)
  - [第一次打开](#第一次打开)
  - [两把密码与「空间」](#两把密码与空间)
  - [添加与编辑条目](#添加与编辑条目)
  - [列表：搜索、排序、播放](#列表搜索排序播放)
  - [收藏夹（自定义分组）](#收藏夹自定义分组)
  - [备份与换设备](#备份与换设备)
  - [与伙伴同步（云端）](#与伙伴同步云端)
  - [页脚状态说明](#页脚状态说明)
- [技术人员指南](#技术人员指南)
  - [项目结构](#项目结构)
  - [运行与部署](#运行与部署)
  - [配置 Supabase 云端](#配置-supabase-云端)
  - [双密码与数据隔离原理](#双密码与数据隔离原理)
  - [数据模型与备份格式](#数据模型与备份格式)
  - [安全说明](#安全说明)
  - [常见问题](#常见问题)

---

## 使用者指南

### 这是什么

#### 开发背景

本开发者正在德国找工作，发现多数岗位都要求会德语，下定决心开始学！可总有些时刻是课本和 App 帮不上忙的，德国朋友是母语者，非常希望能帮到我。市面上也找不到一款刚好贴合「**和一个人互相练、记我们自己的句子、听对方真人发音**」的工具。

所以我做了 **Puppy Book**。

**如果你也有过下面这些瞬间，它可能就是你想每天打开、一起把外语练下去的那个小本子。**

---

#### 记了德语，复习时却怎么也想不起怎么读？每天学几句，抄在本子上，过几天再看——字认识，嘴却张不开。要是**每句话旁边有个播放键**就好了……

**答：** 有。点 **▶** 就能听——而且最好是**你朋友的标准发音**，不是冷冰冰的机器声。  
你加一句想学的话，先用**母语**录一版（或只写文字）；朋友打开同一条，再补上**德语**。两个人各写各的语言，合成一本会发声的双语笔记，这才是 Puppy Book 想做的事。

---

#### 网上不是有大家共建的发音词典吗，为什么还要用这个？词典里什么词都有，好像更全面？

**答：** Puppy Book **不是词典，是你们俩的私人笔记本**。  
就像上学：你不会抱着整本教材当笔记本，而是买一本空本子，只记**课堂上真正用到、真正想记住**的那几句。这里记的，是聊天、面试、生活里冒出来的句子，配上**彼此录的音**，更贴你的学习路径，而不是背一本「别人的词表」。

---

#### 我没有母语者朋友，还能用吗？

**答：** 可以。先找一个愿意**和你交换语言**的人——语伴 App、同学、同事、网友都行。约好「你帮我练你的语言，我帮你练我的语言」，记句子、互录发音、随时回顾，剩下的交给这本笔记本就好。  
（技术上用**两把密码**隔开你们的私人空间，见下文。）

---

#### 记太多了，想找一句话像大海捞针？条目一多，突然想复习某个词，翻到手酸也找不到？

**答：** 顶部**搜索框**帮你「捞针」——输入你想找的句子中**任意几个字母**，不用整句匹配，相关条目马上列出来。

---

#### 我和好友想记的内容不一样，怕全混在一起？我想记面试口语，朋友想记旅游用语，能分开吗？

**答：** 能。点每条卡片右下角**你喜欢的小标志**，句子就进对应的**收藏夹**；顶部点标签，只看那一个池子。  
你们可以各建各的收藏夹、各选各的 emoji（🐶 🌸 ⭐ …），甚至**一人占一个标志**，各记各的，需要时再筛，不会挤在同一张清单里。

---

#### 朋友说得快，我想慢下来听怎么办？复习时想听清每一个音，能调速度吗？

**答：** 能。在**词条卡片**上，播放区旁可选 **0.75×～1.5×**，用你舒服的速度反复听同一条录音。

---

#### 还需要知道的几件事

- **不用注册**，浏览器打开即用；可**添加到手机主屏幕**，像小 App 一样天天点。
- 配置云端后，**两把密码相同**的伙伴共享同一份笔记、自动同步（详见 [两把密码与「空间」](#两把密码与空间)）。
- 第一次进入**空的密码空间**，会自动出现一条带录音的示例（*Du bist toll! / 你太棒了！*），看一眼就会用；不需要可删掉。

### 第一次打开

1. 用浏览器打开 **[https://puppynote.netlify.app/](https://puppynote.netlify.app/)**（不要直接双击本地的 `index.html` 文件，部分浏览器会无法保存数据）。
2. 出现 **「进入笔记本」** 对话框。
3. 输入 **密码一** 和 **密码二**（两把都必须填写）。
4. 点击 **进入**。
5. 可选：勾选 **在此设备记住**，下次同一台设备可免输密码进入（密码本身不会保存在本机，只保存解锁状态）。

若页脚显示 **已解锁 — 与同密码的伙伴共享笔记**，说明已连上云端且当前空间已打开。若显示 **仅本机存储 — 配置云端后可与他人同步**，说明未配置云端，数据只在本浏览器。

**第一次进入某个密码空间且还没有任何词条时**，会自动导入一条示例词条（*Du bist toll! / 你太棒了！*，含德/中文录音），方便你看懂卡片与播放按钮；不需要可在详情里 **Delete**。同一密码空间只会自动导入一次。

**给伙伴的说明（可复制）：**  
「打开 [https://puppynote.netlify.app/](https://puppynote.netlify.app/) → 输入我们约好的密码一和密码二 → 进入后就能一起记句子和发音了。」

### 两把密码与「空间」


| 说明    | 详情                                               |
| ----- | ------------------------------------------------ |
| 两把都要填 | 只填一把无法进入。                                        |
| 相同组合  | 你与伙伴约定好的「密码一 + 密码二」完全一致时，看到并编辑**同一份**笔记。         |
| 不同组合  | 进入**另一个**空间，内容互不相见；输错密码时通常看到空白列表，**不会**提示「密码错误」。 |
| 如何约定  | 私下说好即可，例如一句暗号 + 一个 PIN。不要用过于简单的组合。               |
| 锁定退出  | 页脚点 **锁定退出**，需重新输入两把密码（换人使用或换一组密码时建议操作）。         |


密码**不会**上传到服务器；应用在本地用 SHA-256 推导出空间编号，只加载属于该编号的数据。

### 添加与编辑条目

1. 点击右下角绿色 **+**。
2. **语言一**（默认「语言一」，可在页脚 **语言设置** 中改名）：该侧文本；可上传音频（mp3、m4a 等）或点 **Record** 录制。
3. **语言二**：同样可写文本、上传或录制。
4. 至少填写一些文字或任一侧音频后，点 **Save** 保存。
5. 点击卡片可打开详情；在详情里 **Edit** 或 **Delete**。

**语言设置**（页脚）：为本密码空间设置两种语言的**名称**与**卡片缩写**（如 DE / 中文）；与伙伴使用相同两把密码时会同步看到（需云端或导出/导入备份）。

文本框内按 Enter 会换行，不会误提交表单。

### 列表：搜索、排序、播放

**搜索**  
顶部搜索框可同时搜两种语言的内容。

**排序**（右上角下拉）

- 最新 / 最旧
- 语言一 / 语言二文本长度：短→长 / 长→短  
（下拉里的缩写来自 **语言设置** 里配置的卡片缩写。）

**播放**

- 每条卡片分两侧语言区域（第一侧绿色、第二侧蓝色标签）。
- 点 **▶** 播放，再点暂停；旁边下拉框可选 **0.75×～1.5×** 播放速度。
- 进度条可拖动调整位置。
- 无音频时显示 “No audio”。

### 收藏夹（自定义分组）

收藏夹用来给条目「打标签」，并在顶部快速筛选。


| 操作          | 方法                                         |
| ----------- | ------------------------------------------ |
| 查看全部        | 点顶部 **All**。                               |
| 只看某一收藏夹     | 点对应标签（如 🐶 Puppy）。                         |
| 把条目加入/移出收藏夹 | 在卡片右下角点对应 emoji 按钮；高亮表示已收藏。                |
| 新建收藏夹       | 点标签行末尾的 **+** → 选图标、填名称 → **Save**。        |
| 改名 / 删收藏夹   | **长按**该标签（手机）或 **右键**（电脑）→ 编辑或 **Delete**。 |


首次使用默认有两个收藏夹：**🐶 Puppy**、**🌸 Flower**（可改名或删除）。每个「密码空间」有各自独立的收藏夹配置。

### 备份与换设备

页脚：

- **Export backup**：下载 JSON 备份（含当前空间内的条目与收藏夹设置）。
- **Import backup**：选择 JSON 合并导入（相同 ID 的条目会被覆盖）。

换手机或清空浏览器数据前请先导出；新设备导入即可恢复。

> 导入/导出只影响**当前已解锁**的那把密码空间里的数据。

---

## 技术人员指南

### 项目结构

纯静态前端，无构建步骤：


| 文件                   | 作用                                                      |
| -------------------- | ------------------------------------------------------- |
| `index.html`         | 页面结构：解锁对话框、列表、编辑器、收藏夹编辑、详情、页脚                           |
| `app.js`             | 主逻辑：列表渲染、录音、播放、收藏夹、导入导出、解锁流程                            |
| `vault.js`           | 双密码 → `vaultId`（SHA-256），本机「记住」状态                       |
| `collections.js`     | 收藏夹元数据（按 `vaultId` 分桶的 meta 记录）                         |
| `languages.js`       | 按 `vaultId` 存储/读取语言标签元数据（`de`/`zh` 为内部槽位名）              |
| `db.js`              | IndexedDB 读写；云端就绪时委托 `sync.js`                          |
| `sync.js`            | Supabase 客户端、按 `notebook_id`（= `vaultId`）过滤、Realtime 订阅 |
| `styles.css`         | 界面样式                                                    |
| `config.js`          | **本地配置**                                                |
| `supabase-setup.sql` | 在 Supabase SQL Editor 中执行一次                             |
| `manifest.json`      | PWA 清单                                                  |
| `serve.sh`           | 可选：本地启动脚本                                               |
| `welcome-seed.json`  | 首次进入空空间时自动导入的示例备份（含音频）                                  |


### 运行与部署

**本机调试**

```bash
cd "/Users/qian/Desktop/github_audio_note"
python3 -m http.server 8080
```

浏览器打开：[http://localhost:8080](http://localhost:8080)

勿使用 `file://` 打开 `index.html`（模块与 IndexedDB 可能受限）。

**手机同 Wi‑Fi 访问**

1. 电脑运行上述命令。
2. 查局域网 IP（如 `ipconfig getifaddr en0`）。
3. 手机访问 `http://YOUR_IP:8080`。
4. iOS Safari：分享 → **添加到主屏幕**。

**长期在线访问**

当前线上地址：[https://puppynote.netlify.app/](https://puppynote.netlify.app/)（Netlify 部署）。

自行部署时，将整目录上传到静态托管：

- [Netlify Drop](https://app.netlify.com/drop)
- Vercel / Cloudflare Pages 等

### 配置 Supabase 云端

1. 在 [supabase.com](https://supabase.com) 创建 **Project**。
2. **SQL Editor** → 新建查询 → 粘贴并执行 `supabase-setup.sql`（无需改内容）。
3. **Settings → API** 复制：
  - **Project URL**
  - **anon public** key
4. `cp config.example.js config.js`，填入上述两项。
5. 部署或本地服务时确保 `config.js` 可被浏览器加载。

`config.js` 示例：

```js
export default {
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_PUBLIC_KEY',
};
```

语言名称与卡片缩写保存在当前密码空间的元数据 `__meta:languages:{vaultId}` 中，由用户在应用内 **语言设置** 修改；导出/导入 JSON v3 时包含 `languages` 数组。数据字段仍为 `deText` / `zhText`（第一 / 第二语言槽），旧备份兼容不变。

### 双密码与数据隔离原理

```
用户输入 密码一 + 密码二
        ↓
  vault.js: SHA-256("puppy-book:v1\0" + pass1 + "\0" + pass2)  →  vaultId（64 位十六进制）
        ↓
  Supabase 表 entries.notebook_id = vaultId
  本地 IndexedDB 每条记录的 vaultId 字段 = vaultId
```

- 密码**不上传**、**不入库**；服务端只见 `notebook_id` 哈希值。
- 错误密码对 → 不同 `vaultId` → 不同行集合，通常为空。
- 「记住此设备」仅在 `localStorage` 存 `vaultId`，不存明文密码。
- **锁定退出** 调用 `clearSync()` 并清空内存中的 `vaultId`，重新显示解锁对话框。

同一 Supabase **Project** 内可承载无数个逻辑空间（无数个 `vaultId`）；若需物理隔离（独立库、独立配额），应使用**多个 Supabase Project** 和不同的 `config.js` 部署实例——当前代码单页只绑定一个 Project。

### 数据模型与备份格式

**普通条目**（存于 `entries.data` JSONB 或 IndexedDB）：


| 字段                                | 说明                              |
| --------------------------------- | ------------------------------- |
| `id`                              | UUID                            |
| `vaultId`                         | 所属密码空间（云端行级 `notebook_id` 与此一致） |
| `deText` / `zhText`               | 第一 / 第二语言文本（历史字段名，与界面标签无关）      |
| `deAudioBase64` / `zhAudioBase64` | 对应侧音频 Base64                    |
| `deAudioMime` / `zhAudioMime`     | MIME 类型                         |
| `collections`                     | 字符串数组，收藏夹 id 列表                 |
| `createdAt` / `updatedAt`         | 毫秒时间戳                           |


**收藏夹元数据**  
`id` = `__meta:collections:{vaultId}`，内含 `collections: [{ id, name, emoji, createdAt }]`。

**导出 JSON（version 3）**

```json
{
  "version": 3,
  "exportedAt": "ISO-8601",
  "entries": [ /* 当前 vault 的条目 */ ],
  "collections": [ /* 当前 vault 的收藏夹定义 */ ],
  "languages": [
    { "label": "德语", "tag": "DE" },
    { "label": "中文", "tag": "ZH" }
  ]
}
```

---

## 功能一览（当前版本）


| 功能          | 用户可见                     | 技术要点                                            |
| ----------- | ------------------------ | ----------------------------------------------- |
| 双密码进入       | 进入对话框，密码一 + 密码二          | `vault.js` → SHA-256 `vaultId`                  |
| 记住本机 / 锁定退出 | 勾选记住；页脚锁定退出              | `localStorage` 存 `vaultId`；`clearSync()`        |
| 双语文本与音频     | 编辑表单两侧语言；页脚 **语言设置**     | `de`*/`zh`* 槽位 + `__meta:languages:*`           |
| 上传 / 麦克风录音  | Record、文件选择              | `MediaRecorder`，WebM/M4A 等                      |
| 列表搜索与排序     | 搜索框、排序下拉                 | 客户端过滤与 `applySort`                              |
| 内联播放与进度条    | ▶ / 拖动进度 / 倍速            | 单例 `Audio`，`playbackRate`，`URL.createObjectURL` |
| 自定义收藏夹      | 顶部标签 + 卡片 emoji 按钮       | `collections.js` meta 按 vault 分桶                |
| 云端实时同步      | 页脚「已解锁 — …」              | Supabase `entries` + Realtime                   |
| 仅本机模式       | 无 config 时               | IndexedDB only                                  |
| 导入 / 导出备份   | 页脚 Export / Import       | JSON v3 + collections                           |
| PWA / 手机主屏幕 | 添加到主屏幕                   | `manifest.json`，safe-area CSS                   |
| 旧备份迁移       | 导入旧 JSON 仍可用             | `normalizeEntry` 兼容字段                           |
| 首次空空间示例     | 自动导入 `welcome-seed.json` | `maybeSeedWelcomeEntry()`                       |


---

*Puppy Book — 用彼此的语言，把发音记在一起。*

---

# Deutsch

Ein Aussprache-Notizbuch für zwei Personen: Jeder Eintrag enthält **Text und echte Audioaufnahmen** für **zwei Sprachen**. Gedacht für gegenseitige Aussprache-Korrektur und eigene Beispielsätze.

**Online nutzen:** [https://puppynote.netlify.app/](https://puppynote.netlify.app/)

Dieses Dokument richtet sich an **Nutzerinnen und Nutzer** (Öffnen, Einträge, Teilen) und **Entwicklerinnen und Entwickler** (Architektur, Deployment, Datenmodell).

---

## Inhaltsverzeichnis

- [Benutzerhandbuch](#benutzerhandbuch)
  - [Was ist das](#was-ist-das)
  - [Erstes Öffnen](#erstes-öffnen)
  - [Zwei Passwörter und „Bereiche“](#zwei-passwörter-und-bereiche)
  - [Einträge anlegen und bearbeiten](#einträge-anlegen-und-bearbeiten)
  - [Liste: Suche, Sortierung, Wiedergabe](#liste-suche-sortierung-wiedergabe)
  - [Sammlungen (eigene Gruppen)](#sammlungen-eigene-gruppen)
  - [Backup und Gerätewechsel](#backup-und-gerätewechsel)
  - [Sync mit Partner (Cloud)](#sync-mit-partner-cloud)
  - [Statuszeile im Footer](#statuszeile-im-footer)
- [Entwicklerhandbuch](#entwicklerhandbuch)
  - [Projektaufbau](#projektaufbau)
  - [Starten und deployen](#starten-und-deployen)
  - [Supabase einrichten](#supabase-einrichten)
  - [Zwei Passwörter und Isolation](#zwei-passwörter-und-isolation)
  - [Datenmodell und Backup](#datenmodell-und-backup)
- [Funktionsübersicht](#funktionsübersicht)

---

## Benutzerhandbuch

### Was ist das

#### Hintergrund

Die Entwicklerin sucht in Deutschland eine Stelle—viele verlangen Deutsch. Bücher und Apps reichen nicht überall; eine muttersprachliche Freundin wollte bei der Aussprache helfen. Es gab kein Tool für „**zu zweit üben, eigene Sätze speichern, die Stimme der anderen hören**“.

Daraus entstand **Puppy Book**.

**Wenn du dich in den folgenden Situationen wiedererkennst, ist das vielleicht dein tägliches Übungsheft.**

---

#### Deutsch aufgeschrieben, aber die Aussprache vergessen? Ein **Play-Button** pro Satz wäre ideal …

**Antwort:** Gibt es. **▶** abspielen—am besten die **Aussprache deines Partners**, nicht eine Roboterstimme.  
Du trägst einen Satz in **deiner Sprache** ein (Text oder Aufnahme); dein Partner ergänzt **seine Seite** am selben Eintrag. Ein sprechendes Zweisprachen-Notizbuch.

---

#### Warum kein öffentliches Aussprache-Lexikon?

**Antwort:** Puppy Book ist **euer privates Heft**, kein Wörterbuch.  
Nur Sätze aus Chat, Vorstellungsgespräch oder Alltag—mit **gegenseitigen Aufnahmen**.

---

#### Kein Muttersprachler in der Nähe?

**Antwort:** Finde einen **Sprachtandem-Partner**. „Du hilfst mir, ich dir“—zwei Passwörter für einen privaten Bereich (unten).

---

#### Zu viele Einträge, ein Satz schwer zu finden?

**Antwort:** Die **Suche** oben findet **Teile** des Textes in beiden Sprachen.

---

#### Unterschiedliche Themen?

**Antwort:** **Sammlungen** mit Emoji auf der Karte; oben nach Tab filtern (🐶 🌸 ⭐ …).

---

#### Zu schnelle Wiedergabe?

**Antwort:** **0,75×–1,5×** auf der Karte.

---

#### Kurz zusammen

- **Keine Registrierung**—Browser reicht; **Zum Home-Bildschirm** auf dem Handy.
- Mit Cloud: **gleiche zwei Passwörter** = gemeinsames Heft (siehe [Zwei Passwörter und „Bereiche“](#zwei-passwörter-und-bereiche)).
- Beim **ersten leeren Passwort-Bereich** ein Beispiel mit Audio (*Du bist toll! / 你太棒了！*); löschen optional. Leere Einträge werden automatisch entfernt.

### Erstes Öffnen

1. **[https://puppynote.netlify.app/](https://puppynote.netlify.app/)** im Browser öffnen (nicht `index.html` per `file://`).
2. Dialog **Open notebook** (Notizbuch öffnen).
3. **Password 1** und **Password 2** eingeben (beide Pflicht).
4. **Open** tippen.
5. Optional: **Remember on this device** (speichert nur den Entsperr-Status).

**Unlocked — sharing with partners…** = Cloud aktiv. **Local only…** = nur dieser Browser.

**Erster Besuch in leerem Bereich:** Beispieleintrag mit Aufnahmen. In den Details **Delete** zum Entfernen.

**Nachricht an Partner:**  
„[https://puppynote.netlify.app/](https://puppynote.netlify.app/) → unsere beiden Passwörter → gemeinsam Sätze und Aussprache speichern.“

### Zwei Passwörter und „Bereiche“


| Thema         | Details                                                                      |
| ------------- | ---------------------------------------------------------------------------- |
| Beide nötig   | Nur ein Passwort reicht nicht.                                               |
| Gleiches Paar | Gleiches Heft für dich und Partner.                                          |
| Anderes Paar  | Anderer Bereich; falsches Paar → meist leere Liste, **keine** Fehlermeldung. |
| Vereinbarung  | Privat absprechen, z. B. Satz + PIN.                                         |
| Sperren       | Footer **Lock & sign out**—beide Passwörter neu eingeben.                    |


Passwörter werden **nicht** hochgeladen; SHA-256 lokal → Bereichs-ID.

### Einträge anlegen und bearbeiten

1. Grünes **+** unten rechts.
2. **Language 1** (umbenennen unter **Languages**): Text; Datei oder **Record**.
3. **Language 2**: gleich.
4. Mindestens Text oder Audio auf einer Seite, dann **Save**.
5. Karte antippen → **Edit** / **Delete**.

**Languages** (Footer): **Namen** und **Karten-Kürzel** (z. B. DE / ZH) für diesen Bereich; Partner mit gleichen Passwörtern sehen dasselbe (Cloud oder Backup).

Enter = Zeilenumbruch im Textfeld.

### Liste: Suche, Sortierung, Wiedergabe

**Suche** — beide Sprachen.

**Sortierung**

- Neueste / älteste
- Textlänge Sprache 1 / 2 (Kürzel aus **Languages**)

**Wiedergabe**

- Zwei Bereiche pro Karte (grün / blau).
- **▶**, Geschwindigkeit **0,75×–1,5×**, Fortschrittsbalken.
- „No audio“ wenn leer.

### Sammlungen (eigene Gruppen)


| Aktion             | So geht’s                                  |
| ------------------ | ------------------------------------------ |
| Alle               | Tab **All**                                |
| Eine Sammlung      | Entsprechender Tab                         |
| Zuordnen           | Emoji unten rechts auf der Karte           |
| Neu                | **+** in der Tab-Leiste                    |
| Umbenennen/löschen | Tab **lange drücken** oder **Rechtsklick** |


Standard: **🐶 Puppy**, **🌸 Flower**. Jeder Passwort-Bereich hat eigene Sammlungen.

### Backup und Gerätewechsel

- **Export backup** — JSON
- **Import backup** — zusammenführen

Vor dem Löschen der Browser-Daten exportieren.

> Nur der **aktuell entsperrte** Bereich.

### Sync mit Partner (Cloud)

`config.js` mit Supabase (Entwicklerabschnitt). **Gleiche zwei Passwörter** = gleiche Daten per Realtime.

### Statuszeile im Footer


| Meldung                           | Bedeutung        |
| --------------------------------- | ---------------- |
| Enter both passwords to open      | Gesperrt         |
| Local only — add cloud config…    | Kein Cloud-Setup |
| Cloud sync error: …               | Supabase-Fehler  |
| Unlocked — sharing with partners… | Verbunden        |


---

## Entwicklerhandbuch

### Projektaufbau

Statisches Frontend, kein Build:


| Datei                | Rolle                       |
| -------------------- | --------------------------- |
| `index.html`         | UI-Struktur                 |
| `app.js`             | Logik, Audio, Import/Export |
| `vault.js`           | Passwörter → `vaultId`      |
| `collections.js`     | Sammlungs-Metadaten         |
| `languages.js`       | Sprachlabel-Metadaten       |
| `db.js`              | IndexedDB                   |
| `sync.js`            | Supabase + Realtime         |
| `styles.css`         | Styles                      |
| `config.js`          | Lokale Konfiguration        |
| `supabase-setup.sql` | Einmal in SQL Editor        |
| `manifest.json`      | PWA                         |
| `welcome-seed.json`  | Beispiel-Backup             |


### Starten und deployen

```bash
cd pfad/zu/github_audio_note
python3 -m http.server 8080
```

[http://localhost:8080](http://localhost:8080) — kein `file://`.

**Handy im WLAN:** `http://DEINE_IP:8080`; iOS: Teilen → Zum Home-Bildschirm.

**Produktion:** [https://puppynote.netlify.app/](https://puppynote.netlify.app/)

### Supabase einrichten

1. Projekt auf [supabase.com](https://supabase.com)
2. `supabase-setup.sql` ausführen
3. API-URL und anon key
4. `config.example.js` → `config.js`

```js
export default {
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_PUBLIC_KEY',
};
```

Sprachlabels in `__meta:languages:{vaultId}`. JSON v3 enthält `languages`. Felder `deText`/`zhText` = Slot 1/2.

### Zwei Passwörter und Isolation

```
Passwort 1 + Passwort 2 → SHA-256 → vaultId
→ Supabase notebook_id = vaultId
→ IndexedDB mit vaultId
```

Passwörter nie auf dem Server. **Lock & sign out** setzt Sync zurück.

### Datenmodell und Backup

Siehe englischen Abschnitt für Feldliste.

```json
{
  "version": 3,
  "languages": [
    { "label": "German", "tag": "DE" },
    { "label": "Chinese", "tag": "ZH" }
  ]
}
```

---

## Funktionsübersicht


| Funktion               | UI                        | Technik               |
| ---------------------- | ------------------------- | --------------------- |
| Zwei Passwörter        | Open-Dialog               | `vault.js`            |
| Merken / Sperren       | Checkbox; Lock & sign out | `localStorage`        |
| Zwei Sprachen + Audio  | Editor; Languages         | `de*`/`zh*`, Meta     |
| Aufnahme / Upload      | Record                    | `MediaRecorder`       |
| Suche & Sortierung     | Oben                      | Client                |
| Inline-Play            | ▶, Tempo                  | `Audio`               |
| Sammlungen             | Tabs, Emoji               | `collections.js`      |
| Cloud-Sync             | Footer                    | Supabase              |
| Nur lokal              | Ohne config               | IndexedDB             |
| Import/Export          | Footer                    | JSON v3               |
| PWA                    | Home-Bildschirm           | `manifest.json`       |
| Willkommens-Beispiel   | Leerer Bereich            | `welcome-seed.json`   |
| Leere Einträge löschen | —                         | `pruneEmptyEntries()` |


---

*Puppy Book — Aussprache gemeinsam üben, in jeder Sprache.*