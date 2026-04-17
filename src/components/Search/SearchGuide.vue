<template>
  <!-- Inline mode: renders directly on page -->
  <div v-if="mode === 'inline'" class="guide-content guide-inline">
    <h2 class="guide-inline-title">Search Guide</h2>

    <!-- Table of Contents -->
    <nav class="guide-toc">
      <span class="toc-label">Jump to:</span>
      <a @click="scrollTo('simple')">Simple Search</a>
      <a @click="scrollTo('advanced')">Advanced Search</a>
      <a @click="scrollTo('operators')">Operators</a>
    </nav>

    <!-- 1. Simple Search -->
    <section id="guide-simple" class="guide-section">
      <h3>Simple Search</h3>
      <p>
        Type any keyword into the search box and press <kbd>Enter</kbd> or click the search button.
        The system searches across multiple fields including scientific names, family, genus,
        institution code, collection code, catalog number, country, state/province, and locality.
      </p>
      <div class="guide-example">
        <span class="example-label">Examples:</span>
        <code>Cyprinidae</code> <code>AMNH</code> <code>Brazil</code> <code>Enteromius</code>
      </div>
      <p>
        <strong>Wildcard search:</strong> Use <code>*</code> to match any characters and <code>?</code> to match a single character.
      </p>
      <div class="guide-example">
        <span class="example-label">Examples:</span>
        <code>Cyprin*</code> matches Cyprinidae, Cypriniformes, etc.<br>
        <code>Sal?o</code> matches Salmo, Salvo, etc.
      </div>
      <p class="guide-note">
        Simple search uses a smart cascade strategy: it first tries exact matching; if too few results are found,
        it automatically enables fuzzy matching (tolerating minor spelling errors), and then phonetic matching
        (similar-sounding names) to help you find what you're looking for.
      </p>
    </section>

    <!-- 2. Advanced Search -->
    <section id="guide-advanced" class="guide-section">
      <h3>Advanced Search</h3>
      <p>
        Click <strong>Advanced</strong> below the search box to expand the condition builder.
        Advanced search lets you target specific fields with precise control.
      </p>
      <h4>Building Conditions</h4>
      <ol>
        <li>Click <strong>+ Add Condition</strong> to create a new search condition.</li>
        <li>Click the field button (e.g., "Select Field") to choose which field to search.</li>
        <li>Select an operator from the dropdown (see Operators section below).</li>
        <li>Enter your search value.</li>
        <li>Add more conditions as needed &mdash; multiple conditions are combined with <strong>AND</strong> logic.</li>
      </ol>
      <h4>OR Conditions</h4>
      <p>
        Within each condition row, click <strong>+ OR</strong> to add alternative values.
        For example: Family = "Cyprinidae" <strong>OR</strong> Family = "Cichlidae" will match records belonging to either family.
      </p>
      <div class="guide-example">
        <span class="example-label">Example query:</span><br>
        Family <em>contains</em> "Cyprinidae"<br>
        <strong>AND</strong> Country <em>contains</em> "United States"<br>
        <strong>AND</strong> YearCollected <em>&ge;</em> 1990
      </div>
    </section>

    <!-- 3. Operators -->
    <section id="guide-operators" class="guide-section">
      <h3>Operators</h3>
      <h4>Text Field Operators</h4>
      <table class="guide-table">
        <thead>
          <tr>
            <th>Operator</th>
            <th>Description</th>
            <th>Example</th>
            <th>Matches</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Contains</strong></td>
            <td>Matches if the field contains the keyword (tokenized, case-insensitive)</td>
            <td>Country contains "United"</td>
            <td>"United States", "United Kingdom"</td>
          </tr>
          <tr>
            <td><strong>Exact Match</strong></td>
            <td>The entire field value must exactly equal the input (case-sensitive)</td>
            <td>Family = "Cyprinidae"</td>
            <td>"Cyprinidae" only, not "cyprinidae"</td>
          </tr>
          <tr>
            <td><strong>Phrase Match</strong></td>
            <td>Words must appear together in order (case-insensitive)</td>
            <td>Locality phrase "Rio Negro"</td>
            <td>"...Rio Negro basin..." but not "Rio de Negro"</td>
          </tr>
          <tr>
            <td><strong>Starts With</strong></td>
            <td>Field value must begin with the input (case-insensitive)</td>
            <td>Family starts with "Cypr"</td>
            <td>"Cyprinidae", "Cyprinodontidae"</td>
          </tr>
          <tr>
            <td><strong>Wildcard</strong></td>
            <td>Pattern matching with <code>*</code> (any characters) and <code>?</code> (single character). If no wildcards are provided, <code>*value*</code> is used automatically</td>
            <td>Locality wildcard "Amazon"</td>
            <td>Any locality containing "Amazon"</td>
          </tr>
          <tr>
            <td><strong>Fuzzy</strong></td>
            <td>Tolerates spelling errors (edit distance). Best for correcting typos in known values</td>
            <td>Family fuzzy "Cypriniidae"</td>
            <td>"Cyprinidae" (1 letter difference)</td>
          </tr>
          <tr>
            <td><strong>Regex</strong></td>
            <td>Regular expression pattern matching (case-insensitive)</td>
            <td>Family regex "Cypr.*dae"</td>
            <td>"Cyprinidae", "Cyprinodontidae"</td>
          </tr>
          <tr>
            <td><strong>Not Equal</strong></td>
            <td>Excludes records where the field exactly equals the input</td>
            <td>InstitutionCode != "AMNH"</td>
            <td>All records except AMNH</td>
          </tr>
        </tbody>
      </table>

    </section>

    <!-- TODO: Numeric Field Operators, Filters, Geographic Filter, Results & Export, Search History, Tips -->
  </div>

  <!-- Dialog mode: renders in a modal -->
  <el-dialog
    v-else
    v-model="visible"
    title="Search Guide"
    width="720px"
    :close-on-click-modal="true"
    class="search-guide-dialog"
  >
    <div class="guide-content">
      <!-- Table of Contents -->
      <nav class="guide-toc">
        <span class="toc-label">Jump to:</span>
        <a @click="scrollTo('simple')">Simple Search</a>
        <a @click="scrollTo('advanced')">Advanced Search</a>
        <a @click="scrollTo('operators')">Operators</a>
      </nav>

      <!-- 1. Simple Search -->
      <section id="guide-simple" class="guide-section">
        <h3>Simple Search</h3>
        <p>
          Type any keyword into the search box and press <kbd>Enter</kbd> or click the search button.
          The system searches across multiple fields including scientific names, family, genus,
          institution code, collection code, catalog number, country, state/province, and locality.
        </p>
        <div class="guide-example">
          <span class="example-label">Examples:</span>
          <code>Cyprinidae</code> <code>AMNH</code> <code>Brazil</code> <code>Enteromius</code>
        </div>
        <p>
          <strong>Wildcard search:</strong> Use <code>*</code> to match any characters and <code>?</code> to match a single character.
        </p>
        <div class="guide-example">
          <span class="example-label">Examples:</span>
          <code>Cyprin*</code> matches Cyprinidae, Cypriniformes, etc.<br>
          <code>Sal?o</code> matches Salmo, Salvo, etc.
        </div>
        <p class="guide-note">
          Simple search uses a smart cascade strategy: it first tries exact matching; if too few results are found,
          it automatically enables fuzzy matching (tolerating minor spelling errors), and then phonetic matching
          (similar-sounding names) to help you find what you're looking for.
        </p>
      </section>

      <!-- 2. Advanced Search -->
      <section id="guide-advanced" class="guide-section">
        <h3>Advanced Search</h3>
        <p>
          Click <strong>Advanced</strong> below the search box to expand the condition builder.
          Advanced search lets you target specific fields with precise control.
        </p>
        <h4>Building Conditions</h4>
        <ol>
          <li>Click <strong>+ Add Condition</strong> to create a new search condition.</li>
          <li>Click the field button (e.g., "Select Field") to choose which field to search.</li>
          <li>Select an operator from the dropdown (see Operators section below).</li>
          <li>Enter your search value.</li>
          <li>Add more conditions as needed &mdash; multiple conditions are combined with <strong>AND</strong> logic.</li>
        </ol>
        <h4>OR Conditions</h4>
        <p>
          Within each condition row, click <strong>+ OR</strong> to add alternative values.
          For example: Family = "Cyprinidae" <strong>OR</strong> Family = "Cichlidae" will match records belonging to either family.
        </p>
        <div class="guide-example">
          <span class="example-label">Example query:</span><br>
          Family <em>contains</em> "Cyprinidae"<br>
          <strong>AND</strong> Country <em>contains</em> "United States"<br>
          <strong>AND</strong> YearCollected <em>&ge;</em> 1990
        </div>
      </section>

      <!-- 3. Operators -->
      <section id="guide-operators" class="guide-section">
        <h3>Operators</h3>
        <h4>Text Field Operators</h4>
        <table class="guide-table">
          <thead>
            <tr>
              <th>Operator</th>
              <th>Description</th>
              <th>Example</th>
              <th>Matches</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Contains</strong></td>
              <td>Matches if the field contains the keyword (tokenized, case-insensitive)</td>
              <td>Country contains "United"</td>
              <td>"United States", "United Kingdom"</td>
            </tr>
            <tr>
              <td><strong>Exact Match</strong></td>
              <td>The entire field value must exactly equal the input (case-sensitive)</td>
              <td>Family = "Cyprinidae"</td>
              <td>"Cyprinidae" only, not "cyprinidae"</td>
            </tr>
            <tr>
              <td><strong>Phrase Match</strong></td>
              <td>Words must appear together in order (case-insensitive)</td>
              <td>Locality phrase "Rio Negro"</td>
              <td>"...Rio Negro basin..." but not "Rio de Negro"</td>
            </tr>
            <tr>
              <td><strong>Starts With</strong></td>
              <td>Field value must begin with the input (case-insensitive)</td>
              <td>Family starts with "Cypr"</td>
              <td>"Cyprinidae", "Cyprinodontidae"</td>
            </tr>
            <tr>
              <td><strong>Wildcard</strong></td>
              <td>Pattern matching with <code>*</code> (any characters) and <code>?</code> (single character). If no wildcards are provided, <code>*value*</code> is used automatically</td>
              <td>Locality wildcard "Amazon"</td>
              <td>Any locality containing "Amazon"</td>
            </tr>
            <tr>
              <td><strong>Fuzzy</strong></td>
              <td>Tolerates spelling errors (edit distance). Best for correcting typos in known values</td>
              <td>Family fuzzy "Cypriniidae"</td>
              <td>"Cyprinidae" (1 letter difference)</td>
            </tr>
            <tr>
              <td><strong>Regex</strong></td>
              <td>Regular expression pattern matching (case-insensitive)</td>
              <td>Family regex "Cypr.*dae"</td>
              <td>"Cyprinidae", "Cyprinodontidae"</td>
            </tr>
            <tr>
              <td><strong>Not Equal</strong></td>
              <td>Excludes records where the field exactly equals the input</td>
              <td>InstitutionCode != "AMNH"</td>
              <td>All records except AMNH</td>
            </tr>
          </tbody>
        </table>

      </section>

      <!-- TODO: Numeric Field Operators, Filters, Geographic Filter, Results & Export, Search History, Tips -->
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'dialog' // 'dialog' or 'inline'
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  visible.value = val
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

function scrollTo(id) {
  const el = document.getElementById(`guide-${id}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
/* Inline mode styles */
.guide-inline {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 32px 40px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  max-height: none;
  overflow: visible;
}

.guide-inline-title {
  font-size: 22px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 20px 0;
  text-align: center;
}

.guide-inline .guide-toc {
  position: static;
}

/* Dialog mode content */
.guide-content:not(.guide-inline) {
  max-height: 65vh;
  overflow-y: auto;
}

.guide-content {
  padding: 0 8px;
  font-size: 14px;
  line-height: 1.7;
  color: #333;
}

/* Table of Contents */
.guide-toc {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  align-items: center;
  padding: 10px 14px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
  position: sticky;
  top: 0;
  z-index: 1;
}

.toc-label {
  color: #888;
  font-size: 13px;
}

.guide-toc a {
  color: #3498db;
  font-size: 13px;
  cursor: pointer;
  text-decoration: none;
}

.guide-toc a:hover {
  text-decoration: underline;
}

/* Sections */
.guide-section {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.guide-section:last-child {
  border-bottom: none;
}

.guide-section h3 {
  font-size: 17px;
  font-weight: 600;
  color: #222;
  margin: 0 0 10px 0;
}

.guide-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #444;
  margin: 14px 0 6px 0;
}

.guide-section p {
  margin: 6px 0;
}

.guide-section ol,
.guide-section ul {
  margin: 6px 0;
  padding-left: 20px;
}

.guide-section li {
  margin: 4px 0;
}

/* Examples */
.guide-example {
  background: #f8f9fa;
  padding: 10px 14px;
  margin: 10px 0;
  border-radius: 6px;
  font-size: 13px;
}

.example-label {
  color: #888;
  font-size: 12px;
  margin-right: 8px;
}

code {
  background: #e8f4fd;
  color: #2980b9;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
  font-family: 'SF Mono', Monaco, Consolas, monospace;
}

kbd {
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 3px;
  padding: 1px 6px;
  font-size: 12px;
  font-family: inherit;
  box-shadow: 0 1px 0 #bbb;
}

/* Note */
.guide-note {
  background: #fef9e7;
  padding: 10px 14px;
  margin: 10px 0;
  border-radius: 6px;
  font-size: 13px;
}

.guide-note ul {
  margin: 4px 0 0 0;
  padding-left: 18px;
}

/* Tables */
.guide-table {
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  font-size: 13px;
}

.guide-table th {
  background: #f8f9fa;
  text-align: left;
  padding: 8px 10px;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e0e0e0;
}

.guide-table td {
  padding: 7px 10px;
  border-bottom: 1px solid #f0f0f0;
  vertical-align: top;
}

.guide-table tr:hover td {
  background: #fafafa;
}

/* Tips */
.tips-list li {
  margin: 8px 0;
}
</style>