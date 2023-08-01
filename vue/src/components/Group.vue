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
          <el-button v-if="props.parentIndex != -1" type="danger" @click="emits('parentDeleteItem')"
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
import { RuleInterface, GroupInterface, Column } from '../view/Filter.vue';


interface Props {
  parentIndex: number;
  parentColumn: Column[];
}


const props = defineProps<Props>();


const emits = defineEmits(['parentDeleteItem', 'getChildRule']);


const group = reactive<GroupInterface>({
  isNot: false,
  operator: '',
  rules: [],
});


const addRule = () => {
  group.rules.push({
    column: '',
    logic: '',
    expect: [],
  });
  if (group.operator == '' && group.rules.length == 2) group.operator = 'AND';
  sync();
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
  if (group.operator == '' && group.rules.length == 2) group.operator = 'AND';
  sync();
};


const deleteItem = (index: number) => {
  group.rules.splice(index, 1);
  if (group.operator != '' && group.rules.length == 1) {
    group.operator = '';
  }
  sync();
};


const getChildRule = (rule: RuleInterface | GroupInterface, index: number) => {
  group.rules[index] = rule;
  sync();
};


const sync = () => {
  
  if(props.parentIndex == -1)
    emits('getChildRule', group);
  else {
    emits('getChildRule', group, props.parentIndex);
  }
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
