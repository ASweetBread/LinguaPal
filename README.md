下一步，prompt修改，基于CEFR标准词汇表和用户在生成对话中选中翻译的单词，生成对话，涉及到词汇等级，选中翻译api前端部分集成

1.对于场景中环节不够深入的问题，交给用户，生成多个环节，每个环节生成一个场景对话。

表单设计

用户输入关键词，AI生成场景对话。用户通过朗读和打字的方式练习，系统记录学习过的单词并安排复习

leancloud

任务
1.走通整个学习流程（完成）
2.单词学习与记录的过程，改为从错误的句子中获取，最后让AI整理，然后输入到单词表
AI整理错误句子。
    
    1.在PracticeFlow中，diff中添加用户输入的错误单词，格式如下
    {
        "type": "word",
        "word": "That's",
        "correct": false,
        "userInput": "That's"
    },
    2.在markDifferencesByWord中，除了 ' 之外的标点，提出出来，作为单独的一项。标点提取从原句中提取，格式见下面json，同样放在diff数组中。
    {
        "type": "punctuation",
        "value": "."
    }
    3.在SceneInput中，将scene变量，放在useDialogueStore中
    4.在PracticeResult中，将退出练习按钮，改为完成按钮
    在提示词模式下，点击完成按钮，将使用generateResultAnalyzPrompt和reviewQueue生成分析提示词，然后显示提示词展示组件。
    在正常模式下，点击完成按钮，访问新的api路由，将reviewQueue中diff的部分和scene作为参数，发送给后端。后端在这个新的api路由中，根据diff和scene使用generateResultAnalyzPrompt生成分析提示词，用提示词调用ai的 api，获取分析结果返回前端。可以参考generate-dialogue的api路由的实现。
    5.新增提示词展示组件，其中包含了提示词展示输入框，用来展示提示词 和 分析结果输入框，用来提交分析结果
    6.在SceneInput中，同样有提示词模式，改为使用提示词展示组件


    7.对话生成的生词列表只做参考或者后期删除，通过用户的答题过程生成生词表，再让用户删除掉他觉得不是生词的部分，最后将剩余的生词存储到单词表中。
    以目标替换场景，用户在使用时，先输入目标，然后AI分析实现这个学习目标所需要的知识，测试用户当前水平，根据测试结果，生成学习计划。用户学习，然后间断性再测试用户水平，根据测试结果，调整学习计划。

schema.prisma中 Keyword新增了几个字段，如下
  coreRequirements String?
  difficultyLevel  String?
  supplements      String?
  vocabularyScope  String?
  keySentencePatterns String?
1.在SceneInput中，生成对话之前增加一个流程，现需要根据输入的关键字，1.提示词模式下，使用generateAnalysisKeywordPrompt生成分析提示词，用户需要将分析结果填写到输入框中，这些数据会存储在keyWordStore（keyWordStore的实现参考dialogueStore， keyWordStore包含一个currentKeyWord存储上述的数据和一个keyWordList存储所有设置过的keyword数据结构）。同时这些数据也会调用keyWord存储api路由，存入数据库（参考vocabulary） 2.正常模式下，直接根据关键字请求新的api路由（参考generate-dialogue的api路由），api路由中会根据关键字调用generateAnalysisKeywordPrompt生成分析提示词，用提示词调用ai的 api，获取分析结果返回前端。但是会在返回路由中先存储keyword数据结构，然后返回前端同样也会存储到keyWordStore。
2.然后才是generateDialoguePrompt的调用，generateDialoguePrompt新增了一些参数，调用的时候需要传入这些参数。
3.PracticeResult中，生成关键词的函数使用generateResultAnalyzPrompt替换直接使用RESULT_ANALYZ_PROMPT。
将用户填写的或者接口返回的{"word": "原正确单词", "errorType": "分析结果", "phonetic": "音标（如适用）", "meanings": "含义（所有含义）", "partOfSpeech": "词性", "phrase": "所属短语（该词在原句中所在的短语，没有则为空）", "phraseMeaning": "短语含义（如果适用）"}结构的数据，按照schema.prisma的中model的结构存储到数据库中。分别需要存储Word,Phrase（如果有）,PhraseMeaning （如果有）,ErrorRecord中，不要擅自修改model的结构


3.对话创建依据，现在是根据用户关键词创建，但是存在对话过于浅显的问题
4.添加语音相关练习

5.看单词知道怎么读的那个博主，要是能把她的技巧放在系统中，就更好了。
6.句子加上句子结构，主谓语啥的

开发记录
tailwind bug记录 使用oklch的时候，bg-secondary/80 无法生效，需要在tailwind.config.js中添加
```
module.exports = {
  theme: {
    extend: {
      colors: {
        secondary: 'oklch(var(--secondary) / <alpha-value>)',
      }
    }
  }
}
```
