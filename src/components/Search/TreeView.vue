<template>
  <el-tree
    :data="treeData"
    :props="defaultProps"
    node-key="id"
    highlight-current
    @node-click="onNodeClick"
    :default-expanded-keys="expandedKeys"
  >
    <template #default="{ node }">
      <span class="tree-node">
        <span class="node-label">{{ node.label }}</span>
      </span>
    </template>
  </el-tree>
</template>

<script>
export default {
  name: "TreeView",
  props: {
    treeData: {
      type: Array,
      required: true,
    },
  },
  emits: ["nodeClick"],
  data() {
    return {
      defaultProps: {
        children: "children",
        label: "label",
      },
      expandedKeys: [],
    };
  },
  watch: {
    treeData: {
      handler(newTreeData) {
        this.expandedKeys = this.getAllNodeKeys(newTreeData);
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    onNodeClick(node) {
      this.$emit("nodeClick", { field: node.field, value: node.value });
    },
    getAllNodeKeys(tree) {
      const keys = [];
      const traverse = (nodes) => {
        nodes.forEach((node) => {
          if (node.children && node.children.length > 0) {
            keys.push(node.id);
            traverse(node.children);
          }
        });
      };
      traverse(tree);
      return keys;
    },
  },
};
</script>

<style scoped>
.tree-node {
  display: flex;
  align-items: center;
}

.node-label {
  color: #2c3e50;
}
</style>
