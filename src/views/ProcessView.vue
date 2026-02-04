<script setup lang="ts">
</script>
<template>
  <div class="space-y-16 pb-12">
    <!-- Flow Chart 1 -->
    <div>
      <h3 class="font-bold text-xl mb-6 flex items-center">
        <span class="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
        从代码到上线的治理流程
      </h3>
      <div class="overflow-x-auto">
        <div class="min-w-[900px] border rounded-lg overflow-hidden shadow-sm">
          <!-- Headers -->
          <div class="grid grid-cols-4 bg-gray-100 border-b">
            <div class="p-3 text-center font-bold text-gray-700 border-r">开发 (Dev)</div>
            <div class="p-3 text-center font-bold text-gray-700 border-r">构建系统 (CI/CD)</div>
            <div class="p-3 text-center font-bold text-gray-700 border-r">治理后台 (Admin)</div>
            <div class="p-3 text-center font-bold text-gray-700">运行时 (Runtime)</div>
          </div>
          
          <!-- Swimlanes Content -->
          <div class="grid grid-cols-4 bg-white relative min-h-[400px]">
            <!-- Lane 1 -->
            <div class="border-r p-4 flex flex-col items-center space-y-8 pt-8">
              <div class="w-full bg-blue-50 border border-blue-200 p-3 rounded text-center shadow-sm">
                <div class="font-bold text-blue-800">1. 声明 Resource</div>
                <div class="text-xs text-blue-600 mt-1">resources.ts</div>
              </div>
            </div>
            
            <!-- Lane 2 -->
            <div class="border-r p-4 flex flex-col items-center space-y-8 pt-24">
              <div class="w-full bg-purple-50 border border-purple-200 p-3 rounded text-center shadow-sm">
                <div class="font-bold text-purple-800">2. 生成 Manifest</div>
                <div class="text-xs text-purple-600 mt-1">Build Artifact</div>
              </div>
              <div class="h-8 border-l-2 border-dashed border-gray-300"></div>
              <div class="w-full bg-purple-50 border border-purple-200 p-3 rounded text-center shadow-sm">
                <div class="font-bold text-purple-800">3. 生成Manifest到指定目录/上报 Manifest</div>
              </div>
            </div>
            
            <!-- Lane 3 -->
            <div class="border-r p-4 flex flex-col items-center space-y-4 pt-48">
               <div class="w-full bg-orange-50 border border-orange-200 p-3 rounded text-center shadow-sm">
                <div class="font-bold text-orange-800">4. 生成 Diff</div>
              </div>
              <div class="w-full bg-orange-50 border border-orange-200 p-3 rounded text-center shadow-sm">
                <div class="font-bold text-orange-800">5. 编辑能力目录</div>
              </div>
              <div class="w-full bg-orange-50 border border-orange-200 p-3 rounded text-center shadow-sm">
                <div class="font-bold text-orange-800">6. 权限配置</div>
              </div>
               <div class="w-full bg-orange-50 border border-orange-200 p-3 rounded text-center shadow-sm">
                <div class="font-bold text-orange-800">7. 菜单配置</div>
              </div>
            </div>
            
            <!-- Lane 4 -->
            <div class="p-4 flex flex-col items-center justify-end pb-8">
               <div class="w-full bg-green-50 border border-green-200 p-6 rounded text-center shadow-md">
                <div class="font-bold text-green-800 text-lg">8. 用户访问</div>
                <div class="text-sm text-green-600 mt-2">按能力加载子应用</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Flow Chart 2 -->
    <div>
      <h3 class="font-bold text-xl mb-6 flex items-center">
        <span class="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
        运行时路由与子应用加载关系
      </h3>
      <div class="bg-slate-900 text-white p-8 rounded-xl shadow-lg font-mono text-sm">
        <!-- Address Bar -->
        <div class="flex items-center mb-8">
          <div class="w-24 text-gray-400">Browser</div>
          <div class="flex-1 bg-slate-800 p-3 rounded flex items-center border border-slate-700">
            <span class="text-green-400 mr-2">https://portal.com</span>
            <span class="text-white">/app/crm/customer/list</span>
          </div>
        </div>

        <!-- Base App Logic -->
        <div class="ml-24 border-l-2 border-slate-700 pl-8 space-y-6 relative">
          <!-- Step 1 -->
          <div class="bg-slate-800 p-4 rounded border border-slate-700">
            <div class="text-blue-400 font-bold mb-2">1. Micro App Base (底座)</div>
            <div class="text-gray-300">解析路径: <span class="text-yellow-400">/app/crm/customer/list</span></div>
            <div class="text-gray-300">-> 匹配子应用: <span class="text-yellow-400">crm-customer</span></div>
          </div>

          <!-- Arrow -->
          <div class="text-center text-slate-500 text-xl">↓</div>

          <!-- Step 2 -->
          <div class="bg-slate-800 p-4 rounded border border-slate-700">
             <div class="text-purple-400 font-bold mb-2">2. Load Assets</div>
             <div class="text-gray-300">加载 manifest.json (v1.2.0)</div>
             <div class="text-gray-300">加载 main.js, style.css</div>
          </div>

           <!-- Arrow -->
          <div class="text-center text-slate-500 text-xl">↓</div>

           <!-- Step 3 -->
          <div class="bg-slate-800 p-4 rounded border border-slate-700">
             <div class="text-orange-400 font-bold mb-2">3. Mount & Render</div>
             <div class="text-gray-300">注册子应用路由表</div>
             <div class="text-gray-300">渲染页面组件: <span class="text-yellow-400">CustomerList</span></div>
          </div>
        </div>
      </div>
      <div class="mt-4 flex items-center text-gray-600 text-sm bg-gray-100 p-3 rounded">
        <span class="font-bold mr-2">Core Feature:</span>
        支持 URL 刷新直接恢复状态，完全不依赖点击行为，实现“书签级”微前端体验。
      </div>
    </div>
  </div>
</template>
