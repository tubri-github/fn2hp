import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../components/HomePage.vue"; // 引入页面组件

const routes = [
    {
        path: "/",
        name: "Home",
        component: HomePage, // 首页组件
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
