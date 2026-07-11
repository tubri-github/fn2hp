<template>
  <div id="app">
    <Header />
    <router-view :key="route.path" />
    <Footer />
    <FeedbackButton />
  </div>
</template>

<script>
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
import FeedbackButton from "./components/FeedbackButton.vue";
import { useRoute } from 'vue-router'

export default {
  components: {
    Header,
    Footer,
    FeedbackButton,
  },
  setup() {
    const route = useRoute()
    return {
      route
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400&display=swap');
/* 全局样式 */
body {
  margin: 0;
  font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
  background-color: #ffffff;
  color: #0056b3;
}
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
