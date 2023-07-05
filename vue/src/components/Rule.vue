<template>
  <el-card>
    <el-row>
      <el-col :span="18">
        
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
import { Column, RuleInterface } from "../view/Filter.vue";


interface Props {
  parentIndex: number;
  parentColumn: Column[];
}



interface SQL {
  operator: string[][];
}


const rule = reactive<RuleInterface>({
  column: "",
  logic: "",
  expect: [],
});


const props = defineProps<Props>();


const emits = defineEmits(["parentDeleteItem", "getChildRule"]);


const sync = () => {
  emits("getChildRule", rule, props.parentIndex);
};


const current = reactive<Column>({
  column: "",
  type: -1,
  data: [],
});


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


const blackList: string[] = [
  "is null",
  "is not null",
  "is empty",
  "is not empty",
];


const sql = reactive<SQL>({
  operator: [
    ["equal"],
    [
      "equal",
      "not equal",
      "in",
      "not in",
      "is null", 
      "is not null", 
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

















</script>

<style scoped>
.el-input {
  width: 20%;
}
.mr {
  margin-right: 15px;
}
</style>
