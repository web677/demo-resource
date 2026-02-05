import { computed, ref } from 'vue';
import { APP_OPTIONS, CONFIG_VERSIONS } from '../mocks/environmentData';
import { APP_VERSION_OPTIONS } from '../mocks/appVersionOptions';

export interface IConfigTableAppVersion {
  appId: string;
  version: string;
}

export interface IConfigTable {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  appVersions: IConfigTableAppVersion[];
}

interface IConfigTableState {
  activeConfigTableId: string;
  configTables: IConfigTable[];
}

const STORAGE_KEY = 'demo.configTableState.v2';

const ALPHABET_UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const createUppercaseId = (length: number): string => {
  const chars = Array.from({ length }, () => {
    const idx = Math.floor(Math.random() * ALPHABET_UPPERCASE.length);
    return ALPHABET_UPPERCASE[idx] ?? 'A';
  });
  return chars.join('');
};

const pad2 = (n: number): string => String(n).padStart(2, '0');

const nowString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};

const normalizeConfigTable = (table: IConfigTable): IConfigTable => {
  const appIds = APP_OPTIONS.map((a) => a.value);
  const existing = new Map<string, IConfigTableAppVersion>(
    table.appVersions.map((v) => [v.appId, v]),
  );

  const getDefaultVersionByAppId = (appId: string): string => {
    const options = APP_VERSION_OPTIONS[appId] ?? [];
    const first = options[0]?.value ?? '';
    return first.trim() ? first : '4.0.0';
  };

  const normalized: IConfigTableAppVersion[] = appIds.map((appId) => {
    const hit = existing.get(appId);
    const version = hit?.version?.trim() ?? '';
    return { appId, version: version ? version : getDefaultVersionByAppId(appId) };
  });

  const createdAt = table.createdAt || nowString();
  const updatedAt = table.updatedAt || createdAt;
  return {
    ...table,
    description: table.description ?? '',
    createdAt,
    updatedAt,
    appVersions: normalized,
  };
};

const buildDefaultState = (): IConfigTableState => {
  const configTables: IConfigTable[] = CONFIG_VERSIONS.map((v) =>
    normalizeConfigTable({
      id: createUppercaseId(16),
      name: v.name,
      description: v.description,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
      appVersions: v.dependencies.map((d) => ({ appId: d.appId, version: d.version })),
    }),
  );

  return {
    activeConfigTableId: configTables[0]?.id ?? '',
    configTables,
  };
};

const readStorage = (): IConfigTableState | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<IConfigTableState>;
    if (!parsed || !Array.isArray(parsed.configTables)) return null;
    const normalized = parsed.configTables.map((t) =>
      normalizeConfigTable({
        id: (t as any).id ?? '',
        name: (t as any).name ?? '',
        description: (t as any).description ?? '',
        createdAt: (t as any).createdAt ?? '',
        updatedAt: (t as any).updatedAt ?? '',
        appVersions: Array.isArray((t as any).appVersions) ? (t as any).appVersions : [],
      }),
    );
    const activeId = parsed.activeConfigTableId ?? normalized[0]?.id ?? '';
    return { activeConfigTableId: activeId, configTables: normalized };
  } catch {
    return null;
  }
};

const writeStorage = (value: IConfigTableState): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    return;
  }
};

const state = ref<IConfigTableState>(
  typeof window === 'undefined' ? buildDefaultState() : (readStorage() ?? buildDefaultState()),
);

export const useConfigTable = () => {
  const activeConfigTableId = computed<string>({
    get: () => state.value.activeConfigTableId,
    set: (id) => {
      state.value.activeConfigTableId = id;
      writeStorage(state.value);
    },
  });

  const configTables = computed<IConfigTable[]>({
    get: () => state.value.configTables,
    set: (tables) => {
      state.value.configTables = tables;
      writeStorage(state.value);
    },
  });

  const activeConfigTable = computed<IConfigTable | undefined>(() =>
    configTables.value.find((t) => t.id === activeConfigTableId.value),
  );

  const setActiveConfigTableId = (id: string): void => {
    if (configTables.value.some((t) => t.id === id)) {
      activeConfigTableId.value = id;
    }
  };

  const upsertConfigTable = (table: IConfigTable): void => {
    const existing = configTables.value.find((t) => t.id === table.id);
    const normalized = normalizeConfigTable({
      ...table,
      createdAt: existing?.createdAt ?? table.createdAt ?? nowString(),
      updatedAt: nowString(),
    });
    const next = [...configTables.value];
    const idx = next.findIndex((t) => t.id === normalized.id);
    if (idx >= 0) next[idx] = normalized;
    else next.unshift(normalized);
    configTables.value = next;
    if (!next.some((t) => t.id === activeConfigTableId.value)) {
      activeConfigTableId.value = next[0]?.id ?? normalized.id;
    }
  };

  const removeConfigTable = (id: string): void => {
    const next = configTables.value.filter((t) => t.id !== id);
    configTables.value = next;
    if (activeConfigTableId.value === id) {
      activeConfigTableId.value = next[0]?.id ?? '';
    }
  };

  const setAppVersion = (params: {
    configTableId: string;
    appId: string;
    version: string;
  }): void => {
    const next = configTables.value.map((t) => {
      if (t.id !== params.configTableId) return t;
      const appVersions = t.appVersions.map((v) =>
        v.appId === params.appId ? { ...v, version: params.version } : v,
      );
      return { ...t, appVersions, updatedAt: nowString() };
    });
    configTables.value = next;
  };

  const getVersionByAppId = (appId: string): string | undefined => {
    const table = activeConfigTable.value;
    const hit = table?.appVersions.find((v) => v.appId === appId);
    return hit?.version || undefined;
  };

  const normalizeAllConfigTables = (): void => {
    configTables.value = configTables.value.map((t) => normalizeConfigTable(t));
    if (!configTables.value.some((t) => t.id === activeConfigTableId.value)) {
      activeConfigTableId.value = configTables.value[0]?.id ?? '';
    }
  };

  return {
    activeConfigTableId,
    activeConfigTable,
    configTables,
    getVersionByAppId,
    normalizeAllConfigTables,
    removeConfigTable,
    setActiveConfigTableId,
    setAppVersion,
    upsertConfigTable,
  };
};
