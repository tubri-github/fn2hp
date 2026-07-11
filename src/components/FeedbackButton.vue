<template>
  <!-- Global "report an issue" channel: a floating button that opens the
       feedback Google Form in an on-site modal (with a new-tab fallback). -->
  <div class="feedback">
    <button class="feedback-fab" type="button" @click="open = true" aria-label="Report an issue">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="currentColor" d="M12 2a9 9 0 0 0-9 9c0 1.6.42 3.1 1.15 4.4L3 21l5.7-1.13A9 9 0 1 0 12 2Zm-1 6h2v5h-2V8Zm0 7h2v2h-2v-2Z"/>
      </svg>
      <span>Feedback</span>
    </button>

    <teleport to="body">
      <div v-if="open" class="feedback-overlay" @click.self="open = false">
        <div class="feedback-modal" role="dialog" aria-modal="true" aria-label="Report an issue">
          <header class="feedback-head">
            <h3>Report an issue / Feedback</h3>
            <div class="feedback-actions">
              <a :href="formUrl" target="_blank" rel="noopener" class="feedback-newtab">Open in new tab ↗</a>
              <button class="feedback-close" type="button" @click="open = false" aria-label="Close">✕</button>
            </div>
          </header>
          <iframe :src="embedUrl" class="feedback-frame" title="Feedback form">Loading…</iframe>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
export default {
  name: 'FeedbackButton',
  data() {
    return {
      open: false,
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLScNjShTTbuFJvQuyZ1zEo1wDTyZcoG7VFBAyP8fExFuKP5rQw/viewform',
    };
  },
  computed: {
    embedUrl() {
      return `${this.formUrl}?embedded=true`;
    },
  },
  watch: {
    open(val) {
      // Close on Esc while the modal is open.
      if (val) document.addEventListener('keydown', this.onKey);
      else document.removeEventListener('keydown', this.onKey);
    },
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKey);
  },
  methods: {
    onKey(e) {
      if (e.key === 'Escape') this.open = false;
    },
  },
};
</script>

<style scoped>
.feedback-fab {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 1200;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 16px;
  border: none;
  border-radius: 999px;
  background: #0056b3;
  color: #fff;
  font: 600 14px/1 "Inter", system-ui, sans-serif;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 86, 179, 0.35);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}
.feedback-fab:hover {
  background: #00459a;
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 86, 179, 0.42);
}

.feedback-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 30, 55, 0.55);
  backdrop-filter: blur(2px);
}
.feedback-modal {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 660px;
  height: min(86vh, 820px);
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
}
.feedback-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  background: #0056b3;
  color: #fff;
}
.feedback-head h3 {
  margin: 0;
  font: 600 15px/1.2 "Inter", system-ui, sans-serif;
}
.feedback-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}
.feedback-newtab {
  color: #dceafe;
  font-size: 13px;
  text-decoration: none;
  white-space: nowrap;
}
.feedback-newtab:hover {
  color: #fff;
  text-decoration: underline;
}
.feedback-close {
  border: none;
  background: transparent;
  color: #fff;
  font-size: 17px;
  line-height: 1;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
}
.feedback-close:hover {
  background: rgba(255, 255, 255, 0.18);
}
.feedback-frame {
  flex: 1;
  width: 100%;
  border: none;
  background: #f6f8fb;
}

@media (max-width: 640px) {
  .feedback-fab span { display: none; }
  .feedback-fab { padding: 12px; }
}
</style>