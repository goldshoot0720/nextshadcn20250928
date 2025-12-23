"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Search, Plus, Heart, Play, Pause, Volume2 } from "lucide-react";

interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  lyrics: {
    zh: string;
    en?: string;
    ja?: string;
  };
  audioFiles: {
    zh: string;
    en?: string;
    ja?: string;
  };
  genre?: string;
  year?: number;
  isFavorite: boolean;
}

// 示例歌曲數據
const SAMPLE_SONGS: Song[] = [
  {
    id: "1",
    title: "史上最瞎結婚理由",
    artist: "鋒兄 & 塗哥",
    album: "鋒兄音樂精選",
    lyrics: {
      zh: `[Intro]
鋒兄啊你說真的還假的
塗哥聽了都快笑翻了

[Verse 1]
鋒兄說要結婚理由只有一個
今彩五三九開獎那天
頭獎號碼是思敏給的
看著獎金直直落心也跟著被收編
他說這是命中注定
不娶怎麼對得起這一連串的玄

[Chorus]
史上最瞎結婚理由
今彩五三九牽紅線牽這麼兇
一個思敏一個蕙瑄
號碼一簽兩人都中頭獎圈
你說愛情是運氣還是數學題
笑到流淚也只能說一句
最瞎最瞎卻又有點甜蜜

[Verse 2]
換到塗哥這邊故事居然同一套
今彩五三九播報畫面
他整個人直接跳
蕙瑄隨手寫的牌竟然全中好幾排
他說財神爺都點名了
不跟她走進禮堂實在太不應該

[Outro]
鋒兄牽著思敏塗哥牽著蕙瑄
喝喜酒的人一桌一桌還在笑這兩段緣
最瞎結婚理由結果都開成頭獎
如果幸福也能這樣瞎忙
那我明天也去買一張`,
      en: `[Intro]
Brother Feng, are you serious or joking?
Brother Tu is laughing so hard

[Verse 1]
Brother Feng says there's only one reason to marry
On the day of the lottery draw
The winning numbers were given by Simin
Watching the jackpot fall, his heart was captured too
He says this is destiny
How can he not marry after this mystical sign

[Chorus]
The most ridiculous reason to marry
The lottery brought them together so strong
One Simin, one Huixuan
Both won the jackpot with their numbers
Is love about luck or mathematics?
Laughing till tears, can only say
Most ridiculous yet somehow sweet

[Verse 2]
Brother Tu's story is exactly the same
When the lottery results were announced
He jumped with joy
Huixuan's random numbers hit the jackpot
He says even the God of Wealth has spoken
Not marrying her would be wrong

[Outro]
Brother Feng with Simin, Brother Tu with Huixuan
Wedding guests laughing at these two stories
Most ridiculous marriage reasons turned into jackpots
If happiness can be this absurd
Then I'll buy a ticket tomorrow too`,
      ja: `[Intro]
鋒兄、マジデ？ウソでしょ？
塗哥は聞いてて笑いが止まらないよ

[Verse 1]
鋒兄は言う、結婚するんだ
理由はただ1つ
今彩539の抽選日
一等番号は思敏がくれた
賞金を見て、心まで奪われて
これが運命だと彼は言った
彼女を娶らなければ、この奇妙な連続を心から受け入れられない

[Chorus]
史上最も馬鹿げた結婚理由
今彩539が結んだ赤い糸
思敏と蕙瑄
一度の番号で２人とも一等に
愛は運か数学の問題か
涙が出るほど笑っても言えるのは
馬鹿げてるけど、少し甘い

[Verse 2]
塗哥に変わって
物語は同じ展開
今彩539の放送、彼は飛び上がる
蕙瑄がメモった数字、全部当たり
財神に呼ばれた彼は言う
彼女と祭壇に行かないなんてありえない

[Outro]
鋒兄は思敏を連れ
塗哥は蕙瑄を連れ
披露宴のテーブルごとに
みなこの2つの縁で笑ってる
最も馬鹿げた結婚理由
結果は一等に
もし幸福がこんなに馬鹿だったら
私も明日買いに行こうかな`
    },
    audioFiles: {
      zh: "/musics/最瞎結婚理由.mp3",
      en: "/musics/最瞎結婚理由 (英語).mp3",
      ja: "/musics/最瞎結婚理由 (日語).mp3"
    },
    genre: "搞笑說唱",
    year: 2024,
    isFavorite: true,
  },
  {
    id: "2",
    title: "鋒兄進化Show🔥",
    artist: "鋒兄 & 塗哥",
    album: "鋒兄音樂精選",
    lyrics: {
      zh: `台北有鋒兄真好！
嗨起來別逃跑！
從榜首進化到市長, 這節奏太離譜（wow）
塗哥唱歌別裝低調, 記者都在拍照！
綾小路都說這段人生　根本 S 級動畫稿～

37歲那年我高考三級奪榜首（yeah）
資訊處理一戰成名　程式都寫成傳說～
隔著時代的螢幕光　夢想像演算法（run）
52歲副市長代理市長上陣忙！（yo）

塗哥敢唱「有鋒兄真好」
備取瞬間正取秒秒到～
不唱就取消資格笑　
進化不靠運氣靠信號！

台北有鋒兄真好！
嗨起來別逃跑！
從榜首進化到市長, 命運像 debug 一樣爆！
塗哥嗓門開到爆表, 全場跟著大合唱！
「代理」只是過場　市民心中早就想！

2040那年的夜　霓虹閃爍到市政廳
競選標語像 ACG 的 opening
「別說不可能, 鋒兄就是 evolution！」
AI 輔助政務操作　資料開放新世代～

陰陽同框　政治與理想　交錯的舞台線上～
一首歌唱到選票都跳起來　塗哥還要再唱！

台北有鋒兄真好！
嗨起來直到早朝！
榜首到市長的進化論　全城都在尖叫！
綾小路清隆也點頭　這進化合乎理想！
「ムリムリ進化論？」不——這是鋒兄進化 Show！🔥`,
      en: `Taipei is great with Brother Feng!
Get hyped, don't run away!
From top scorer to mayor, this rhythm is insane (wow)
Brother Tu singing, don't be shy, reporters are taking photos!
Even Ayanokoji says this life is S-tier anime material~

At 37, I topped the civil service exam (yeah)
Information processing made me legendary, code became legend~
Through the screen light of the era, dreams like algorithms (run)
At 52, deputy mayor, acting mayor, so busy! (yo)

Brother Tu dares to sing "Brother Feng is great"
From backup to official in seconds~
Don't sing and lose qualification, laugh
Evolution doesn't rely on luck but signals!

Taipei is great with Brother Feng!
Get hyped, don't run away!
From top scorer to mayor, destiny explodes like debugging!
Brother Tu's voice at max, everyone singing along!
"Acting" is just a phase, citizens already decided!

In 2040's night, neon lights flash at city hall
Campaign slogans like ACG opening
"Don't say impossible, Brother Feng is evolution!"
AI-assisted governance, open data new era~

Yin and yang together, politics and ideals, crossing stage lines~
One song makes votes jump, Brother Tu wants to sing more!

Taipei is great with Brother Feng!
Get hyped until dawn!
Evolution from top scorer to mayor, the whole city screaming!
Even Ayanokoji Kiyotaka nods, this evolution fits the ideal!
"Impossible evolution?" No—this is Brother Feng Evolution Show! 🔥`,
      ja: `台北に鋒兄がいて本当に良い！
盛り上がって逃げるな！
トップから市長への進化、このリズムはヤバい（wow）
塗哥は歌って控えめにするな、記者が写真を撮ってる！
綾小路もこの人生はSランクアニメの原稿だと言う～

37歳の年に公務員試験でトップ（yeah）
情報処理で一戦成名　プログラムは伝説になった～
時代のスクリーンの光を通して　夢はアルゴリズムのよう（run）
52歳で副市長、代理市長で忙しい！（yo）

塗哥は「鋒兄がいて良い」と歌う勇気
補欠から正式に秒で到着～
歌わないと資格取り消し笑
進化は運じゃなくて信号に頼る！

台北に鋒兄がいて本当に良い！
盛り上がって逃げるな！
トップから市長への進化、運命はデバッグのように爆発！
塗哥の声は最大、全員が大合唱！
「代理」はただの通過点　市民の心はもう決まってる！

2040年の夜　ネオンが市政庁に輝く
選挙スローガンはACGのオープニングのよう
「不可能と言うな、鋒兄は進化だ！」
AI補助政務操作　データ開放新時代～

陰陽同枠　政治と理想　交錯する舞台線上～
一曲で投票が跳ね上がる　塗哥はまた歌いたい！

台北に鋒兄がいて本当に良い！
朝まで盛り上がれ！
トップから市長への進化論　全市が叫んでる！
綾小路清隆も頷く　この進化は理想に合う！
「ムリムリ進化論？」いや——これは鋒兄進化Show！🔥`
    },
    audioFiles: {
      zh: "/musics/鋒兄進化Show🔥.mp3",
      en: "/musics/鋒兄進化Show🔥(英語).mp3",
      ja: "/musics/鋒兄進化Show🔥(日語).mp3"
    },
    genre: "嘻哈說唱",
    year: 2024,
    isFavorite: true,
  },
];

export default function MusicLyrics() {
  const [songs, setSongs] = useState<Song[]>(SAMPLE_SONGS);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<'zh' | 'en' | 'ja'>('zh');
  const [searchTerm, setSearchTerm] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSong, setNewSong] = useState({
    title: "",
    artist: "",
    album: "",
    lyrics: {
      zh: "",
      en: "",
      ja: ""
    },
    genre: "",
    year: new Date().getFullYear(),
  });

  // 搜尋歌曲
  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.album?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.lyrics.zh.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.lyrics.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.lyrics.ja?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 切換收藏狀態
  const toggleFavorite = useCallback((songId: string) => {
    setSongs(prev => prev.map(song =>
      song.id === songId ? { ...song, isFavorite: !song.isFavorite } : song
    ));
  }, []);

  // 新增歌曲
  const handleAddSong = useCallback(() => {
    if (!newSong.title || !newSong.artist || !newSong.lyrics.zh) return;

    const song: Song = {
      id: Date.now().toString(),
      title: newSong.title,
      artist: newSong.artist,
      album: newSong.album || undefined,
      lyrics: {
        zh: newSong.lyrics.zh,
        en: newSong.lyrics.en || undefined,
        ja: newSong.lyrics.ja || undefined,
      },
      audioFiles: {
        zh: "", // 需要用戶上傳音頻文件
        en: newSong.lyrics.en ? "" : undefined,
        ja: newSong.lyrics.ja ? "" : undefined,
      },
      genre: newSong.genre || undefined,
      year: newSong.year || undefined,
      isFavorite: false,
    };

    setSongs(prev => [...prev, song]);
    setNewSong({
      title: "",
      artist: "",
      album: "",
      lyrics: {
        zh: "",
        en: "",
        ja: ""
      },
      genre: "",
      year: new Date().getFullYear(),
    });
    setShowAddForm(false);
  }, [newSong]);

  // 播放控制
  const togglePlay = useCallback(() => {
    if (!selectedSong) return;

    if (currentAudio) {
      if (isPlaying) {
        currentAudio.pause();
        setIsPlaying(false);
      } else {
        currentAudio.play();
        setIsPlaying(true);
      }
    } else {
      const audioFile = selectedSong.audioFiles[currentLanguage];
      if (audioFile) {
        const audio = new Audio(audioFile);
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          setCurrentAudio(null);
        });
        audio.addEventListener('error', () => {
          console.error('Audio playback error');
          setIsPlaying(false);
          setCurrentAudio(null);
        });
        setCurrentAudio(audio);
        audio.play();
        setIsPlaying(true);
      }
    }
  }, [selectedSong, currentLanguage, currentAudio, isPlaying]);

  // 切換語言
  const handleLanguageChange = useCallback((language: 'zh' | 'en' | 'ja') => {
    setCurrentLanguage(language);
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  }, [currentAudio]);

  // 停止播放
  const stopPlay = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  }, [currentAudio]);

  // 清理音頻資源
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }
    };
  }, [currentAudio]);

  // 當選擇的歌曲改變時停止播放
  useEffect(() => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  }, [selectedSong]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Music className="text-purple-600" />
            鋒兄音樂歌詞
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            收藏和管理您喜愛的歌曲歌詞
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus size={16} />
          新增歌曲
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 歌曲列表 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">歌曲庫</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="搜尋歌曲、歌手或專輯..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredSongs.map((song) => (
                  <div
                    key={song.id}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedSong?.id === song.id ? "bg-purple-50 dark:bg-purple-900/20" : ""
                    }`}
                    onClick={() => setSelectedSong(song)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {song.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {song.artist}
                        </p>
                        {song.album && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {song.album}
                          </p>
                        )}
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline" className="text-xs px-1 py-0">中</Badge>
                          {song.lyrics.en && <Badge variant="outline" className="text-xs px-1 py-0">EN</Badge>}
                          {song.lyrics.ja && <Badge variant="outline" className="text-xs px-1 py-0">日</Badge>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(song.id);
                        }}
                        className="ml-2"
                      >
                        <Heart
                          size={16}
                          className={song.isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}
                        />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 歌詞顯示 */}
        <div className="lg:col-span-2">
          {selectedSong ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{selectedSong.title}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {selectedSong.artist}
                      {selectedSong.album && ` • ${selectedSong.album}`}
                      {selectedSong.year && ` • ${selectedSong.year}`}
                    </CardDescription>
                    {selectedSong.genre && (
                      <Badge variant="secondary" className="mt-2">
                        {selectedSong.genre}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(selectedSong.id)}
                    >
                      <Heart
                        size={16}
                        className={selectedSong.isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}
                      />
                    </Button>
                    <Button variant="outline" size="sm" onClick={togglePlay}>
                      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={stopPlay}>
                      <Volume2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={currentLanguage} onValueChange={(value) => handleLanguageChange(value as 'zh' | 'en' | 'ja')}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="zh">中文</TabsTrigger>
                    <TabsTrigger value="en" disabled={!selectedSong.lyrics.en}>English</TabsTrigger>
                    <TabsTrigger value="ja" disabled={!selectedSong.lyrics.ja}>日本語</TabsTrigger>
                  </TabsList>
                  <TabsContent value="zh" className="mt-4">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                      <pre className="whitespace-pre-wrap font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                        {selectedSong.lyrics.zh}
                      </pre>
                    </div>
                  </TabsContent>
                  {selectedSong.lyrics.en && (
                    <TabsContent value="en" className="mt-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                        <pre className="whitespace-pre-wrap font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                          {selectedSong.lyrics.en}
                        </pre>
                      </div>
                    </TabsContent>
                  )}
                  {selectedSong.lyrics.ja && (
                    <TabsContent value="ja" className="mt-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                        <pre className="whitespace-pre-wrap font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                          {selectedSong.lyrics.ja}
                        </pre>
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
                {selectedSong.audioFiles[currentLanguage] && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                      正在播放: {currentLanguage === 'zh' ? '中文版' : currentLanguage === 'en' ? '英文版' : '日文版'}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={togglePlay}>
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        {isPlaying ? '暫停' : '播放'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={stopPlay}>
                        停止
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    選擇一首歌曲
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    從左側列表中選擇歌曲來查看歌詞
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 新增歌曲對話框 */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>新增歌曲</CardTitle>
              <CardDescription>
                添加新的歌曲和歌詞到您的收藏中
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    歌曲名稱 *
                  </label>
                  <Input
                    value={newSong.title}
                    onChange={(e) => setNewSong(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="輸入歌曲名稱"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    歌手 *
                  </label>
                  <Input
                    value={newSong.artist}
                    onChange={(e) => setNewSong(prev => ({ ...prev, artist: e.target.value }))}
                    placeholder="輸入歌手名稱"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    專輯
                  </label>
                  <Input
                    value={newSong.album}
                    onChange={(e) => setNewSong(prev => ({ ...prev, album: e.target.value }))}
                    placeholder="輸入專輯名稱"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    年份
                  </label>
                  <Input
                    type="number"
                    value={newSong.year}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSong(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    placeholder="發行年份"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    類型
                  </label>
                  <Input
                    value={newSong.genre}
                    onChange={(e) => setNewSong(prev => ({ ...prev, genre: e.target.value }))}
                    placeholder="音樂類型"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  歌詞 *
                </label>
                <Tabs defaultValue="zh" className="mt-2">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="zh">中文 *</TabsTrigger>
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="ja">日本語</TabsTrigger>
                  </TabsList>
                  <TabsContent value="zh" className="mt-2">
                    <Textarea
                      value={newSong.lyrics.zh}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                        setNewSong(prev => ({ 
                          ...prev, 
                          lyrics: { ...prev.lyrics, zh: e.target.value }
                        }))
                      }
                      placeholder="輸入中文歌詞內容..."
                      rows={8}
                      className="resize-none"
                    />
                  </TabsContent>
                  <TabsContent value="en" className="mt-2">
                    <Textarea
                      value={newSong.lyrics.en}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                        setNewSong(prev => ({ 
                          ...prev, 
                          lyrics: { ...prev.lyrics, en: e.target.value }
                        }))
                      }
                      placeholder="Enter English lyrics..."
                      rows={8}
                      className="resize-none"
                    />
                  </TabsContent>
                  <TabsContent value="ja" className="mt-2">
                    <Textarea
                      value={newSong.lyrics.ja}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                        setNewSong(prev => ({ 
                          ...prev, 
                          lyrics: { ...prev.lyrics, ja: e.target.value }
                        }))
                      }
                      placeholder="日本語の歌詞を入力..."
                      rows={8}
                      className="resize-none"
                    />
                  </TabsContent>
                </Tabs>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  取消
                </Button>
                <Button onClick={handleAddSong}>
                  新增歌曲
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}