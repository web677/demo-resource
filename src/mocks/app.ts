// 仓库：nimbus-platform-business
const APP_PLATFORM = [
    {
        appName: "PlatformAdmin",
        route: "/admin",
        path: "admin",
        devServerPort: 8201,
    },
    {
        appName: "PlatformBusiness",
        route: "/business",
        path: "business",
        devServerPort: 8202,
    },
    {
        appName: "PlatformCorporate",
        route: "/corporate",
        path: "corporate",
        devServerPort: 8203,
    },
];

// 仓库：nimbus-apps-wujie
export const APP_WUJIE = [
    {
        appName: "AppCube",
        route: "/apps/app-cube",
        path: "app-cube",
        devServerPort: 8110,
    },
    {
        appName: "AppCommerce",
        route: "/apps/app-commerce",
        path: "app-commerce",
        devServerPort: 8102,
    },
    {
        appName: "AppCustomer",
        route: "/apps/app-customer",
        path: "app-customer",
        devServerPort: 8106,
    },
    {
        appName: "AppMall",
        route: "/apps/app-mall",
        path: "app-mall",
        devServerPort: 8101,
    },
    {
        appName: "AppMember",
        route: "/apps/app-member",
        path: "app-member",
        devServerPort: 8104,
    },
    {
        appName: "AppSpace",
        route: "/apps/app-space",
        path: "app-space",
        devServerPort: 8103,
    },
    {
        appName: "AppAi",
        route: "/apps/app-ai",
        path: "app-ai",
        devServerPort: 8123,
    },
];

// 仓库：nimbus-apps-v2
export const APP_V2 = [
    {
        appName: "AppApprove",
        route: "/apps/app-approve",
        path: "app-approve",
        devServerPort: 8302,
    },
    {
        appName: "AppEnergy",
        route: "/apps/app-energy",
        path: "app-energy",
        devServerPort: 8310,
    },
    {
        appName: "AppMeeting",
        route: "/apps/app-meeting",
        path: "app-meeting",
        devServerPort: 8316,
    },
    {
        appName: "AppOperation",
        route: "/apps/app-operation",
        path: "app-operation",
        devServerPort: 8317,
    },
    {
        appName: "AppParking",
        route: "/apps/app-parking",
        path: "app-parking",
        devServerPort: 8319,
    },
];

export const APP_CONFIG = [...APP_PLATFORM, ...APP_WUJIE, ...APP_V2];
