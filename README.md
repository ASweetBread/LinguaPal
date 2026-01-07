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
3.对话创建依据，现在是根据用户关键词创建，但是存在对话过于浅显的问题
4.添加语音相关练习


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
