import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../components/HomePage.vue"; // 引入页面组件
import BrowsePage from "../components/Browse/BrowsePage.vue";

const routes = [
    {
        path: "/",
        name: "Home",
        component: HomePage, // 首页组件
    },
    {
        path: '/browse/:type',
        name: 'Browse',
        component: BrowsePage
    }
];

const router = createRouter({
    history: createWebHistory('/dist/'),
    routes,
});

export default router;
