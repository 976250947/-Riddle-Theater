# 听晚｜Nano Banana 素材脚本与提示词

## 1. 本次整理目标

- 覆盖《听晚》前四章当前已实现的 13 个 scene。
- 优先解决目前刚需素材：背景、角色图、音效。
- 提示词只基于现有剧本和 scene card，不额外脑补越界剧情。
- 风格核心：现实向都市恋爱、成年人克制拉扯、沿海城市夜雨与暖灯并存。

如果你想先低成本跑通一版，建议顺序是：

1. 先出许念、沈砚川两张基准角色图。
2. 再出 12 张背景图。
3. 再用角色基准图做 6 个许念状态变体、6 个沈砚川状态变体。
4. 最后补 14 组环境音和拟音。

## 2. 统一风格锁定

### 2.1 图像统一前缀

所有背景图和角色图都建议先加这一段，再接单条 prompt 主体：

华语都市情感剧电影感静帧，现实向成年人恋爱，沿海中国城市，旧公寓与生活化室内空间，克制情绪表达，semi-realistic cinematic illustration，muted blue gray and warm amber palette，practical lighting，subtle film grain，realistic adult proportions，clean composition，high detail，quiet tension，grounded modern life，no fantasy

### 2.2 图像统一负面提示词

未成年感，学生气过重，校园制服，夸张二次元，古风，仙侠，赛博朋克，奇幻魔法，欧式宫廷，婚纱，过度性感，拥抱，接吻，过分亲密姿态，过饱和霓虹，夸张表情，过度微笑，extra fingers，deformed hands，distorted face，blurry，low detail，text，watermark，logo，duplicate person

### 2.3 音效统一前缀

所有音效都建议先加这一段，再接单条 prompt 主体：

realistic cinematic foley，intimate Chinese urban romance ambience，natural stereo，close and restrained，detailed room tone，no exaggerated trailer sound，subtle emotion，clean texture

### 2.4 音效统一负面提示词

epic trailer，horror stinger，fantasy magic，cartoon sound，heavy reverb，EDM beat，battle sound，crowd cheer，overblown thunder，distortion，clipping，jump scare

### 2.5 生成时一定要锁住的点

- 两位主角必须是成年人，不要做成校园感。
- 前四章没有正式表白、拥抱、接吻，所有画面都要克制。
- 背景图尽量不带人物，角色图单独生成，后续合成更灵活。
- 室内主色以暖金灯光、蓝灰夜色、米白生活细节为主，不要做艳粉或高饱和韩漫色。
- 先把角色基准图跑稳，再用同一张参考图做后续变体，避免脸漂。

## 3. 角色基准图与状态变体

## 3.1 许念基准图

- 定位：24 岁，中国都市女性，新媒体编辑 / 内容策划，温柔独立，外柔内韧，干净清爽，都市感强，看似安静实则有边界。
- 基准 prompt：

24-year-old Chinese woman，urban editorial planner，clean fresh look，soft natural facial features，quiet but strong boundary，shoulder-length black hair with soft texture，natural makeup，slim adult silhouette，modern city vibe，gentle eyes，restrained emotion，minimalist styling，realistic adult woman，calm and self-possessed

- 使用建议：先出半身或 3/4 身，纯净浅灰或柔和室内虚化背景，锁五官和发型，再做服装状态变体。

### 许念状态变体

#### XN-01 雨夜风衣带雨

- 用途：Scene 1-1、1-2、1-3
- 追加提示词：ivory trench coat slightly damp from rain，wet hair ends，holding a 28-inch suitcase handle，tired but composed，polite distance after reunion，rainy night mood

#### XN-02 清晨居家

- 用途：Scene 2-1、3-1、3-2
- 追加提示词：freshly washed loose hair over shoulders，light homewear，no-makeup morning face，soft sleepy eyes，holding warm milk or standing in kitchen morning light，clean domestic atmosphere

#### XN-03 下班后晚饭状态

- 用途：Scene 2-2、4-1
- 追加提示词：office-casual after work，slight fatigue，warm lamp light on face，subtle relaxed smile，adult urban worker vibe，quiet intimacy at home

#### XN-04 雷雨夜睡前状态

- 用途：Scene 2-3
- 追加提示词：simple sleepwear or soft homewear，holding a cup with both hands，slightly tense during thunder，trying to stay calm，night interior lighting，unconscious closeness

#### XN-05 阳台披外套状态

- 用途：Scene 3-3
- 追加提示词：draped in a dark oversized coat，night breeze moving hair，city lights behind，eyes gently shaken，high-tension but restrained romance，no physical intimacy

#### XN-06 聚会后微酒意

- 用途：Scene 4-2、4-3
- 追加提示词：after company gathering，slightly loosened office outfit，faint alcohol flush，tired but clear-eyed，pressing question in expression，deep night warm light

## 3.2 沈砚川基准图

- 定位：27 岁，中国都市男性，建筑设计师，沉稳克制，责任感强，寡言细致，清冷可靠，有距离感，但照顾人时很稳。
- 基准 prompt：

27-year-old Chinese man，architect，tall lean build，short black hair，clean restrained facial features，mature and reliable，calm eyes，understated attractiveness，dark neutral clothing，quiet adult presence，distant but gentle，realistic modern Chinese man，controlled emotion

- 使用建议：如果首图更适合偏清瘦或偏硬朗，可以微调脸型，但不要改掉成年感、克制感和职业气质。

### 沈砚川状态变体

#### SY-01 深夜玄关状态

- 用途：Scene 1-1、1-2、1-3、1-4
- 追加提示词：late-night homewear，warm indoor light from behind，calm face with internal shock，holding or reaching for suitcase，quiet restraint after reunion

#### SY-02 清晨厨房状态

- 用途：Scene 2-1、3-2
- 追加提示词：simple dark shirt with rolled sleeves，making breakfast in kitchen，steady domestic care，soft morning light，gentle but restrained

#### SY-03 夜灯客厅状态

- 用途：Scene 2-2、4-1
- 追加提示词：in living room under one warm lamp，architect drawings or laptop nearby，waiting quietly，care hidden in routine，suppressed emotion

#### SY-04 白天归家状态

- 用途：Scene 3-1
- 追加提示词：weekend casual adult outfit，just returned home，holding keys or coat，daylight living room，nostalgic emotional pause

#### SY-05 阳台高张力状态

- 用途：Scene 3-3
- 追加提示词：standing beside someone on balcony，night breeze，city lights behind，almost saying too much，jaw slightly tense，restrained longing

#### SY-06 深夜压抑对峙状态

- 用途：Scene 4-2、4-3
- 追加提示词：deep night interior，shadowed warm side light，suppressed jealousy，tense jaw，careful eye contact，emotion close to losing control but still held back

## 3.3 可后补角色

### 周既明 P1 预备图

- 目前前四章没有直接登场画面，不是刚需。
- 如果你想提前备素材，可用：

26-year-old Chinese man，brand strategy manager，polished office style，easy smile，emotionally fluent，light luxury urban professional，friendly but slightly threatening to the male lead

### 林知夏 P1 预备图

- 目前只有存在感，不是刚需。
- 可用：

25-year-old Chinese woman，coffee shop owner，warm and observant，casual stylish outfit，independent adult vibe，gentle helper energy

## 4. 背景图刚需清单

使用方式：统一图像前缀 + 下方主体 prompt + 统一负面提示词。

### BG-01 雨夜玄关门口

- 覆盖 scene：1-1
- 画面脚本：门打开的一瞬间，雨声还在门外，暖光从屋里泄出来，重逢发生在门槛上。
- 主体 prompt：night rainy Chinese apartment entryway，half-open dark metal apartment door，warm amber interior light spilling onto cool blue corridor tiles，slight wet footprints and rain sheen，compact shoe cabinet，umbrella stand，lived-in old apartment realism，empty scene，no people

### BG-02 客厅暖灯雨夜

- 覆盖 scene：1-2
- 画面脚本：客厅不大，但很安静，暖灯把狼狈和尴尬都稍微变软。
- 主体 prompt：cozy apartment living room at rainy night，warm floor lamp，sofa，coffee table with architectural drawings，healthy green plant in corner，subtle rain on window outside，quiet and restrained domestic realism，empty scene，no people

### BG-03 客房门口暖光

- 覆盖 scene：1-3
- 画面脚本：今晚终于有了落点，门内是新铺好的床，门外是没说完的话。
- 主体 prompt：guest room doorway at night，soft warm light from inside room，fresh sheets visible on bed，compact suitcase near threshold，clean apartment interior，gentle emotional afterglow，empty scene，no people

### BG-04 深夜走廊便签门缝

- 覆盖 scene：1-4
- 画面脚本：雨夜收尾，走廊很静，门缝有暖光，牛奶和便签被留在地上。
- 主体 prompt：narrow apartment hallway late at night，warm light leaking through a door gap，a glass of hot milk and a handwritten note on the floor，post-rain stillness，quiet intimate realism，empty scene，no people

### BG-05 清晨厨房

- 覆盖 scene：2-1
- 画面脚本：一个过于普通的清晨，煎蛋、热牛奶和柔和晨光把同住感立起来。
- 主体 prompt：small Chinese apartment kitchen in the morning，soft daylight through window，frying pan on stove，warm milk mug，clean but lived-in countertop，gentle domestic routine，subtle adult romance atmosphere，empty scene，no people

### BG-06 夜归留灯客厅餐桌

- 覆盖 scene：2-2、4-2
- 画面脚本：客厅里留着一盏灯，桌上有热水和切好的水果，像有人一直在等。
- 主体 prompt：apartment living room and dining table at night，one warm lamp left on，cut fruit and warm water on table，laptop or drawings aside，quiet waiting atmosphere，adult urban apartment realism，empty scene，no people

### BG-07 雷雨夜客厅

- 覆盖 scene：2-3
- 画面脚本：客厅比平时更暗，窗外闪电和雷声压着暧昧，空间要有电流感。
- 主体 prompt：living room during thunderstorm night，deep blue ambient tone，flash of lightning through window，cup on side table，slight electrical hum feeling，quiet restrained tension，empty scene，no people

### BG-08 周末白天客厅旧照片

- 覆盖 scene：3-1
- 画面脚本：白天的客厅很安静，地毯上散着旧照片，过去被翻了出来。
- 主体 prompt：weekend daytime apartment living room，soft daylight，rug on floor with scattered old photographs，bookshelf nearby，nostalgic domestic realism，calm air before emotional revelation，empty scene，no people

### BG-09 冰箱便签厨房

- 覆盖 scene：3-2
- 画面脚本：不是戏剧冲突，而是便签越贴越多，冰箱成了默契的载体。
- 主体 prompt：apartment kitchen with fridge covered in sticky notes and small magnets，domestic everyday intimacy，soft indoor light，kitchen details orderly but lived-in，notes visible but not readable，empty scene，no people

### BG-10 阳台晚风夜景

- 覆盖 scene：3-3
- 画面脚本：楼下灯火很远，晚风很轻，但两人的情绪已经几乎要失控。
- 主体 prompt：night balcony overlooking Chinese city lights，gentle but noticeable wind，urban night depth，warm interior light spilling from behind，restrained romantic tension，coastal city atmosphere，empty scene，no people

### BG-11 晚饭餐桌压抑版

- 覆盖 scene：4-1
- 画面脚本：只是很普通的一顿晚饭，但一个名字被提起以后，餐桌空气立刻不一样了。
- 主体 prompt：apartment dining table at dinner time，two bowls and chopsticks，ordinary home meal under warm light，slight tension in stillness，adult domestic realism，empty scene，no people

### BG-12 深夜厨房对峙

- 覆盖 scene：4-3
- 画面脚本：深夜厨房的暖光把情绪照得太亮，退路已经很窄。
- 主体 prompt：small apartment kitchen deep at night，warm overhead light，mineral water bottle on counter，shadowy edges，tense still air，high emotional pressure without chaos，empty scene，no people

## 5. 音效资产与提示词

使用方式：统一音效前缀 + 下方主体 prompt + 统一音效负面提示词。

### SFX-01 雨夜公寓外环境循环

- 时长：30 到 45 秒，循环
- 覆盖 scene：1-1
- 主体 prompt：medium night rain outside a residential apartment in a Chinese coastal city，distant traffic hush，subtle wind through corridor window，intimate and restrained，seamless loop

### SFX-02 单次门铃

- 时长：1 到 2 秒，单次
- 覆盖 scene：1-1
- 主体 prompt：modern apartment doorbell，soft but clear single ring，realistic interior perspective，not cheerful，not harsh

### SFX-03 行李箱滚轮与停下

- 时长：2 到 4 秒，单次
- 覆盖 scene：1-1
- 主体 prompt：hard-shell suitcase wheels on slightly wet apartment corridor tiles，small stop and reposition movement，close realistic foley

### SFX-04 开门关门与室内外雨声切换

- 时长：3 到 5 秒，单次
- 覆盖 scene：1-1
- 主体 prompt：apartment door opening then closing，outdoor rain briefly louder then muffled by indoor space，realistic perspective shift

### SFX-05 热水倒杯与杯壁轻碰

- 时长：3 到 5 秒，单次
- 覆盖 scene：1-2、2-1、2-2
- 主体 prompt：pouring hot water into ceramic mug，small glass or cup contact，warm indoor kitchen foley，close and delicate

### SFX-06 深夜走廊脚步与便签放下

- 时长：6 到 8 秒，单次
- 覆盖 scene：1-4
- 主体 prompt：quiet late-night apartment footsteps，placing a glass on the floor carefully，soft paper note scratch，very restrained indoor ambience

### SFX-07 清晨厨房生活环境循环

- 时长：20 到 30 秒，循环
- 覆盖 scene：2-1
- 主体 prompt：morning apartment kitchen ambience，gentle pan sizzle，cabinet touch，soft footsteps，light room tone，warm calm domestic loop

### SFX-08 夜归开门换鞋室内氛围

- 时长：10 到 15 秒，可循环或拆段
- 覆盖 scene：2-2、4-2
- 主体 prompt：late night apartment return，door opens softly，keys and shoes，subtle room tone with one lamp on，quiet tired urban homecoming

### SFX-09 雷雨夜客厅环境循环

- 时长：30 到 45 秒，循环
- 覆盖 scene：2-3
- 主体 prompt：interior living room during thunderstorm night，rain on windows，occasional distant thunder，very light electric hum，intimate restrained tension，seamless loop

### SFX-10 旧照片翻动纸张

- 时长：3 到 5 秒，单次
- 覆盖 scene：3-1
- 主体 prompt：old glossy photo prints being picked up and turned over on a rug，paper friction close-mic，nostalgic delicate foley

### SFX-11 冰箱便签与磁贴声音

- 时长：4 到 6 秒，单次
- 覆盖 scene：3-2
- 主体 prompt：fridge magnet click，sticky note paper peel and place，pen writing briefly on paper，gentle domestic foley

### SFX-12 阳台晚风环境循环

- 时长：20 到 30 秒，循环
- 覆盖 scene：3-3
- 主体 prompt：night balcony wind in a coastal Chinese city，distant traffic and faint city hum，soft open-air ambience，intimate and restrained，seamless loop

### SFX-13 晚饭餐桌碗筷氛围

- 时长：10 到 15 秒，可循环
- 覆盖 scene：4-1
- 主体 prompt：quiet apartment dinner ambience，light chopstick and ceramic bowl sounds，warm indoor room tone，ordinary meal with subtle tension

### SFX-14 深夜厨房拧瓶盖与空气绷紧

- 时长：5 到 7 秒，单次
- 覆盖 scene：4-3
- 主体 prompt：plastic water bottle cap twisting open in a quiet kitchen at night，subtle room tone，tense stillness，close realistic foley

## 6. 分场调用脚本

这一节可以直接作为你的素材调用表。

| Scene | 标题 | 背景 | 角色 | 音效 |
| --- | --- | --- | --- | --- |
| 1-1 | 雨夜门口 | BG-01 | XN-01 + SY-01 | SFX-01 + SFX-02 + SFX-03 + SFX-04 |
| 1-2 | 客厅安置 | BG-02 | XN-01 + SY-01 | SFX-05，底噪可弱混 SFX-01 |
| 1-3 | 客房门口 | BG-03 | XN-01 + SY-01 | 可只保留极轻室内底噪，不必强上音效 |
| 1-4 | 深夜便签 | BG-04 | SY-01 | SFX-06 |
| 2-1 | 清晨厨房 | BG-05 | XN-02 + SY-02 | SFX-07 + SFX-05 |
| 2-2 | 夜归留灯 | BG-06 | XN-03 + SY-03 | SFX-08 + SFX-05 |
| 2-3 | 雷雨夜客厅 | BG-07 | XN-04 + SY-03 | SFX-09 |
| 3-1 | 旧照片 | BG-08 | XN-02 + SY-04 | SFX-10 |
| 3-2 | 便签和习惯 | BG-09 | XN-02 + SY-02 | SFX-11，底噪可轻混 SFX-07 |
| 3-3 | 阳台谈心 | BG-10 | XN-05 + SY-05 | SFX-12 |
| 4-1 | 她提起别人 | BG-11 | XN-03 + SY-03 | SFX-13 |
| 4-2 | 公司聚会后回家 | BG-06 | XN-06 + SY-06 | SFX-08 |
| 4-3 | 厨房短对峙 | BG-12 | XN-06 + SY-06 | SFX-14 |

## 7. 低成本复用方案

如果你现在只想先把能跑的素材做出来，可以这样合并：

- BG-06 同时覆盖 Scene 2-2、4-1、4-2，只通过灯光强弱和桌面摆件区分。
- BG-05 和 BG-09 用同一个厨房空间，只单独补一张带冰箱便签特写的版本。
- BG-09 再补一个夜灯版，就能近似覆盖 BG-12。
- 许念只先做 XN-01、XN-02、XN-03、XN-05、XN-06 五张，XN-04 可由 XN-02 微调情绪获得。
- 沈砚川只先做 SY-01、SY-02、SY-03、SY-05、SY-06 五张，SY-04 可由 SY-03 调成白天版。

## 8. 可后补的双人关键剧情图 P1

如果你后面想做章节封面、章节转场或者详情页宣传图，优先补这三张：

### CG-01 雷声里的靠近

- 对应：Scene 2-3
- 主体 prompt：two adult Chinese leads in a dim living room during thunderstorm night，the woman holding a cup and unconsciously standing a little closer，the man calm with a faint knowing smile，no touching，high-quality restrained romantic tension，cinematic still

### CG-02 阳台谈心

- 对应：Scene 3-3
- 主体 prompt：two adult Chinese leads on a night balcony with city lights，woman draped in a dark coat，wind moving hair，man standing beside her almost speaking too much，strong emotional tension，no hug，no kiss，cinematic urban romance still

### CG-03 厨房短对峙

- 对应：Scene 4-3
- 主体 prompt：two adult Chinese leads in a small kitchen at deep night under warm light，close eye contact，high tension，one near the counter with a water bottle，the other pressing the question without stepping back，restrained almost-confession，cinematic still

## 9. 最后建议

- 先用角色基准图做参考图，再生成状态变体，能显著降低脸漂。
- 背景尽量留出中景站位，方便后期叠角色。
- 音效不要做得太满，这个故事靠留白，不靠堆情绪。
- 如果 Nano Banana 对中文理解不稳定，可以保留中文前提，同时把主体 prompt 里的英文部分完整带上。
