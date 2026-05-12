import { createRouter, createWebHistory } from "vue-router";

// 登录选择页面
import LoginChoice from '@/views/LoginChoice.vue'

// 客户端页面
import Home from "@/views/client/Home.vue";
import Login from "@/views/client/Login.vue";
import Register from "@/views/client/Register.vue";
import Forget from "@/views/client/Forget.vue";
import Cart from "@/views/client/Cart.vue";
import ProductList from "@/views/client/ProductList.vue";
import Order from "@/views/client/Order.vue";
import Profile from "@/views/client/Profile.vue";
import Checkout from "@/views/client/Checkout.vue";
import Payment from "@/views/client/Payment.vue";

// 管理端页面
import AdminLogin from "@/views/admin/AdminLogin.vue";
import AdminRegister from "@/views/admin/AdminRegister.vue";
import AdminForget from "@/views/admin/AdminForget.vue";
import Dashboard from "@/views/admin/Dashboard.vue";
import ProductManage from "@/views/admin/ProductManage.vue";
import CategoryManage from "@/views/admin/CategoryManage.vue";
import OrderManage from "@/views/admin/OrderManage.vue";
import UserManage from "@/views/admin/UserManage.vue";
// 【关键】引入 AdminProfile
import AdminProfile from "@/views/admin/AdminProfile.vue";

const routes = [
/* ================= 纯净布局 (无导航栏/侧边栏) ================= */
  { path: "/choice", component: LoginChoice, meta: { layout: 'blank' } },
  { path: "/login", component: Login, meta: { layout: 'blank' } },
  { path: "/register", component: Register, meta: { layout: 'blank' } },
  { path: "/forget", component: Forget, meta: { layout: 'blank' } },
  
  { path: "/admin/login", component: AdminLogin, meta: { layout: 'blank' } },
  { path: "/admin/register", component: AdminRegister, meta: { layout: 'blank' } },
  { path: "/admin/forget", component: AdminForget, meta: { layout: 'blank' } },

  /* ================= 客户端布局 (Navbar + Footer) ================= */
  { path: "/", component: Home, meta: { layout: 'client' } },
  { path: "/cart", component: Cart, meta: { layout: 'client', requiresAuth: true } },
  { path: "/products", component: ProductList, meta: { layout: 'client' } },
  { path: "/orders", component: Order, meta: { layout: 'client', requiresAuth: true } },
  { path: "/profile", component: Profile, meta: { layout: 'client', requiresAuth: true } },
  { path: "/checkout", component: Checkout, meta: { layout: 'client', requiresAuth: true } },
  { path: "/payment", component: Payment, meta: { layout: 'client', requiresAuth: true } },

  /* ================= 管理员布局 (Sidebar) ================= */
  { path: "/admin/dashboard", component: Dashboard, meta: { layout: 'admin', requiresAuth: true } },
  { path: "/admin/product", component: ProductManage, meta: { layout: 'admin', requiresAuth: true } },
  { path: "/admin/category", component: CategoryManage, meta: { layout: 'admin', requiresAuth: true } },
  { path: "/admin/order", component: OrderManage, meta: { layout: 'admin', requiresAuth: true } },
  { path: "/admin/user", component: UserManage, meta: { layout: 'admin', requiresAuth: true } },
  
/* ================= 员工布局 ================= */
{
 path: '/employee',
 component: () => import('@/views/employee/EmployeeLayout.vue'), // 员工端专属极简布局
meta: { requiresAuth: true, role: 'employee' }, // 标记为员工权限
 children: [
 {
 path: 'dashboard',
 name: 'EmployeeDashboard',
 component: () => import('@/views/employee/Dashboard.vue'),
 meta: { title: '工作台' }
},
{
path: 'scan-verify',
 name: 'ScanVerify',
 component: () => import('@/views/employee/ScanVerify.vue'),
 meta: { title: '分拣核销' }
 }
 ]
 },

// 【关键】注册管理员个人中心路由
{ path: "/admin/profile", component: AdminProfile, meta: { layout: 'admin', requiresAuth: true } }
];

const router = createRouter({
 history: createWebHistory(),
    routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
const token = localStorage.getItem('token');
if (to.meta.requiresAuth && !token) {
 if (to.path.startsWith('/admin')) {
 next('/admin/login');
} else {
 next('/login');
 }
 } else {
 next();
 }
});

export default router;

