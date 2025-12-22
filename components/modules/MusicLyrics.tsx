"use client";

import { useState, useCallback } from "react";
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
  lyrics: string;
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
    lyrics: `[Intro]
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
    genre: "搞笑說唱",
    year: 2024,
    isFavorite: true,
  },
  {
    id: "2",
    title: "台北有鋒兄真好",
    artist: "鋒兄 & 塗哥",
    album: "鋒兄音樂精選",
    lyrics: `台北有鋒兄真好！
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
    genre: "嘻哈說唱",
    year: 2024,
    isFavorite: true,
  },

];

export default function MusicLyrics() {
  const [songs, setSongs] = useState<Song[]>(SAMPLE_SONGS);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSong, setNewSong] = useState({
    title: "",
    artist: "",
    album: "",
    lyrics: "",
    genre: "",
    year: new Date().getFullYear(),
  });

  // 搜尋歌曲
  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.album?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 切換收藏狀態
  const toggleFavorite = useCallback((songId: string) => {
    setSongs(prev => prev.map(song =>
      song.id === songId ? { ...song, isFavorite: !song.isFavorite } : song
    ));
  }, []);

  // 新增歌曲
  const handleAddSong = useCallback(() => {
    if (!newSong.title || !newSong.artist || !newSong.lyrics) return;

    const song: Song = {
      id: Date.now().toString(),
      title: newSong.title,
      artist: newSong.artist,
      album: newSong.album || undefined,
      lyrics: newSong.lyrics,
      genre: newSong.genre || undefined,
      year: newSong.year || undefined,
      isFavorite: false,
    };

    setSongs(prev => [...prev, song]);
    setNewSong({
      title: "",
      artist: "",
      album: "",
      lyrics: "",
      genre: "",
      year: new Date().getFullYear(),
    });
    setShowAddForm(false);
  }, [newSong]);

  // 播放控制
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

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
                    <Button variant="outline" size="sm">
                      <Volume2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <pre className="whitespace-pre-wrap font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
                    {selectedSong.lyrics}
                  </pre>
                </div>
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
                <Textarea
                  value={newSong.lyrics}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewSong(prev => ({ ...prev, lyrics: e.target.value }))}
                  placeholder="輸入歌詞內容..."
                  rows={10}
                  className="resize-none"
                />
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