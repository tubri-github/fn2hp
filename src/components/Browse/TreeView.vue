<template>
  <el-tree
      :data="data"
      show-checkbox
      node-key="id"
      @check="handleCheck"
      :default-expand-all="true">
  </el-tree>
</template>

<script>
export default {
  props: {
    type: String, // 类型: species, countries, providers
    data: Array // 树形数据
  },
  methods: {
    handleCheck(checkedNodes) {
      const selected = checkedNodes.map(node => node.label);
      this.$emit('selectionChange', selected); // 触发父组件事件
    }
  }
};
</script>
