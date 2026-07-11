<template>
  <div class="advanced-search" ref="rootEl">
    <!-- Toggle Header -->
    <div class="advanced-toggle" @click="toggleExpanded">
      <span class="toggle-icon">
        <svg v-if="!expanded" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M9 18l6-6-6-6"/>
        </svg>
        <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M19 9l-7 7-7-7"/>
        </svg>
      </span>
      <span class="toggle-text">Advanced</span>
      <span v-if="conditions.length > 0" class="condition-count">{{ conditions.length }}</span>
    </div>

    <!-- Search Panel -->
    <div v-show="expanded" class="search-panel">
      <!-- Hint: clarify how advanced relates to the simple keyword search -->
      <div class="panel-hint">Advanced search replaces the simple keyword above.</div>

      <!-- Conditions List -->
      <div class="conditions-list">
        <div v-for="(condition, index) in conditions" :key="condition.id" class="condition-item">
          <!-- Main Condition Row -->
          <div class="condition-row">
            <button class="btn-remove" @click="removeCondition(index)" title="Remove">x</button>

            <button class="btn-field" @click="openPopup(index)">
              {{ condition.fieldLabel || "Select Field" }}
            </button>

            <select
              v-if="condition.showOperator"
              v-model="condition.operator"
              class="select-operator"
            >
              <option value="" disabled>Operator</option>
              <option
                v-for="op in condition.availableOperators"
                :key="typeof op === 'object' ? op.value : op"
                :value="typeof op === 'object' ? op.value : op"
              >
                {{ typeof op === 'object' ? op.label : op }}
              </option>
            </select>

            <input
              v-if="condition.inputComponent === 'el-input'"
              v-model="condition.value"
              :type="condition.componentProps?.type || 'text'"
              :placeholder="condition.componentProps?.placeholder || 'Enter value'"
              class="input-value"
            />

            <button class="btn-or" @click="addOrCondition(index)">+ OR</button>
          </div>

          <!-- OR Conditions -->
          <div
            v-for="(orCondition, orIndex) in condition.orConditions"
            :key="orCondition.id"
            class="condition-row or-row"
          >
            <span class="or-label">OR</span>

            <select
              v-if="condition.showOperator"
              v-model="orCondition.operator"
              class="select-operator"
            >
              <option value="" disabled>Operator</option>
              <option
                v-for="op in condition.availableOperators"
                :key="typeof op === 'object' ? op.value : op"
                :value="typeof op === 'object' ? op.value : op"
              >
                {{ typeof op === 'object' ? op.label : op }}
              </option>
            </select>

            <input
              v-if="condition.inputComponent === 'el-input'"
              v-model="orCondition.value"
              :type="condition.componentProps?.type || 'text'"
              :placeholder="condition.componentProps?.placeholder || 'Enter value'"
              class="input-value"
            />

            <button class="btn-remove-or" @click="removeOrCondition(index, orIndex)">x</button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="panel-actions">
        <button class="btn-add" @click="addEmptyCondition">+ Add Condition</button>
        <button class="btn-search" @click="emitSearch">Search</button>
      </div>

      <!-- Field Selection Popup -->
      <div v-show="popupVisible" class="field-popup">
        <div class="popup-header">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search fields..."
            class="popup-search"
          />
          <button class="btn-close" @click="closePopup">x</button>
        </div>

        <div class="field-groups">
          <div v-for="group in filteredFields" :key="group.label" class="field-group">
            <div class="group-label">{{ group.label }}</div>
            <div class="group-fields">
              <button
                v-for="field in group.children"
                :key="field.value"
                class="field-btn"
                :class="{ selected: isSelected(field.value) }"
                :title="field.dwc"
                @click="selectField(field)"
              >
                {{ field.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

export default {
  setup(_, { emit, expose }) {
    const rootEl = ref(null);
    const expanded = ref(false);
    const popupVisible = ref(false);
    const editingIndex = ref(null);
    const conditions = ref([]);
    const results = ref([]);
    const searchQuery = ref("");

    // Unique, monotonically increasing id for v-for :key. Date.now() collides
    // when two conditions are added in the same millisecond, which makes Vue
    // reuse nodes and removeCondition() delete the wrong row.
    let uidSeq = 0;
    const nextId = () => ++uidSeq;

    // `dwc` is the Darwin Core term for each field, shown as a tooltip so users
    // know which standard term they are querying.
    const groupedFields = ref([
      {
        label: "Taxonomic",
        children: [
          { label: "Scientific Name", value: "ScientificName", type: "text", dwc: "dwc:scientificName" },
          { label: "Genus", value: "Genus", type: "text", dwc: "dwc:genus" },
          { label: "Specific Epithet", value: "SpecificEpithet", type: "text", dwc: "dwc:specificEpithet" },
          { label: "Family", value: "Family", type: "text", dwc: "dwc:family" },
          { label: "Valid Name", value: "ValidName", type: "text", dwc: "dwc:acceptedScientificName" },
          { label: "Vernacular Name", value: "VernacularName", type: "text", dwc: "dwc:vernacularName" },
        ],
      },
      {
        label: "Occurrence",
        children: [
          { label: "Catalog Number", value: "CatalogNumber", type: "text", dwc: "dwc:catalogNumber" },
          { label: "Institution Code", value: "InstitutionCode", type: "text", dwc: "dwc:institutionCode" },
          { label: "Collection Code", value: "CollectionCode", type: "text", dwc: "dwc:collectionCode" },
          { label: "Individual Count", value: "IndividualCount", type: "number", dwc: "dwc:individualCount" },
          { label: "Preparation Type", value: "PreparationType", type: "text", dwc: "dwc:preparations" },
          { label: "Type Status", value: "TypeStatus", type: "text", dwc: "dwc:typeStatus" },
          { label: "Basis of Record", value: "BasisOfRecord", type: "text", dwc: "dwc:basisOfRecord" },
          { label: "Recorded By", value: "RecordedBy", type: "text", dwc: "dwc:recordedBy" },
          { label: "Year Collected", value: "YearCollected", type: "number", dwc: "dwc:year" },
          { label: "Sex", value: "Sex", type: "text", dwc: "dwc:sex" },
          { label: "Life Stage", value: "LifeStage", type: "text", dwc: "dwc:lifeStage" },
          { label: "Date Last Modified", value: "DateLastModified", type: "date", dwc: "dcterms:modified" },
          { label: "Remarks", value: "Remarks", type: "text", dwc: "dwc:occurrenceRemarks" },
        ],
      },
      {
        label: "Location",
        children: [
          { label: "Continent/Ocean", value: "ContinentOcean", type: "text", dwc: "dwc:continent" },
          { label: "Country", value: "Country", type: "text", dwc: "dwc:country" },
          { label: "State/Province", value: "StateProvince", type: "text", dwc: "dwc:stateProvince" },
          { label: "County", value: "County", type: "text", dwc: "dwc:county" },
          { label: "Municipality", value: "Municipality", type: "text", dwc: "dwc:municipality" },
          { label: "Water Body", value: "WaterBody", type: "text", dwc: "dwc:waterBody" },
          { label: "Habitat", value: "Habitat", type: "text", dwc: "dwc:habitat" },
          { label: "Island", value: "Island", type: "text", dwc: "dwc:island" },
          { label: "Island Group", value: "IslandGroup", type: "text", dwc: "dwc:islandGroup" },
          { label: "Locality", value: "Locality", type: "text", dwc: "dwc:locality" },
          { label: "Latitude", value: "Latitude", type: "number", dwc: "dwc:decimalLatitude" },
          { label: "Longitude", value: "Longitude", type: "number", dwc: "dwc:decimalLongitude" },
          { label: "Coordinate Uncertainty (m)", value: "CoordinateUncertaintyInMeters", type: "number", dwc: "dwc:coordinateUncertaintyInMeters" },
          { label: "Verbatim Elevation", value: "VerbatimElevation", type: "text", dwc: "dwc:verbatimElevation" },
          { label: "Verbatim Depth", value: "VerbatimDepth", type: "text", dwc: "dwc:verbatimDepth" },
        ],
      },
    ]);

    const operatorsMap = {
      number: [">", "<", ">=", "<=", "=", "!="],
      // Ordered by importance (everyday + intuitive first, power/technical last).
      // `contains` stays the default (set in selectField); this only orders the
      // dropdown so the operators most users need are at the top.
      text: [
        { value: "contains", label: "Contains" },
        { value: "=", label: "Exact Match" },
        { value: "prefix", label: "Starts With" },
        { value: "fuzzy", label: "Fuzzy" },
        { value: "phrase", label: "Phrase Match" },
        { value: "!=", label: "Not Equal" },
        { value: "wildcard", label: "Wildcard (*?)" },
        { value: "regexp", label: "Regex" },
      ],
      // date fields have no `.keyword`, so only range operators work (= / != would
      // hit a non-existent keyword sub-field). Values must be ISO yyyy-MM-dd.
      date: [
        { value: ">=", label: "On or after" },
        { value: "<=", label: "On or before" },
        { value: ">", label: "After" },
        { value: "<", label: "Before" },
      ],
    };

    const inputComponentsMap = {
      text: { component: "el-input", props: { placeholder: "Enter text" } },
      number: { component: "el-input", props: { type: "number", placeholder: "Enter number" } },
      // Reuse the native <input> render path with type=date — a raw date picker
      // emits ISO yyyy-MM-dd, which the ES date field parses correctly (a bare
      // yyyyMMdd string gets mis-read as epoch millis). The old "el-date-picker"
      // value was never rendered (template only renders inputComponent==='el-input').
      date: { component: "el-input", props: { type: "date", placeholder: "Select date" } },
    };

    const toggleExpanded = () => {
      expanded.value = !expanded.value;
    };

    const openPopup = (index) => {
      editingIndex.value = index;
      popupVisible.value = true;
    };

    const closePopup = () => {
      popupVisible.value = false;
      editingIndex.value = null;
    };

    const selectField = (field) => {
      const condition = conditions.value[editingIndex.value];
      const fieldType = field.type;

      condition.field = field.value;
      condition.fieldLabel = field.label;
      condition.fieldType = fieldType;
      condition.showOperator = fieldType === "number" || fieldType === "text" || fieldType === "date";
      condition.availableOperators = operatorsMap[fieldType] || [];

      if (fieldType === "text") {
        condition.operator = "contains";
      } else if (fieldType === "number") {
        condition.operator = "=";
      } else if (fieldType === "date") {
        condition.operator = ">=";
      }

      condition.inputComponent = inputComponentsMap[fieldType]?.component || "el-input";
      condition.componentProps = { ...inputComponentsMap[fieldType]?.props };

      closePopup();
    };

    const addEmptyCondition = () => {
      conditions.value.push({
        id: nextId(),
        field: "",
        fieldLabel: "",
        operator: "",
        value: "",
        orConditions: [],
        showOperator: false,
        availableOperators: [],
        inputComponent: "el-input",
        componentProps: {},
      });
    };

    const addOrCondition = (index) => {
      const condition = conditions.value[index];
      condition.orConditions.push({
        id: nextId(),
        operator: condition.operator || "",
        value: "",
      });
    };

    const removeOrCondition = (conditionIndex, orIndex) => {
      conditions.value[conditionIndex].orConditions.splice(orIndex, 1);
    };

    const removeCondition = (index) => {
      conditions.value.splice(index, 1);
    };

    const filteredFields = computed(() => {
      if (!searchQuery.value) return groupedFields.value;
      return groupedFields.value.map((group) => ({
        ...group,
        children: group.children.filter((field) =>
          field.label.toLowerCase().includes(searchQuery.value.toLowerCase())
        ),
      })).filter(group => group.children.length > 0);
    });

    const isSelected = (fieldValue) => {
      return conditions.value.some((condition) => condition.field === fieldValue);
    };

    const emitSearch = () => {
      emit("search", conditions.value);
      // Collapse the panel after searching so it doesn't stay open over the results.
      expanded.value = false;
      popupVisible.value = false;
    };

    // Reset all internal state. Called by the parent on "new search" / "clear all",
    // and when a simple search runs (advanced and simple are mutually exclusive).
    const clear = () => {
      conditions.value = [];
      expanded.value = false;
      popupVisible.value = false;
      editingIndex.value = null;
      searchQuery.value = "";
    };

    // Remove one condition and re-run the search with what's left. Called by the
    // parent's persistent conditions bar (issue #3) when a chip's × is clicked.
    const removeConditionAt = (index) => {
      conditions.value.splice(index, 1);
      emitSearch();
    };
    expose({ clear, removeConditionAt });

    // Collapse the panel when clicking anywhere outside it.
    const handleClickOutside = (e) => {
      if (!expanded.value) return;
      if (rootEl.value && !rootEl.value.contains(e.target)) {
        expanded.value = false;
        popupVisible.value = false;
      }
    };

    onMounted(() => document.addEventListener("mousedown", handleClickOutside));
    onBeforeUnmount(() => document.removeEventListener("mousedown", handleClickOutside));

    return {
      rootEl,
      expanded,
      popupVisible,
      editingIndex,
      groupedFields,
      searchQuery,
      conditions,
      results,
      toggleExpanded,
      openPopup,
      closePopup,
      selectField,
      addEmptyCondition,
      addOrCondition,
      removeCondition,
      removeOrCondition,
      filteredFields,
      isSelected,
      emitSearch,
    };
  },
};
</script>

<style scoped>
.advanced-search {
  /* Positioned relative to parent search-container */
}

.advanced-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.15s ease;
  border: none;
  background: transparent;
}

.advanced-toggle:hover {
  color: #3498db;
  background: #f5f9fc;
}

.toggle-icon {
  display: flex;
  align-items: center;
  color: #999;
}

.toggle-text {
  font-weight: 500;
}

.condition-count {
  background: #3498db;
  color: white;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 8px;
  font-weight: 500;
}

.search-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  padding: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  /* Must sit above the Analysis-view Leaflet map, whose panes/controls reach
     z-index 400–1000 in the same root stacking context. 100 let the map paint
     over this dropdown. 2000 matches Element Plus's popper range. */
  z-index: 2000;
}

.panel-hint {
  font-size: 11px;
  color: #999;
  margin-bottom: 10px;
}

.conditions-list {
  margin-bottom: 12px;
}

.condition-item {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.condition-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.condition-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.condition-row:last-child {
  margin-bottom: 0;
}

.or-row {
  padding-left: 32px;
}

.or-label {
  font-size: 11px;
  color: #999;
  font-weight: 600;
  text-transform: uppercase;
  width: 30px;
}

.btn-remove {
  width: 24px;
  height: 24px;
  border: none;
  background: #fee;
  color: #e74c3c;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #e74c3c;
  color: white;
}

.btn-remove-or {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #ccc;
  cursor: pointer;
  font-size: 12px;
}

.btn-remove-or:hover {
  color: #e74c3c;
}

.btn-field {
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  color: #333;
  font-size: 13px;
  cursor: pointer;
  min-width: 120px;
  text-align: left;
  transition: all 0.2s;
}

.btn-field:hover {
  border-color: #3498db;
  background: #f0f7ff;
}

.select-operator {
  padding: 8px 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  background: white;
  min-width: 100px;
  cursor: pointer;
}

.select-operator:focus {
  outline: none;
  border-color: #3498db;
}

.input-value {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  min-width: 0;
}

.input-value:focus {
  outline: none;
  border-color: #3498db;
}

.btn-or {
  padding: 6px 10px;
  background: transparent;
  border: 1px dashed #ccc;
  border-radius: 4px;
  color: #888;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.btn-or:hover {
  border-color: #27ae60;
  color: #27ae60;
  background: #f0fff4;
}

.panel-actions {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.btn-add {
  padding: 8px 16px;
  background: transparent;
  border: 1px dashed #ccc;
  border-radius: 4px;
  color: #666;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add:hover {
  border-color: #3498db;
  color: #3498db;
  background: #f0f7ff;
}

.btn-search {
  padding: 8px 24px;
  background: #3498db;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-search:hover {
  background: #2980b9;
}

/* Field Popup */
.field-popup {
  margin-top: 12px;
  padding: 16px;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.popup-header {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.popup-search {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
}

.popup-search:focus {
  outline: none;
  border-color: #3498db;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #999;
}

.btn-close:hover {
  background: #fee;
  border-color: #e74c3c;
  color: #e74c3c;
}

.field-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {

}

.group-label {
  font-size: 11px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.group-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.field-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.field-btn:hover {
  border-color: #3498db;
  color: #3498db;
}

.field-btn.selected {
  background: #3498db;
  border-color: #3498db;
  color: white;
}
</style>
