import { RuleInterface, GroupInterface, Column } from '../view/Filter.vue';


export const toSQL = (group: GroupInterface): string => {
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


export const toSQLStatement = (
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