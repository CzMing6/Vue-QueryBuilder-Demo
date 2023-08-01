<template>
  <el-card class="box-card">
      <el-row>
        <el-col>
          <Group
            @parentDeleteItem=""
            @getChildRule="getChildRule"
            :parentIndex=-1
            :parentColumn="parentColumn"
          ></Group>
        </el-col>
      </el-row>
    <el-row>
      <el-button type="primary" @click="reSet">重置</el-button>
      <el-button
        type="primary"
        @click="
          dialog.sql = toSQL(shell.group);
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
import Group from '../components/Group.vue';
import axios from 'axios';
import { toSQL, toSQLStatement } from '../utils/common';


interface Table {
  data: any[];
  header: string[];
}


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


const parentColumn: Column[] = reactive([]);

queryColumn();


const shell: {group: GroupInterface} = {
  group: {
    isNot: false,
    operator: '',
    rules: [],
  }
};

const getChildRule = (rule: GroupInterface) => {
  shell.group = rule;
};


const reSet = () => {
  shell.group.isNot = false;
  shell.group.operator = '';

  
  
  
  shell.group.rules.splice(0, shell.group.rules.length);

  queryColumn();
  table.data.splice(0, table.data.length);
  table.header.splice(0, table.header.length);
};


const dialog = reactive<{ dialogVisible: boolean; sql: string }>({
  dialogVisible: false,
  sql: '',
});


const table = reactive<Table>({
  data: [],
  header: [],
});


const query = () => {
  table.data.splice(0, table.data.length);
  table.header.splice(0, table.header.length);
  const { statement, params } = toSQLStatement(shell.group);
  
  axios
    .post('/api/query', {
      statement: encodeURIComponent(statement),
      params: params,
    })
    .then((res) => {
      res.data.forEach((item: any) => {
        table.data.push(item);
      });
      
      Object.keys(table.data[0]).forEach((item: string) => {
        table.header.push(item);
      });
    })
    .catch((error) => {
      console.error(error);
    });
};
</script>

<script lang="ts">

export interface RuleInterface {
  column: string;
  logic: string;
  expect: (string | number)[];
}


export interface GroupInterface {
  isNot: boolean;
  operator: string;
  rules: (RuleInterface | GroupInterface)[];
}


export interface Column {
  column: string;
  type: number;
  data: (string | number)[];
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
