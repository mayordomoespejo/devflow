export interface AdapterConfig {
  srcDir: string;
  destDir: string;
  keyFile: string;
}

export interface DoctorAdapterConfig {
  expected: string[];
}

export interface InstallItem {
  src: string;
  dest: string;
}

export interface CoreInspection {
  agentsMd: boolean;
  devflowMd: boolean;
  workflowsConfig: boolean;
  prompts: boolean;
  promptFiles: Record<string, boolean>;
  missing: string[];
  status: 'ok' | 'missing';
}

export interface AdapterInspection {
  present: boolean;
  missing: string[];
  expected: string[];
  status: 'ok' | 'partial' | 'absent';
}

export interface Installation {
  core: CoreInspection;
  adapters: Record<string, AdapterInspection>;
  detectedAdapters: string[];
}

export interface DoctorIssue {
  id: string;
  severity: 'error' | 'warn';
  message: string;
  fix: string;
}

export interface PluginInspection {
  name: string;
  source: string;
  version: string;
  keyFile: string;
  status: 'ok' | 'missing';
}

export interface DoctorReport {
  version: string;
  target: string;
  core: CoreInspection;
  adapters: Record<string, AdapterInspection>;
  plugins: PluginInspection[];
  issues: DoctorIssue[];
  recommendations: string[];
}

export interface PluginManifest {
  name: string;
  version: string;
  description?: string;
  destDir?: string;   // defaults to .devflow/plugins/<name>
  keyFile?: string;   // defaults to <destDir>/README.md
}

export interface InstalledPlugin {
  name: string;
  source: string;      // original source: local path or npm package name
  version: string;
  destDir: string;
  keyFile: string;
}

export interface PluginsFile {
  plugins: InstalledPlugin[];
}

export interface ExplainReport {
  version: string;
  target: string;
  core: CoreInspection;
  adapters: Record<string, AdapterInspection>;
  workflows: string[];
  sources: string[];
  sourceOfCriteria: string;
  recommendations: string[];
}
