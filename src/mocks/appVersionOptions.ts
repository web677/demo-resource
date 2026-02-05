export interface IAppVersionOption {
  label: string;
  value: string;
}

const VERSION_POOL = [
  '4.0.0',
  '4.1.0',
  '4.2.0',
  '4.2.2',
  '4.2.4',
  '4.2.2-dsh',
  '4.2.4-dsh',
  '4.3.0',
  '4.3.4',
  '4.4.0',
  '4.4.1',
];

const buildOptions = (values: string[]): IAppVersionOption[] =>
  [...values]
    .slice()
    .sort((a, b) => (a === b ? 0 : a > b ? -1 : 1))
    .map((v) => ({ label: v, value: v }));

const VERSION_POOL_WITHOUT_441 = VERSION_POOL.filter((v) => v !== '4.4.1');

export const APP_VERSION_OPTIONS: Record<string, IAppVersionOption[]> = {
  AppAi: buildOptions(VERSION_POOL),
  AppMall: buildOptions(VERSION_POOL),
  AppCommerce: buildOptions(VERSION_POOL_WITHOUT_441),
  AppCustomer: buildOptions(VERSION_POOL_WITHOUT_441),
  AppMember: buildOptions(VERSION_POOL_WITHOUT_441),
  AppSpace: buildOptions([...VERSION_POOL_WITHOUT_441, '4.3.0-dsh']),
  AppCube: buildOptions(['4.4.1', '4.4.0', '4.3.4', '4.2.4']),
  AppApprove: buildOptions([...VERSION_POOL_WITHOUT_441, '4.3.0-dsh']),
  AppEnergy: buildOptions(VERSION_POOL),
  AppMeeting: buildOptions(VERSION_POOL_WITHOUT_441),
  AppOperation: buildOptions(VERSION_POOL_WITHOUT_441),
  AppParking: buildOptions(VERSION_POOL_WITHOUT_441),
};
