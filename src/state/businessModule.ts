import { computed, ref } from 'vue';

export interface IBusinessRow {
  id: string;
  name: string;
  moduleIds: string[];
}

export interface IModuleRow {
  id: string;
  name: string;
  menuKeys: string[];
}

interface IBusinessModuleState {
  businesses: IBusinessRow[];
  modules: IModuleRow[];
  activeBusinessId: string;
  activeModuleId: string;
}

const STORAGE_KEY = 'demo.businessModuleState.v3';
const LEGACY_STORAGE_KEYS = ['demo.businessModuleState.v1', 'demo.businessModuleState.v2', STORAGE_KEY] as const;

const createId = (prefix: string): string => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const buildDefaultState = (): IBusinessModuleState => {
  const defaultModules: IModuleRow[] = [
    {
      id: 'mod-basic',
      name: '基础服务',
      menuKeys: [
        'project:9742ed91-fbd0-43da-a30c-558f0c0d78e0',
        'project:c3b60e08-36c2-4913-9489-3a5d85060ef1',
        'app:AppAi:AIAI-BASE-0001-0000-000000000011',
      ],
    },
    {
      id: 'mod-ops',
      name: '运维服务',
      menuKeys: [
        'project:59a66eaa-5f7d-4b41-a4e5-d2aec6c5780b',
        'project:be6f75be-43ed-4a3c-994e-7f05566e2f02',
        'app:AppCommerce:COMM-ORDER-0001-0000-000000000011',
      ],
    },
    {
      id: 'mod-operation',
      name: '运营服务',
      menuKeys: [
        'project:b536dae8-91f7-475f-8ccd-a340c29ba7b2',
        'project:e7763717-dcc3-46d8-94c9-42c75c55c632',
        'app:AppMall:MALL-PROD-0001-0000-000000000011',
        'app:AppAi:AIAI-BOT-0001-0000-000000000011',
      ],
    },
  ];
  const defaultBusinesses: IBusinessRow[] = [
    { id: 'biz-ops', name: '运维业态', moduleIds: [defaultModules[0].id] },
    { id: 'biz-basic', name: '基础业态', moduleIds: [defaultModules[0].id, defaultModules[1].id] },
  ];
  return {
    businesses: defaultBusinesses,
    modules: defaultModules,
    activeBusinessId: defaultBusinesses[0]?.id ?? '',
    activeModuleId: defaultModules[0]?.id ?? '',
  };
};

const readStorage = (): IBusinessModuleState | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as IBusinessModuleState;
    if (!Array.isArray(parsed?.businesses) || !Array.isArray(parsed?.modules)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeStorage = (value: IBusinessModuleState): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    return;
  }
};

const state = ref<IBusinessModuleState>(
  typeof window === 'undefined' ? buildDefaultState() : (readStorage() ?? buildDefaultState()),
);

export const useBusinessModule = () => {
  const resetToDefault = (): void => {
    state.value = buildDefaultState();
    writeStorage(state.value);
  };

  const clearStorage = (): void => {
    if (typeof window === 'undefined') return;
    LEGACY_STORAGE_KEYS.forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch {
        return;
      }
    });
    resetToDefault();
  };

  const businesses = computed<IBusinessRow[]>({
    get: () => state.value.businesses,
    set: (value) => {
      state.value.businesses = value;
      writeStorage(state.value);
    },
  });

  const modules = computed<IModuleRow[]>({
    get: () => state.value.modules,
    set: (value) => {
      state.value.modules = value;
      writeStorage(state.value);
    },
  });

  const activeBusinessId = computed<string>({
    get: () => state.value.activeBusinessId,
    set: (id) => {
      state.value.activeBusinessId = id;
      writeStorage(state.value);
    },
  });

  const activeModuleId = computed<string>({
    get: () => state.value.activeModuleId,
    set: (id) => {
      state.value.activeModuleId = id;
      writeStorage(state.value);
    },
  });

  const activeBusiness = computed(() =>
    businesses.value.find((b) => b.id === activeBusinessId.value),
  );

  const activeModule = computed(() => modules.value.find((m) => m.id === activeModuleId.value));

  const normalizeActive = (): void => {
    if (!businesses.value.some((b) => b.id === activeBusinessId.value)) {
      activeBusinessId.value = businesses.value[0]?.id ?? '';
    }
    if (!modules.value.some((m) => m.id === activeModuleId.value)) {
      activeModuleId.value = modules.value[0]?.id ?? '';
    }
  };

  const createBusiness = (name: string): void => {
    const next: IBusinessRow = { id: createId('biz'), name: name.trim(), moduleIds: [] };
    businesses.value = [next, ...businesses.value];
    activeBusinessId.value = next.id;
  };

  const updateBusiness = (params: { id: string; name: string }): void => {
    businesses.value = businesses.value.map((b) =>
      b.id === params.id ? { ...b, name: params.name.trim() } : b,
    );
  };

  const removeBusiness = (id: string): void => {
    businesses.value = businesses.value.filter((b) => b.id !== id);
    if (activeBusinessId.value === id) activeBusinessId.value = businesses.value[0]?.id ?? '';
  };

  const setBusinessModules = (params: { businessId: string; moduleIds: string[] }): void => {
    const moduleIdSet = new Set(modules.value.map((m) => m.id));
    const filtered = params.moduleIds.filter((id) => moduleIdSet.has(id));
    businesses.value = businesses.value.map((b) =>
      b.id === params.businessId ? { ...b, moduleIds: filtered } : b,
    );
  };

  const createModule = (name: string): void => {
    const next: IModuleRow = { id: createId('mod'), name: name.trim(), menuKeys: [] };
    modules.value = [next, ...modules.value];
    activeModuleId.value = next.id;
  };

  const updateModule = (params: { id: string; name: string }): void => {
    modules.value = modules.value.map((m) =>
      m.id === params.id ? { ...m, name: params.name.trim() } : m,
    );
  };

  const removeModule = (id: string): void => {
    modules.value = modules.value.filter((m) => m.id !== id);
    businesses.value = businesses.value.map((b) => ({
      ...b,
      moduleIds: b.moduleIds.filter((mid) => mid !== id),
    }));
    if (activeModuleId.value === id) activeModuleId.value = modules.value[0]?.id ?? '';
  };

  const setModuleMenus = (params: { moduleId: string; menuKeys: string[] }): void => {
    const next = modules.value.map((m) =>
      m.id === params.moduleId ? { ...m, menuKeys: [...params.menuKeys] } : m,
    );
    modules.value = next;
  };

  return {
    activeBusiness,
    activeBusinessId,
    activeModule,
    activeModuleId,
    businesses,
    clearStorage,
    createBusiness,
    createModule,
    modules,
    normalizeActive,
    removeBusiness,
    removeModule,
    resetToDefault,
    setBusinessModules,
    setModuleMenus,
    updateBusiness,
    updateModule,
  };
};
