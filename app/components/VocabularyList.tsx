'use client';
import { useState, useEffect } from 'react';
import { Word, getVocabulary } from '../lib/vocabularyApi';
import { Search, Filter, ChevronDown, Volume2, Edit, Trash2 } from 'lucide-react';

interface VocabularyListProps {
  userId?: number;
}

export default function VocabularyList({ userId = 1 }: VocabularyListProps) {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 获取单词列表
  const fetchWords = async () => {
    try {
      setLoading(true);
      const response = await getVocabulary({
        userId,
        search: searchTerm || undefined,
        difficulty: difficultyFilter || undefined,
        page: currentPage,
        limit: 20
      });

      if (response.success) {
        setWords(response.data.words);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      } else {
        setError('获取单词列表失败');
      }
    } catch (err) {
      setError('获取单词列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和搜索条件变化时重新获取数据
  useEffect(() => {
    fetchWords();
  }, [userId, searchTerm, difficultyFilter, currentPage]);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchWords();
  };

  // 处理难度筛选
  const handleDifficultyFilter = (difficulty: string) => {
    setDifficultyFilter(difficulty);
    setCurrentPage(1);
    setIsFilterOpen(false);
  };

  // 播放单词发音
  const playPronunciation = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  // 格式化学习时间
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 获取难度标签样式
  const getDifficultyBadgeClass = (difficulty?: string) => {
    switch (difficulty) {
      case 'A1':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'A2':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'B1':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'B2':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'C1':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'C2':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* 搜索和筛选栏 */}
      <div className="mb-6 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜索单词或含义..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            搜索
          </button>
        </form>

        {/* 筛选器 */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-white"
            >
              <Filter size={16} />
              <span>难度筛选</span>
              {difficultyFilter && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {difficultyFilter}
                </span>
              )}
              <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleDifficultyFilter('')}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${!difficultyFilter ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'dark:text-white'}`}
                  >
                    全部
                  </button>
                  {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleDifficultyFilter(level)}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${difficultyFilter === level ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'dark:text-white'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400 ml-auto">
            共 {total} 个单词
          </div>
        </div>
      </div>

      {/* 单词列表 */}
      {words.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchTerm || difficultyFilter ? '没有找到匹配的单词' : '暂无记录的单词'}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {searchTerm || difficultyFilter ? '尝试调整搜索条件' : '在学习过程中，系统会自动记录你遇到的生词'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {words.map((word) => (
            <div
              key={word.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {word.word}
                    </h3>
                    {word.phonetic && (
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        [{word.phonetic}]
                      </span>
                    )}
                    <button
                      onClick={() => playPronunciation(word.word)}
                      className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="播放发音"
                    >
                      <Volume2 size={16} className="text-gray-500 dark:text-gray-400" />
                    </button>
                    {word.partOfSpeech && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {word.partOfSpeech}
                      </span>
                    )}
                    {word.difficultyLevel && (
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getDifficultyBadgeClass(word.difficultyLevel)}`}>
                        {word.difficultyLevel}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    {word.meanings}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>学习于 {formatDate(word.learnedAt)}</span>
                    {word.relations && word.relations.length > 0 && (
                      <span>关联 {word.relations.length} 个短语</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="编辑"
                  >
                    <Edit size={16} className="text-gray-500 dark:text-gray-400" />
                  </button>
                  <button
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="删除"
                  >
                    <Trash2 size={16} className="text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:text-white"
            >
              上一页
            </button>
            <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:text-white"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}