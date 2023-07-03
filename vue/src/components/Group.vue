<template>
  <el-card>
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
          <el-button type="danger" @click="emits('parentDeleteItem')"
            >删除
          </el-button>
        </el-row>
      </el-col>
    </el-row>

    <template v-for="(item, index) in group.rules">
      <el-row v-if="'column' in item">
        <el-col>
          <Rule
            @parentDeleteItem="deleteItem(index)"
            @getChildRule="getChildRule"
            :parentIndex="index"
            :parentColumn="props.parentColumn"
          />
        </el-col>
      </el-row>
      <el-row v-if="'isNot' in item">
        <el-col>
          <Group
            @parentDeleteItem="deleteItem(index)"
            @getChildRule="getChildRule"
            :parentIndex="index"
            :parentColumn="props.parentColumn"
          />
        </el-col>
      </el-row>
    </template>
  </el-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import Rule from '../components/Rule.vue';
// import { RuleInterface, GroupInterface, Props } from '../view/Filter.vue';

interface RuleInterface {
  column: string;
  logic: string;
  expect: (string | number)[];
}

//  Group 组件核心的接口, 代表已选的 NOT, 运算符和规则
interface GroupInterface {
  isNot: boolean;
  operator: string;
  rules: (RuleInterface | GroupInterface)[];
}

// 保存当前组件已选的列名, 类型, 列的数据的接口
interface Column {
  column: string;
  type: number;
  data: (string | number)[];
}

// 父页面传给该子组件的值的接口
interface Props {
  parentIndex: number;
  parentColumn: Column[];
}

// 从父页面传过来的值
const props = defineProps<Props>();

// 父页面提供给子组件调用的方法
const emits = defineEmits(['parentDeleteItem', 'getChildRule']);

//  Group 组件的实例
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

// 给当前组件添加一个 Rule 子组件, 并且数据会同步到所有父组件
const addRule = () => {
  group.rules.push({
    column: '',
    logic: '',
    expect: [],
  });
  if (group.operator == '' && group.rules.length == 2) group.operator = 'AND';
  sync();
};

// 给当前组件添加一个 Group 子组件, 并且数据会同步到所有父组件
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
  if (group.operator == '' && group.rules.length == 2) group.operator = 'AND';
  sync();
};

// 提供给子组件调用的方法, 用于子组件删除自身, 并且数据会同步到所有父组件
const deleteItem = (index: number) => {
  group.rules.splice(index, 1);
  if (group.operator != '' && group.rules.length == 1) {
    group.operator = '';
  }
  sync();
};

// 提供给子组件调用的方法, 子组件数据修改后需调用该方法, 并且数据会同步到所有父组件
const getChildRule = (rule: RuleInterface | GroupInterface, index: number) => {
  group.rules[index] = rule;
  sync();
};

// 子组件修改后同步父页面(组件)的数据的方法
const sync = () => {
  emits('getChildRule', group, props.parentIndex);
};
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}
.el-row:last-child {
  margin-bottom: 0;
}
.el-radio-group {
  margin-left: 2%;
}
</style>
