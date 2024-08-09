export declare function getReport(pluginOptions: ReportingPluginOption): Promise<TrendingReport[]>;

export interface TrendingReport {
  readonly path: string;
  readonly value: number;
}

export interface ReportingPluginOption {
  readonly serviceAccountEmail: string | undefined;
  readonly privateKey: string | undefined;
  readonly property: string | undefined;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly metric?: string;
  readonly dimension?: string;
  readonly limit?: number;
  readonly desc?: boolean;
  readonly regexFilter?: string;
}
