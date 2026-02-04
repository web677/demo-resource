import { computed, ref } from 'vue';

export type IEnvironmentKey =
  | '21'
  | '60'
  | '40'
  | '70'
  | '独墅湖'
  | '太湖新城'
  | '市民中心'
  | '先导区'
  | '苏州科技馆'
  | '美术馆';

export interface IEnvironmentOption {
  label: string;
  value: IEnvironmentKey;
}

export const ENVIRONMENT_OPTIONS: IEnvironmentOption[] = [
  { label: '21', value: '21' },
  { label: '60', value: '60' },
  { label: '40', value: '40' },
  { label: '70', value: '70' },
  { label: '独墅湖', value: '独墅湖' },
  { label: '太湖新城', value: '太湖新城' },
  { label: '市民中心', value: '市民中心' },
  { label: '先导区', value: '先导区' },
  { label: '苏州科技馆', value: '苏州科技馆' },
  { label: '美术馆', value: '美术馆' },
];

const environment = ref<IEnvironmentKey>('21');

export const useEnvironment = () => {
  const environmentLabel = computed(() => environment.value);

  const setEnvironment = (value: IEnvironmentKey) => {
    environment.value = value;
  };

  return { environment, environmentLabel, setEnvironment };
};
