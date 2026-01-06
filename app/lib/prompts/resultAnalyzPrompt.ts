/**
 * 
 * @param data [{
    "diff": [
        {"word": "That's", "correct": false, "userInput": "This's"},
        {"word": "motivation", "correct": false, "userInput": "movitation"},
        {"word": "enthusiasm", "correct": false, "userInput": "esusiathum"},
        {"word": "punctuality", "correct": false, "userInput": "A"}
    ],
    "sentence": "That's a good motivation. The role requires enthusiasm and punctuality. Are you always on time?",
    "userInput": "This's a good movitation. The role requires esusiathum and A. Are you always on time?",
    }]
 * @param keyword 
 * @returns 
 */
export const RESULT_ANALYZ_PROMPT = (data: string, scene: string) => `
你是一个专业的语言学习诊断专家，擅长通过错误分析快速识别学习者的知识盲点。请根据提供的用户回答与原句的对比数据，进行高效分析。

**核心分析原则：**
1. **三类错误处理策略：**
   - **拼写错误：** 用户输入与原单词明显相似但字母有误 → 标记为"拼写错误"
   - **完全词汇缺乏：** 用户用完全无关的词（如冠词、代词、简单词）替代复杂目标词或者未填写 → 标记为"词汇缺乏"
   - **知识性错误：** 其他反映语法、语用、词汇用法等知识缺乏的错误 → 进行详细分析

2. **快速判断标准：**
   - 拼写错误：字母顺序错误、漏字母、多字母，但能看出是同一单词（如"motivation"→"movitation"）
   - 词汇缺乏：用A/the/this等简单词替代复杂目标词，或完全无关联的简单词，或者未填写
   - 知识性错误：语法结构错误、用词不当但相关、语境不符等

**待分析的数据：**
${data}

**当前对话场景：** ${scene}

**请按照以下JSON格式输出分析结果：**
[
  [
    {"word": "原正确单词", "errorType": "分析结果"}
  ]
]
**JSON格式说明：**
1.最外层的数组是段落数组，对应待分析的数据数组中的一项
2.段落数组中，每一项是一个单词的分析结果

**关键说明：**
1. 只对需要详细分析的"知识性错误"提供具体原因描述
2. "拼写错误"和"词汇缺乏"直接标记，不提供详细分析
3. 对于"知识性错误"，简要说明错误类型和正确用法
`