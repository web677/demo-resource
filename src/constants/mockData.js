export const APP_LIST = [
  { appName: 'AppCoreHub', description: '底座应用', version: '4.4.0', buildTime: '2024-01-10 09:00' },
  { appName: 'AppCustomer', description: '客户管理子应用', version: '4.2.4', buildTime: '2024-01-20 10:00' },
  { appName: 'AppMall', description: '商城子应用', version: '4.3.4', buildTime: '2024-01-19 15:30' },
  { appName: 'AppSpace', description: '空间管理子应用', version: '4.2.0', buildTime: '2024-01-21 09:15' },
  { appName: 'AppMember', description: '会员中心子应用', version: '4.2.4-dsh', buildTime: '2024-01-18 14:20' },
  { appName: 'AppPatrolManagement', description: '巡更管理子应用', version: '4.1.0', buildTime: '2024-01-22 11:45' },
  { appName: 'AppInvestment', description: '招商管理子应用', version: '4.0.0', buildTime: '2024-01-15 16:00' }
];

export const CAPABILITIES = [
  { key: 'customer.list', name: '客户列表', desc: '查询和管理客户信息', source: 'AppCustomer', type: 'Page', versions: '4.2.0,4.2.4,4.4.0', status: 'normal' },
  { key: 'customer.detail', name: '客户详情', desc: '查看客户详细资料', source: 'AppCustomer', type: 'Page', versions: '4.2.0', status: 'normal' },
  { key: 'customer.create', name: '新建客户', desc: '创建新客户', source: 'AppCustomer', type: 'Button', versions: '4.2.0,4.2.4,4.4.0', status: 'normal' },

  { key: 'mall.product.list', name: '商品列表', desc: '管理商城商品', source: 'AppMall', type: 'Page', versions: '4.3.4,4.4.0', status: 'normal' },
  { key: 'mall.order.list', name: '订单列表', desc: '查看所有订单', source: 'AppMall', type: 'Page', versions: '4.3.4,4.4.0', status: 'changed' },
  { key: 'mall.order.detail', name: '订单详情', desc: '查看订单详情', source: 'AppMall', type: 'Page', versions: '4.3.4,4.4.0', status: 'normal' },

  { key: 'space.room.list', name: '房间列表', desc: '空间资源列表', source: 'AppSpace', type: 'Page', versions: '4.2.0,4.3.0', status: 'normal' },
  { key: 'space.booking', name: '空间预订', desc: '预订会议室或工位', source: 'AppSpace', type: 'Page', versions: '4.2.0,4.3.0', status: 'new' },

  { key: 'member.profile', name: '会员档案', desc: '会员基础信息', source: 'AppMember', type: 'Page', versions: '4.2.4-dsh,4.3.0', status: 'deprecated' },
  { key: 'member.points', name: '积分管理', desc: '会员积分流水', source: 'AppMember', type: 'Page', versions: '4.2.4-dsh,4.3.0', status: 'normal' }
];

export const VERSIONS = [
  { value: '4.4.0', label: '4.4.0 (Current)' },
  { value: '4.3.4', label: '4.3.4 (2024-01-10)' },
  { value: '4.2.4-dsh', label: '4.2.4-dsh (2024-01-05)' },
  { value: '4.0.0', label: '4.0.0 (2023-12-25)' }
];

export const DEPENDENCY_MAP = {
  AppCustomer: [
    { id: 'AppCoreHub', category: 'frontend', type: 'Micro App', mode: 'Remote', status: 'Running', desc: '底座应用', version: '4.4.0' },
    { id: 'user-service', category: 'backend', type: 'RPC', mode: 'Auto-Start', status: 'Running', desc: '用户鉴权服务', version: '2.4.0' },
    { id: 'common-utils', category: 'frontend', type: 'NPM Package', mode: 'Static', status: 'Loaded', desc: '通用工具库', version: '4.0.5' }
  ],
  AppMall: [
    { id: 'AppCoreHub', category: 'frontend', type: 'Micro App', mode: 'Remote', status: 'Running', desc: '底座应用', version: '4.4.0' },
    { id: 'order-service', category: 'backend', type: 'RPC', mode: 'Auto-Start', status: 'Running', desc: '订单处理服务', version: '4.5.2' },
    { id: 'pay-service', category: 'backend', type: 'HTTP', mode: 'Manual', status: 'Stopped', desc: '支付网关模拟', version: '3.0.1' },
    { id: 'AppMember', category: 'frontend', type: 'Micro App', mode: 'Remote', status: 'Ready', desc: '会员信息依赖', version: '4.2.4-dsh' }
  ],
  AppSpace: [
    { id: 'AppCoreHub', category: 'frontend', type: 'Micro App', mode: 'Remote', status: 'Running', desc: '底座应用', version: '4.4.0' },
    { id: 'resource-service', category: 'backend', type: 'RPC', mode: 'Auto-Start', status: 'Running', desc: '资源调度服务', version: '2.0.0' },
    { id: 'map-sdk', category: 'frontend', type: 'CDN', mode: 'External', status: 'Loaded', desc: '地图渲染引擎', version: 'v3.0' }
  ],
  AppMember: [
    { id: 'AppCoreHub', category: 'frontend', type: 'Micro App', mode: 'Remote', status: 'Running', desc: '底座应用', version: '4.4.0' },
    { id: 'member-service', category: 'backend', type: 'RPC', mode: 'Auto-Start', status: 'Running', desc: '会员核心服务', version: '4.1.0' },
    { id: 'points-service', category: 'backend', type: 'HTTP', mode: 'Auto-Start', status: 'Running', desc: '积分结算系统', version: '2.1.0' },
    { id: 'wechat-sdk', category: 'frontend', type: 'CDN', mode: 'External', status: 'Loaded', desc: '微信JS-SDK', version: '1.6.0' }
  ],
  AppPatrolManagement: [
    { id: 'AppCoreHub', category: 'frontend', type: 'Micro App', mode: 'Remote', status: 'Running', desc: '底座应用', version: '4.4.0' },
    { id: 'patrol-service', category: 'backend', type: 'RPC', mode: 'Auto-Start', status: 'Running', desc: '巡更任务服务', version: '3.0.0' },
    { id: 'device-center', category: 'backend', type: 'RPC', mode: 'Auto-Start', status: 'Running', desc: '设备中心服务', version: '5.2.0' }
  ],
  AppInvestment: [
    { id: 'AppCoreHub', category: 'frontend', type: 'Micro App', mode: 'Remote', status: 'Running', desc: '底座应用', version: '4.4.0' },
    { id: 'investment-service', category: 'backend', type: 'RPC', mode: 'Auto-Start', status: 'Running', desc: '招商管理服务', version: '4.0.0' },
    { id: 'contract-service', category: 'backend', type: 'RPC', mode: 'Manual', status: 'Stopped', desc: '合同管理服务', version: '2.8.5' },
    { id: 'map-sdk', category: 'frontend', type: 'CDN', mode: 'External', status: 'Loaded', desc: '地图渲染引擎', version: 'v3.0' }
  ],
  'AppCoreHub': [
    { id: 'auth-service', category: 'backend', type: 'RPC', mode: 'Auto-Start', status: 'Running', desc: '统一认证中心', version: '6.0.0' },
    { id: 'msg-center', category: 'backend', type: 'HTTP', mode: 'Auto-Start', status: 'Running', desc: '消息中心', version: '3.5.0' },
    { id: 'common-utils', category: 'frontend', type: 'NPM Package', mode: 'Static', status: 'Loaded', desc: '通用工具库', version: '4.0.5' }
  ]
};

export const SNAPSHOT_DATA = {
  '4.4.0': [
    { key: 'customer.list', routePath: '/cust/list', type: 'Page', app: 'AppCustomer' },
    { key: 'mall.order.create', routePath: '/order/add', type: 'Page', app: 'AppMall' },
    { key: 'member.profile', routePath: '/member/profile', type: 'Page', app: 'AppMember' },
    { key: 'space.room.list', routePath: '/space/list', type: 'Page', app: 'AppSpace' }
  ],
  '4.2.0': [
    { key: 'customer.list', routePath: '/customer/list', type: 'Page', app: 'AppCustomer' },
    { key: 'customer.export', routePath: '-', type: 'Button', app: 'AppCustomer' },
    { key: 'mall.order.create', routePath: '/order/create', type: 'Page', app: 'AppMall' },
    { key: 'member.profile', routePath: '/member/profile', type: 'Page', app: 'AppMember' },
    { key: 'space.room.list', routePath: '/space/list', type: 'Page', app: 'AppSpace' }
  ],
  '4.0.0': [
    { key: 'customer.list', routePath: '/cust/list', type: 'Page', app: 'AppCustomer' },
    { key: 'mall.order.create', routePath: '/order/add', type: 'Page', app: 'AppMall' }
  ],
  '4.2.4-dsh': [
    { key: 'customer.list', routePath: '/customer/list', type: 'Page', app: 'AppCustomer' },
    { key: 'customer.export', routePath: '-', type: 'Button', app: 'AppCustomer' },
    { key: 'mall.order.create', routePath: '/order/create', type: 'Page', app: 'AppMall' },
    { key: 'space.room.list', routePath: '/space/list', type: 'Page', app: 'AppSpace' },
    { key: 'space.booking', routePath: '/space/booking', type: 'Page', app: 'AppSpace' }
  ]
};
