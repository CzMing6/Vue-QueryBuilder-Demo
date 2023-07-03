这是一个由 vue3 + ts + springboot 实现的 SQL 查询构造器。

其中子组件 Group 是指创建一个括号, Rule 是指一条新的规则, 使用递归实现, 理论上可以无限套娃

它的前后端交互只发生在父页面 Filter.vue 中, 主要交互的字段的含义为
Column.column: 列名
Column.type: 列的类型, 指列的逻辑运算符将选择什么
Column.data[]: 模板数据, 未选择时显示的内容
Table.data[]: 查询结果的内容
statement: 带有占位符的 SQL 语句
params: 填充占位符的参数

演示视频
https://music.163.com/#/video?id=9B8E7B6D727C306B3622EF94797047DD
