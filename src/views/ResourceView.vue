<script setup lang="ts">
const codeContent = `// resources.ts in AppCustomer (Sub-App)
export default {
  appId: 'AppCustomer',

  pageResources: [
    {
      capabilityKey: 'customer.list',
      routePath: '/customer/list',
      buttons: [
        { capabilityKey: 'customer.create' },
        { capabilityKey: 'customer.export' }
      ],
      dependencies: {
        backendServices: ['user-service'],
        frontendApps: []
      }
    },

    {
      capabilityKey: 'customer.detail',
      routePath: '/customer/detail',
      buttons: [
        { capabilityKey: 'customer.edit' }
      ],
      dependencies: {
        backendServices: ['user-service', 'order-service'],
        frontendApps: []
      }
    }
  ]
}`;
</script>
<template>
  <div class="h-full flex gap-4">
    <div class="w-1/2 border rounded bg-gray-900 text-gray-100 p-4 font-mono text-sm whitespace-pre overflow-auto leading-relaxed shadow-inner">
      {{ codeContent }}
    </div>
    <div class="w-1/2 p-6 bg-white rounded border shadow-sm">
      <h3 class="text-xl font-bold mb-6 text-blue-700 border-b pb-2">概念说明</h3>
      <ul class="space-y-6 text-base">
        <li class="flex items-start">
          <div class="bg-blue-100 p-2 rounded mr-4 mt-1">
             <span class="font-bold text-blue-600">1</span>
          </div>
          <div>
            <strong class="text-gray-800 text-lg block mb-1">这不是菜单</strong>
            <p class="text-gray-600">这是“能力声明”，是前端能力的源头。开发人员在代码中定义功能，而非在后台手动录入。</p>
          </div>
        </li>
        <li class="flex items-start">
          <div class="bg-purple-100 p-2 rounded mr-4 mt-1">
             <span class="font-bold text-purple-600">2</span>
          </div>
          <div>
            <strong class="text-gray-800 text-lg block mb-1">唯一来源</strong>
            <p class="text-gray-600">构建 Manifest 和能力目录的唯一依据。CI/CD 流程会自动提取此文件生成构建产物。</p>
          </div>
        </li>
        <li class="flex items-start">
          <div class="bg-green-100 p-2 rounded mr-4 mt-1">
             <span class="font-bold text-green-600">3</span>
          </div>
          <div>
            <strong class="text-gray-800 text-lg block mb-1">能力先于菜单存在</strong>
            <p class="text-gray-600">先有功能定义，再有菜单入口编排。菜单只是能力的“快捷方式”。</p>
          </div>
        </li>
        <li class="flex items-start">
          <div class="bg-orange-100 p-2 rounded mr-4 mt-1">
             <span class="font-bold text-orange-600">4</span>
          </div>
          <div>
            <strong class="text-gray-800 text-lg block mb-1">页面 ≠ 路由 ≠ 菜单</strong>
            <p class="text-gray-600">页面是资源实体，路由是访问路径，菜单是导航结构。三者解耦，灵活组合。</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
