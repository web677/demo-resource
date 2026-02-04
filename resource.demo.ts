import type { INimbusResourcesDefinition } from 'nimbus-core-sdk/manifest';

export const resources: INimbusResourcesDefinition = {
  app: {
    appId: 'app-ai',
    appName: 'AI 知识库',
    basePath: '/apps/app-ai/',
    wujieName: 'AppAi'
  },
  pages: [
    {
      capabilityKey: 'ai.knowledge.graph',
      title: '知识图谱',
      description: '知识图谱可视化与关系检索',
      routePath: '/ai/knowledge-graph',
      componentPath: '/src/views/KnowledgeGraphView.vue',
      actions: [{ actionKey: 'ai.knowledgeGraph.create' }, { actionKey: 'ai.knowledgeGraph.export' }]
    },
    {
      capabilityKey: 'ai.knowledge.library.manage',
      title: '知识库管理',
      description: '知识库维护、导入与同步',
      routePath: '/ai/knowledge-library',
      componentPath: '/src/views/KnowledgeLibraryManage.vue',
      actions: [{ actionKey: 'ai.knowledgeLibrary.import' }, { actionKey: 'ai.knowledgeLibrary.sync' }]
    },
    {
      capabilityKey: 'ai.question.library.manage',
      title: '题库管理',
      description: '题库维护、导入与同步',
      routePath: '/ai/question-library',
      componentPath: '/src/views/QuestionLibraryManage.vue',
      actions: [{ actionKey: 'ai.questionLibrary.import' }, { actionKey: 'ai.questionLibrary.sync' }]
    }
  ],
  dependencies: {
    frontendApps: [{ appId: 'core-hub', versionRange: '^3.0.0' }],
    backendServices: [{ serviceId: 'ai-service', versionRange: '^1.0.0' }]
  }
};
