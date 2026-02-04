import { pluginWangEditor, pluginWindowMessage, pluginCssIgnore, pluginEventTarget, pluginBMap, plugins } from '@/hooks/use-hub';

// 仓库：nimbus-platform-business
const APP_PLATFORM = [
  { appName: 'PlatformAdmin', route: '/admin', path: 'admin', devServerPort: 8201, plugins: () => [...plugins, pluginWangEditor] },
  {
    appName: 'PlatformBusiness',
    route: '/business',
    path: 'business',
    devServerPort: 8202,
    plugins: () => [...plugins, pluginEventTarget, pluginWangEditor]
  },
  { appName: 'PlatformCorporate', route: '/corporate', path: 'corporate', devServerPort: 8203, plugins: () => [...plugins, pluginWangEditor] }
];

// 仓库：nimbus-apps-wujie
export const APP_WUJIE = [
  { appName: 'AppAutoControl', route: '/apps/app-autocontrol', path: 'app-autocontrol', devServerPort: 8111, plugins: () => plugins },
  { appName: 'AppCommerce', route: '/apps/app-commerce', path: 'app-commerce', devServerPort: 8102, plugins: () => plugins },
  { appName: 'AppCustomer', route: '/apps/app-customer', path: 'app-customer', devServerPort: 8106, plugins: () => plugins },
  { appName: 'AppEmergency', route: '/apps/app-emergency', path: 'app-emergency', devServerPort: 8108, plugins: () => plugins },
  { appName: 'AppInvestment', route: '/apps/app-investment', path: 'app-investment', devServerPort: 8105, plugins: () => [...plugins, pluginBMap] },
  { appName: 'AppMall', route: '/apps/app-mall', path: 'app-mall', devServerPort: 8101, plugins: () => [...plugins, pluginWangEditor] },
  { appName: 'AppMember', route: '/apps/app-member', path: 'app-member', devServerPort: 8104, plugins: () => [...plugins, pluginWangEditor] },
  { appName: 'AppPatrolManagement', route: '/apps/app-patrolmanagement', path: 'app-patrolmanagement', devServerPort: 8107, plugins: () => plugins },
  { appName: 'AppSpace', route: '/apps/app-space', path: 'app-space', devServerPort: 8103, plugins: () => [...plugins, pluginBMap] },
  { appName: 'AppCarbon', route: '/apps/app-carbon', path: 'app-carbon', devServerPort: 8109, plugins: () => [...plugins] },
  { appName: 'AppExhibit', route: '/apps/app-exhibit', path: 'app-exhibit', devServerPort: 8112, plugins: () => [...plugins, pluginWangEditor] },
  { appName: 'AppContract', route: '/apps/app-contract', path: 'app-contract', devServerPort: 8113, plugins: () => [...plugins] },
  {
    appName: 'AppEducation',
    route: '/apps/app-education',
    path: 'app-education',
    devServerPort: 8114,
    plugins: () => [...plugins, pluginWangEditor]
  },
  {
    appName: 'AppOnlineOrder',
    route: '/apps/app-online-order',
    path: 'app-online-order',
    devServerPort: 8115,
    plugins: () => [...plugins, pluginWangEditor]
  },
  { appName: 'AppOrderCenter', route: '/apps/app-order-center', path: 'app-order-center', devServerPort: 8116, plugins: () => [...plugins] },
  {
    appName: 'AppVolunteer',
    route: '/apps/app-volunteer',
    path: 'app-volunteer',
    devServerPort: 8117,
    plugins: () => [...plugins, pluginWangEditor]
  },
  { appName: 'AppTicketWindow', route: '/apps/app-ticket-window', path: 'app-ticket-window', devServerPort: 8118 },
  { appName: 'AppGate', route: '/apps/app-gate', path: 'app-gate', devServerPort: 8119 },
  {
    appName: 'AppPopularExhibition',
    route: '/apps/app-popular-exhibition',
    path: 'app-popular-exhibition',
    devServerPort: 8120,
    plugins: () => [...plugins, pluginWangEditor]
  },
  { appName: 'AppGuide', route: '/apps/app-guide', path: 'app-guide', devServerPort: 8121 },
  {
    appName: 'AppContent',
    route: '/apps/app-content',
    path: 'app-content',
    devServerPort: 8122,
    plugins: () => [...plugins, pluginWangEditor]
  },
  { appName: 'AppAi', route: '/apps/app-ai', path: 'app-ai', devServerPort: 8123, plugins: () => plugins },
  { appName: 'AppTeam', route: '/apps/app-team', path: 'app-team', devServerPort: 8124, plugins: () => plugins },
  {
    appName: 'AppIntellectualProperty',
    route: '/apps/app-intellectual-property',
    path: 'app-intellectual-property',
    devServerPort: 8125,
    plugins: () => plugins
  }
];

// 仓库：nimbus-apps-v2
export const APP_V2 = [
  { appName: 'AppAc', route: '/apps/app-ac', path: 'app-ac', devServerPort: 8301, plugins: () => plugins },
  { appName: 'AppApprove', route: '/apps/app-approve', path: 'app-approve', devServerPort: 8302, plugins: () => plugins },
  { appName: 'AppAsset', route: '/apps/app-asset', path: 'app-asset', devServerPort: 8303, plugins: () => plugins },
  { appName: 'AppCharging', route: '/apps/app-charging', path: 'app-charging', devServerPort: 8304, plugins: () => plugins },
  { appName: 'AppCleaning', route: '/apps/app-cleaning', path: 'app-cleaning', devServerPort: 8305, plugins: () => plugins },
  { appName: 'AppCmms', route: '/apps/app-cmms', path: 'app-cmms', devServerPort: 8306, plugins: () => plugins },
  { appName: 'AppCommonapp', route: '/apps/app-commonapp', path: 'app-commonapp', devServerPort: 8307, plugins: () => plugins },
  { appName: 'AppComplaint', route: '/apps/app-complaint', path: 'app-complaint', devServerPort: 8308, plugins: () => plugins },
  { appName: 'AppEas', route: '/apps/app-eas', path: 'app-eas', devServerPort: 8309, plugins: () => plugins },
  { appName: 'AppEnergy', route: '/apps/app-energy', path: 'app-energy', devServerPort: 8310, plugins: () => plugins },
  { appName: 'AppGuest', route: '/apps/app-guest', path: 'app-guest', devServerPort: 8311, plugins: () => plugins },
  { appName: 'AppHc', route: '/apps/app-hc', path: 'app-hc', devServerPort: 8312, plugins: () => plugins },
  { appName: 'AppHvac', route: '/apps/app-hvac', path: 'app-hvac', devServerPort: 8313, plugins: () => plugins },
  { appName: 'AppItops', route: '/apps/app-itops', path: 'app-itops', devServerPort: 8314, plugins: () => plugins },
  { appName: 'AppLgt', route: '/apps/app-lgt', path: 'app-lgt', devServerPort: 8315, plugins: () => plugins },
  { appName: 'AppMeeting', route: '/apps/app-meeting', path: 'app-meeting', devServerPort: 8316, plugins: () => [...plugins, pluginWangEditor] },
  { appName: 'AppOperation', route: '/apps/app-operation', path: 'app-operation', devServerPort: 8317, plugins: () => plugins },
  { appName: 'AppOutperson', route: '/apps/app-outperson', path: 'app-outperson', devServerPort: 8318, plugins: () => plugins },
  { appName: 'AppParking', route: '/apps/app-parking', path: 'app-parking', devServerPort: 8319, plugins: () => plugins },
  { appName: 'AppPatrol', route: '/apps/app-patrol', path: 'app-patrol', devServerPort: 8320, plugins: () => plugins },
  { appName: 'AppPds', route: '/apps/app-pds', path: 'app-pds', devServerPort: 8321, plugins: () => plugins },
  { appName: 'AppScheduling', route: '/apps/app-scheduling', path: 'app-scheduling', devServerPort: 8322, plugins: () => plugins },
  { appName: 'AppTaskCenter', route: '/apps/app-taskcenter', path: 'app-taskcenter', devServerPort: 8323, plugins: () => plugins },
  { appName: 'AppTspt', route: '/apps/app-tspt', path: 'app-tspt', devServerPort: 8324, plugins: () => plugins },
  { appName: 'AppVideo', route: '/apps/app-video', path: 'app-video', devServerPort: 8325, plugins: () => plugins },
  { appName: 'AppVisit', route: '/apps/app-visit', path: 'app-visit', devServerPort: 8326, plugins: () => plugins },
  { appName: 'AppWms', route: '/apps/app-wms', path: 'app-wms', devServerPort: 8327, plugins: () => plugins },
  { appName: 'AppCustomerflow', route: '/apps/app-customerflow', path: 'app-customerflow', devServerPort: 8328, plugins: () => plugins },
  { appName: 'AppElevator', route: '/apps/app-elevator', path: 'app-elevator', devServerPort: 8329, plugins: () => plugins },
  { appName: 'AppEnv', route: '/apps/app-env', path: 'app-env', devServerPort: 8330, plugins: () => plugins },
  { appName: 'AppFire', route: '/apps/app-fire', path: 'app-fire', devServerPort: 8331, plugins: () => plugins },
  { appName: 'AppLighting', route: '/apps/app-lighting', path: 'app-lighting', devServerPort: 8332, plugins: () => plugins },
  { appName: 'AppPems', route: '/apps/app-pems', path: 'app-pems', devServerPort: 8333, plugins: () => plugins },
  { appName: 'AppPpt', route: '/apps/app-ppt', path: 'app-ppt', devServerPort: 8334, plugins: () => plugins },
  { appName: 'AppWds', route: '/apps/app-wds', path: 'app-wds', devServerPort: 8335, plugins: () => plugins },
  { appName: 'AppAlarm', route: '/apps/app-alarm', path: 'app-alarm', devServerPort: 8336, plugins: () => plugins },
  { appName: 'AppDevice', route: '/apps/app-device', path: 'app-device', devServerPort: 8337, plugins: () => plugins },
  { appName: 'AppStatistics', route: '/apps/app-statistics', path: 'app-statistics', devServerPort: 8338, plugins: () => plugins },
  { appName: 'AppCmmsCenter', route: '/apps/app-cmms-center', path: 'app-cmms-center', devServerPort: 8339, plugins: () => plugins },
  { appName: 'AppLowsky', route: '/apps/app-lowsky', path: 'app-lowsky', devServerPort: 8340, plugins: () => plugins },
  { appName: 'AppAp', route: '/apps/app-ap', path: 'app-ap', devServerPort: 8341, plugins: () => plugins },
  { appName: 'AppAnnounce', route: '/apps/app-announce', path: 'app-announce', devServerPort: 8342, plugins: () => [...plugins, pluginWangEditor] },
  {
    appName: 'AppInfoFlash',
    route: '/apps/app-info-flash',
    path: 'app-info-flash',
    devServerPort: 8343,
    plugins: () => [...plugins, pluginWangEditor]
  },
  {
    appName: 'AppPolicyRelease',
    route: '/apps/app-policy-release',
    path: 'app-policy-release',
    devServerPort: 8344,
    plugins: () => [...plugins, pluginWangEditor]
  },
  { appName: 'AppActivity', route: '/apps/app-activity', path: 'app-activity', devServerPort: 8345, plugins: () => plugins },
  { appName: 'AppService', route: '/apps/app-service', path: 'app-service', devServerPort: 8346, plugins: () => plugins },
  { appName: 'AppMedicalgas', route: '/apps/app-medicalgas', path: 'app-medicalgas', devServerPort: 8347, plugins: () => plugins },
  { appName: 'AppPurewater', route: '/apps/app-purewater', path: 'app-purewater', devServerPort: 8348, plugins: () => plugins },
  { appName: 'AppAcidifiedwater', route: '/apps/app-acidifiedwater', path: 'app-acidifiedwater', devServerPort: 8349, plugins: () => plugins },
  { appName: 'AppMedicallogistics', route: '/apps/app-medicallogistics', path: 'app-medicallogistics', devServerPort: 8350, plugins: () => plugins },
  { appName: 'AppClassroom', route: '/apps/app-classroom', path: 'app-classroom', devServerPort: 8351, plugins: () => plugins }
];

export const APP_CONFIG = [...APP_PLATFORM, ...APP_WUJIE, ...APP_V2];
