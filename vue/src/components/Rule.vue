<template>
  <el-card>
    <el-row>
      <el-col :span="18">
        <!-- <el-form ref="formRef" :model="rule" :rules="rules"> </el-form> -->
        <el-row>
          <el-select
            v-model="rule.column"
            placeholder="-----"
            @change="select"
            class="mr"
          >
            <el-option
              v-for="(item, index) in parentColumn"
              :label="item.column"
              :value="item.column"
              :key="index"
            />
          </el-select>

          <el-select
            v-model="rule.logic"
            v-if="current.type != -1"
            class="mr"
            @change="sync"
          >
            <el-option
              v-for="(item, index) in sql.operator[current.type]"
              :label="item"
              :value="item"
              :key="index"
            />
          </el-select>

          <!-- 第三个框 -->
          <el-radio-group
            v-model="rule.expect[0]"
            v-if="!blackList.includes(rule.logic) && current.type == 0"
            @change="sync"
          >
            <el-radio :label="1">Yes</el-radio>
            <el-radio :label="0">No</el-radio>
          </el-radio-group>
          <el-select
            v-model="rule.expect[0]"
            v-if="!blackList.includes(rule.logic) && current.type == 1"
            @change="sync"
          >
            <el-option
              v-for="(item, index) in current.data"
              :label="item"
              :value="item"
              :key="index"
            />
          </el-select>
          <el-input
            v-model="rule.expect[0]"
            :placeholder="current.data[0]"
            v-if="!blackList.includes(rule.logic) && current.type == 2"
            clearable
            @blur="sync"
          />
          <el-input
            class="mr"
            v-model="rule.expect[0]"
            placeholder=""
            v-if="
              !blackList.includes(rule.logic) &&
              (current.type == 3 || current.type == 4)
            "
            clearable
            @blur="sync"
          />
          <el-input
            v-model="rule.expect[1]"
            placeholder=""
            v-if="
              !blackList.includes(rule.logic) &&
              current.type == 4 &&
              (rule.logic == 'between' || rule.logic == 'not between')
            "
            clearable
            @blur="sync"
          />
        </el-row>
      </el-col>

      <el-col :span="6">
        <el-row justify="end">
          <el-button type="danger" @click="emits('parentDeleteItem')">
			删除
		  </el-button>
        </el-row>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";
import { reactive, ref } from "vue";
// import { Column, RuleInterface, Props } from "../view/Filter.vue";

interface RuleInterface {
  column: string;
  logic: string;
  expect: (string | number)[];
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

// 有关 Column.type 的相关接口, operator 的下标代表如下:
// 0.true/false(单选), 1.一串数据数组(多选), 2.格式, 空(3.字符串, 4.数字)
interface SQL {
  operator: string[][];
}

// Rule 接口的实例
const rule = reactive<RuleInterface>({
  column: "",
  logic: "",
  expect: [],
});

// 从父页面传过来的值
const props = defineProps<Props>();

// 父页面提供给子组件调用的方法
const emits = defineEmits(["parentDeleteItem", "getChildRule"]);

// 子组件修改后同步父页面的数据的方法
const sync = () => {
  emits("getChildRule", rule, props.parentIndex);
};

// Column 接口的实例
const current = reactive<Column>({
  column: "",
  type: -1,
  data: [],
});

// 选中列后的一系列处理
const select = (value: string) => {
  const columns = props.parentColumn.filter((item) => {
    return item.column == value;
  });
  const { type, data } = columns[0];
  current.type = type;
  current.data = data;
  rule.logic = sql.operator[type][0];
  if (type == 2) rule.expect[0] = "";
  else rule.expect[0] = data[0];
  sync();
};

// 黑名单包括的 operator 将不会有期望数值
const blackList: string[] = [
  "is null",
  "is not null",
  "is empty",
  "is not empty",
];

// SQL 接口的实例
const sql = reactive<SQL>({
  operator: [
    ["equal"],
    [
      "equal",
      "not equal",
      "in",
      "not in",
      "is null", // 省略第三个单选框
      "is not null", // 省略第三个单选框
    ],
    ["equal", "not equal"],
    [
      "equal",
      "not equal",
      "in",
      "not in",
      "begins with",
      "doesn't begin with",
      "contains",
      "doesn't contains",
      "ends with",
      "doesn't end with",
      "is empty",
      "is not empty",
      "is null",
      "is not null",
    ],
    [
      "equal",
      "not equal",
      "in",
      "not in",
      "less",
      "less or equal",
      "greater",
      "greater or equal",
      "between",
      "not between",
      "is null",
      "is not null",
    ],
  ],
});

const formRef = ref<FormInstance>();

const rules = reactive<FormRules<RuleInterface>>({
  column: [
    { required: true, message: "Please input Activity name", trigger: "blur" },
  ],
  logic: [
    { required: true, message: "Please input Activity name", trigger: "blur" },
  ],
  expect: [
    { required: true, message: "Please input Activity name", trigger: "blur" },
  ],
});

// 不知道为什么解决不了首次渲染不出来 el-option 数据的问题
// 一开始 Filter 的请求还没返回数据就传到 props 了, 但是 props 更新了 watch 却不触发
// let updatedColumn: { parentColumn: Column[] } = reactive({
//   parentColumn: [],
// });
// watch(
//   () => props.parentColumn,
//   (newValue, oldValue) => {
//     newValue.forEach((item) => {
//       console.log(item);
//       updatedColumn.parentColumn.push(item);
//     });
//     console.log(updatedColumn.parentColumn);
//   },
//   { immediate: true, deep: true }
// );
</script>

<style scoped>
.el-input {
  width: 20%;
}
.mr {
  margin-right: 15px;
}
</style>
