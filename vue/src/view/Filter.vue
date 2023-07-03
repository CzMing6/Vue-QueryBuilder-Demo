<template>
  <el-card class="box-card">
    <el-row>
      <el-col :span="12">
        <el-row>
          <el-switch
            v-model="group.isNot"
            inline-prompt
            active-text="NOT"
            width="50"
            :disabled="group.rules.length <= 1"
          />
          <el-radio-group
            v-model="group.operator"
            :disabled="group.rules.length <= 1"
          >
            <el-radio-button label="AND" />
            <el-radio-button label="OR" />
          </el-radio-group>
        </el-row>
      </el-col>
      <el-col :span="12">
        <el-row justify="end">
          <el-button type="success" @click="addRule">添加规则</el-button>
          <el-button type="success" @click="addGroup">添加括号</el-button>
        </el-row>
      </el-col>
    </el-row>

    <template v-for="(item, index) in group.rules" :key="index">
      <el-row v-if="'column' in item">
        <el-col>
          <Rule
            v-if="parentColumn.length != 0"
            @parentDeleteItem="deleteItem(index)"
            @getChildRule="getChildRule"
            :parentIndex="index"
            :parentColumn="parentColumn"
          ></Rule>
        </el-col>
      </el-row>
      <el-row v-if="'isNot' in item">
        <el-col>
          <Group
            @parentDeleteItem="deleteItem(index)"
            @getChildRule="getChildRule"
            :parentIndex="index"
            :parentColumn="parentColumn"
          ></Group>
        </el-col>
      </el-row>
    </template>
    <el-row>
      <el-button type="primary" @click="reSet">重置</el-button>
      <el-button
        type="primary"
        @click="
          dialog.sql = toSQL(group);
          dialog.dialogVisible = true;
        "
        >SQL</el-button
      >
      <el-button type="primary" @click="query">查询</el-button>

      <el-dialog v-model="dialog.dialogVisible" title="SQL条件语句" width="30%">
        <span>{{ dialog.sql }}</span>
        <template #footer>
          <span class="dialog-footer">
            <el-button type="primary" @click="dialog.dialogVisible = false">
              好的
            </el-button>
          </span>
        </template>
      </el-dialog>
    </el-row>
  </el-card>

  <el-card class="box-card">
    <el-table :data="table.data" style="width: 100%" height="250">
      <el-table-column
        v-for="(item, index) in table.header"
        :key="index"
        :prop="item"
        :label="item"
      />
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import Rule from '../components/Rule.vue';
import Group from '../components/Group.vue';
import axios from 'axios';

// 保存查询结果数据的接口, 代表结果集合和表头
interface Table {
  data: any[];
  header: string[];
}

// 从后端获取将操作的表的各个列
const queryColumn = () => {
  axios
    .get('/api/getSql')
    .then((res) => {
      parentColumn.splice(0, parentColumn.length);
      res.data.forEach((item: Column) => {
        parentColumn.push(item);
      });
    })
    .catch((error) => {
      console.error(error);
    });
};

// 保存要操作的各个列的数据
const parentColumn: Column[] = reactive([]);
// 初始化时直接调用该方法
queryColumn();

// Group 接口的实例
const group = reactive<GroupInterface>({
  isNot: false,
  operator: '',
  rules: [
    {
      column: '',
      logic: '',
      expect: [],
    },
  ],
});

const addRule = () => {
  group.rules.push({
    column: '',
    logic: '',
    expect: [],
  });
  if (group.operator == '' && group.rules.length == 2) {
    group.operator = 'AND';
  }
};

const addGroup = () => {
  group.rules.push({
    isNot: false,
    operator: '',
    rules: [
      {
        column: '',
        logic: '',
        expect: [],
      },
    ],
  });
  if (group.operator == '' && group.rules.length == 2) {
    group.operator = 'AND';
  }
};

const deleteItem = (index: number) => {
  group.rules.splice(index, 1);
  if (group.operator != '' && group.rules.length == 1) {
    group.operator = '';
  }
};

const getChildRule = (rule: RuleInterface | GroupInterface, index: number) => {
  group.rules[index] = rule;
};

// 重置所有规则和括号, 但是有点小问题
const reSet = () => {
  group.isNot = false;
  group.operator = '';
  group.rules.splice(0, group.rules.length);
  // addRule(); // 加上这一句会导致下标为 0 的数组清除失败
  queryColumn();
  table.data.splice(0, table.data.length);
  table.header.splice(0, table.header.length);
};

// 弹出框展示的内容, 代表是否显示弹出框和内容
const dialog = reactive<{ dialogVisible: boolean; sql: string }>({
  dialogVisible: false,
  sql: '',
});

// 把规则和括号转换为 SQL 语句
const toSQL = (group: GroupInterface): string => {
  let result: string = '';
  const condition: string[] = [];
  group.rules.forEach((item, index) => {
    if ('column' in item) {
      const { column, logic, expect } = item;
      condition[index] = column + ' ' + logicHandler(logic, expect);
    } else {
      condition[index] = '(' + toSQL(item) + ')';
    }
  });
  const { isNot, operator } = group;
  for (let index = 0; index < condition.length; index++) {
    if (index == 0 && isNot) {
      result = result.concat('NOT (' + condition[index] + ' ' + operator + ' ');
    } else if (index == condition.length - 1) {
      if (isNot) result = result.concat(condition[index] + ') ');
      else result = result.concat(condition[index]);
    } else {
      result = result.concat(condition[index] + ' ' + operator + ' ');
    }
  }
  return result;
};

/*
"equal", => =
"not equal", => !=
"in",
"not in",
"is null",
"is not null",
"begins with", => LIKE '...%'
"doesn't begin with", => NOT LIKE  '...%'
"contains",  => LIKE  '%...%'
"doesn't contains", => NOT LIKE  '%...%'
"ends with",  => LIKE  '%...'
"doesn't end with",  => NOT LIKE  '%...'
"is empty", => = ''
"is not empty", => != ''
"less", => <
"less or equal", => <=
"greater", => >
"greater or equal", => >=
"between", => BETWEEN ... AND ...
"not between", => NOT BETWEEN ... AND ...
*/
// 在转换过程中, 对逻辑运算符和期望值的处理
const logicHandler = (logic: string, expect: (string | number)[]): string => {
  let result: string = '';
  switch (logic) {
    case 'equal':
      result = '= ' + expect[0];
      break;
    case 'not equal':
      result = '!= ' + expect[0];
      break;
    case 'in':
      result = 'IN(' + expect[0] + ')';
      break;
    case 'not in':
      result = 'NOT IN(' + expect[0] + ')';
      break;
    case 'is null':
      result = 'IS NULL';
      break;
    case 'is not null':
      result = 'IS NOT NULL';
      break;
    case 'begins with':
      result = "LIKE '" + expect[0] + "%'";
      break;
    case "doesn't begin with":
      result = "NOT LIKE '" + expect[0] + "%'";
      break;
    case 'contains':
      result = "LIKE '%" + expect[0] + "%'";
      break;
    case "doesn't contains":
      result = "NOT LIKE '%" + expect[0] + "%'";
      break;
    case 'ends with':
      result = "LIKE '%" + expect[0] + "'";
      break;
    case "doesn't end with":
      result = "NOT LIKE '%" + expect[0] + "'";
      break;
    case 'is empty':
      result = 'IS EMPTY';
      break;
    case 'is not empty':
      result = 'IS NOT EMPTY';
      break;
    case 'less':
      result = '< ' + expect[0];
      break;
    case 'less or equal':
      result = '<= ' + expect[0];
      break;
    case 'greater':
      result = '> ' + expect[0];
      break;
    case 'greater or equal':
      result = '>= ' + expect[0];
      break;
    case 'between':
      result = 'BETWEEN ' + expect[0] + ' AND ' + expect[1];
      break;
    case 'not between':
      result = 'NOT BETWEEN ' + expect[0] + ' AND ' + expect[1];
      break;
  }
  return result;
};

// Table 接口的实例
const table = reactive<Table>({
  data: [],
  header: [],
});

// 从后端获取查询结果并覆盖旧的查询结果, 最终保存在 table
const query = () => {
  table.data.splice(0, table.data.length);
  table.header.splice(0, table.header.length);
  const { statement, params } = toSQLStatement(group);
  
  axios
    .post('/api/query', {
      statement: encodeURIComponent(statement),
      params: params,
    })
    .then((res) => {
      res.data.forEach((item: any) => {
        table.data.push(item);
      });
      // 获取表头(即列名)
      Object.keys(table.data[0]).forEach((item: string) => {
        table.header.push(item);
      });
    })
    .catch((error) => {
      console.error(error);
    });
};

// 把规则和括号转换为带占位符的 SQL 语句
const toSQLStatement = (
  group: GroupInterface
): { statement: string; params: { type: string; data: string | number }[] } => {
  let result: string = '';
  const condition: string[] = [];
  const params: { type: string; data: string | number }[] = [];
  group.rules.forEach((item, index) => {
    if ('column' in item) {
      const { column, logic, expect } = item;
      condition[index] = column + ' ' + otherLogicHandler(logic);
      expect.forEach((item) => {
        const { isExist, expect } = expectHandler(logic, item);
        if (isExist)
          params.push({
            type: column,
            data: expect,
          });
      });
    } else {
      const {statement, params: param} = toSQLStatement(item);
      condition[index] = '(' + statement + ')';
      param.forEach((item) => {
        params.push(item);
      });
    }
  });
  const { isNot, operator } = group;
  for (let index = 0; index < condition.length; index++) {
    if (index == 0 && isNot) {
      result = result.concat('NOT (' + condition[index] + ' ' + operator + ' ');
    } else if (index == condition.length - 1) {
      if (isNot) result = result.concat(condition[index] + ') ');
      else result = result.concat(condition[index]);
    } else {
      result = result.concat(condition[index] + ' ' + operator + ' ');
    }
  }
  return { statement: result, params: params };
};

// 对即将填充到占位符的某些期望值进行处理
const expectHandler = (
  logic: string,
  expect: string | number
): { isExist: boolean; expect: string | number } => {
  let isExist = true;
  switch (logic) {
    case 'begins with':
    case "doesn't begin with":
      expect = expect + '%';
      break;
    case 'contains':
    case "doesn't contains":
      expect = '%' + expect + '%';
      break;
    case 'ends with':
    case "doesn't end with":
      expect = '%' + expect;
      break;
    case 'is null':
    case 'is not null':
    case 'is empty':
    case 'is not empty':
      isExist = false;
      break;
  }
  return { isExist, expect };
};

// 对转换为带占位符的 SQL 语句的逻辑运算符进行处理
const otherLogicHandler = (logic: string): string => {
  let result: string = '';
  switch (logic) {
    case 'equal':
      result = '= ?';
      break;
    case 'not equal':
      result = '!= ?';
      break;
    case 'in':
      result = 'IN(?)';
      break;
    case 'not in':
      result = 'NOT IN(?)';
      break;
    case 'is null':
      result = 'IS NULL';
      break;
    case 'is not null':
      result = 'IS NOT NULL';
      break;
    case 'begins with':
      result = 'LIKE ?';
      break;
    case "doesn't begin with":
      result = 'NOT LIKE ?';
      break;
    case 'contains':
      result = 'LIKE ?';
      break;
    case "doesn't contains":
      result = 'NOT LIKE ?';
      break;
    case 'ends with':
      result = 'LIKE ?';
      break;
    case "doesn't end with":
      result = 'NOT LIKE ?';
      break;
    case 'is empty':
      result = "= ''";
      break;
    case 'is not empty':
      result = "!= ''";
      break;
    case 'less':
      result = '< ?';
      break;
    case 'less or equal':
      result = '<= ?';
      break;
    case 'greater':
      result = '> ?';
      break;
    case 'greater or equal':
      result = '>= ?';
      break;
    case 'between':
      result = 'BETWEEN ? AND ?';
      break;
    case 'not between':
      result = 'NOT BETWEEN ? AND ?';
      break;
  }
  return result;
};
</script>

<script lang="ts">
// RULE 组件核心的接口, 代表已选的列, 逻辑运算符和期待的值
export interface RuleInterface {
  column: string;
  logic: string;
  expect: (string | number)[];
}

//  Group 组件核心的接口, 代表已选的 NOT, 运算符和规则
export interface GroupInterface {
  isNot: boolean;
  operator: string;
  rules: (RuleInterface | GroupInterface)[];
}

// 保存当前组件已选的列名, 类型, 列的数据的接口
export interface Column {
  column: string;
  type: number;
  data: (string | number)[];
}

// 父页面传给该子组件的值的接口
export interface Props {
  parentIndex: number;
  parentColumn: Column[];
}
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.box-card {
  width: 1300px;
  margin-bottom: 20px;
}
.box-card:last-child {
  margin-bottom: 0px;
}
.el-radio-group {
  margin-left: 2%;
}
.dialog-footer button:first-child {
  margin-right: 10px;
}
</style>
