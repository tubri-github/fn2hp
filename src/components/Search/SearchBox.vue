<template>
  <div class="search-box">
    <div class="search-input-wrapper">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search by species, family, institution..."
        class="search-input"
        @keyup.enter="onSimpleSearch"
      />
      <button class="search-btn" @click="onSimpleSearch">Search</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "SearchBox",
  props: {
    initialValue: {
      type: String,
      default: "",
    },
  },
  emits: ["simpleSearch"],
  data() {
    return {
      searchTerm: this.initialValue,
    };
  },
  watch: {
    initialValue(newVal) {
      this.searchTerm = newVal;
    },
  },
  methods: {
    onSimpleSearch() {
      this.$emit("simpleSearch", this.searchTerm);
    },
  },
};
</script>

<style scoped>
.search-box {
  /* No margin - parent handles spacing */
}

.search-input-wrapper {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.15s ease;
}

.search-input-wrapper:focus-within {
  border-color: #3498db;
}

.search-input {
  flex: 1;
  padding: 11px 14px;
  font-size: 14px;
  border: none;
  outline: none;
  background: #fafafa;
}

.search-input:focus {
  background: white;
}

.search-input::placeholder {
  color: #aaa;
}

.search-btn {
  padding: 11px 20px;
  background: #3498db;
  color: white;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.search-btn:hover {
  background: #2980b9;
}
</style>
