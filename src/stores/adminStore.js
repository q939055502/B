// 引入必要的依赖
import { ref } from 'vue';
import { defineStore } from 'pinia';

// 临时定义tableheads
const tableheads = [];

// 报告管理仓库
export const useAdminStore = defineStore('admin', () => {
  // 定义表格数据和分页状态变量
  const roleList = ref([]); // 角色列表
  const rolePermissions = ref([]); // 角色权限列表

  const permissionList = ref([]); // 权限列表
  const userList = ref([]); // 用户列表
  const userListTotalCount = ref(0); // 总用户数

  return {
    roleList,
    rolePermissions,
    permissionList,
    userList,
    userListTotalCount,
    // // 添加Action方法来更新状态
    // setUserList: (users) => {
    //   userList.value = users;
    // },
    // setRoleList: (roles) => {
    //   roleList.value = roles;
    // },
    // setRolePermissions: (permissions) => {
    //   rolePermissions.value = permissions;
    // },
    // setPermissionList: (permissions) => {
    //   permissionList.value = permissions;
    // }
  };
});