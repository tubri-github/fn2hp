import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../components/HomePage.vue"; // 引入页面组件
import BrowseView from "../components/BrowseNew/BrowseView.vue";

const routes = [
    {
        path: "/",
        name: "Home",
        component: HomePage, // 首页组件
    },
    {
        path: '/browse/:type',
        name: 'Browse',
        component: BrowseView
    }
];

const router = createRouter({
    history: createWebHistory('/dist/'),
    routes,
});

export default router;
