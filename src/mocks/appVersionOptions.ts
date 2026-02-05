export interface IAppVersionOption {
  label: string;
  value: string;
}

const VERSION_POOL = [
  '4.0.0',
  '4.1.0',
  '4.2.0',
  '4.2.4',
  '4.2.4-dsh',
  '4.3.0',
  '4.3.4',
  '4.4.0',
];

const buildOptions = (values: string[]): IAppVersionOption[] =>
  [...values]
    .slice()
    .sort((a, b) => (a === b ? 0 : a > b ? -1 : 1))
    .map((v) => ({ label: v, value: v }));

export const APP_VERSION_OPTIONS: Record<string, IAppVersionOption[]> = {
  AppAi: buildOptions(VERSION_POOL),
  AppMall: buildOptions(VERSION_POOL),
  AppCommerce: buildOptions(VERSION_POOL),
};
