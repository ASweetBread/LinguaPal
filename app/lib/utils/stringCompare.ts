// 可复用的字符串比较与差异标注工具
// 提供：normalizeString, levenshteinDistance, calculateSimilarity, markDifferencesByWord

// 将字符串标准化用于比较：小写、去首尾空格、合并空格、移除常见标点
export const normalizeString = (s: string) => {
  return s
    .toLowerCase()
    .replace(/[-。，！？；：（）【】「」『』“”‘’'".,!?;:()\[\]{}\/\\=_+<>~`@#$%^&*|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// 计算Levenshtein距离（字符级）
export const levenshteinDistance = (str1: string, str2: string): number => {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      )
    }
  }

  return dp[m][n]
}

// 字符相似度百分比
export const calculateSimilarity = (str1: string, str2: string): number => {
  // 标准化字符串，移除标点符号和空格
  const normStr1 = normalizeString(str1)
  const normStr2 = normalizeString(str2)
  
  const distance = levenshteinDistance(normStr1, normStr2)
  const maxLength = Math.max(normStr1.length, normStr2.length)
  return maxLength > 0 ? (1 - distance / maxLength) * 100 : 100
}

// 基于词的LCS以标注参考句中哪些词是匹配的（用于高亮原句的差异）
// 返回参考句的词数组，每个项包含 { word, correct: boolean }
export const markDifferencesByWord = (reference: string, input: string, rolenames: string[] = []) => {
  const refWords = reference.split(/\s+/).filter(Boolean)
  const inWords = input.split(/\s+/).filter(Boolean)

  // 标准化后的单词数组，用于比较
  const normRefWords = refWords.map(word => normalizeString(word))
  const normInWords = inWords.map(word => normalizeString(word))
  
  // 标准化后的角色名称数组
  const normRolenames = rolenames.map(name => normalizeString(name))

  const m = refWords.length
  const n = inWords.length
  // 构建LCS表
  const lcs: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (normRefWords[i - 1] === normInWords[j - 1]) lcs[i][j] = lcs[i - 1][j - 1] + 1
      else lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1])
    }
  }

  // 回溯得到匹配位置
  const matches = new Set<number>()
  let i = m
  let j = n
  while (i > 0 && j > 0) {
    if (normRefWords[i - 1] === normInWords[j - 1]) {
      matches.add(i - 1)
      i--
      j--
    } else if (lcs[i - 1][j] > lcs[i][j - 1]) i--
    else j--
  }

  return refWords.map((w, idx) => {
    // 如果单词是rolename中的name，则correct固定为true
    const normWord = normalizeString(w)
    if (normRolenames.includes(normWord)) {
      return { word: w, correct: true }
    }
    return { word: w, correct: matches.has(idx) }
  })
}

// 判断输入是否“通过”参考句（默认严格比较 normalize 后相等）
export const isInputCorrect = (reference: string, input: string) => {
  const normRef = normalizeString(reference)
  const normIn = normalizeString(input)
  return normRef === normIn
}

export default {
  normalizeString,
  levenshteinDistance,
  calculateSimilarity,
  markDifferencesByWord,
  isInputCorrect
}
