declare module 'node-cron' {
  export type ScheduledTask = {
    start(): void;
    stop(): void;
    destroy(): void;
    running: boolean;
  };

  export function schedule(expression: string, func: () => void | Promise<void>, options?: { scheduled?: boolean; timezone?: string }): ScheduledTask;

  const _default: {
    schedule: typeof schedule;
  };

  export default _default;
}
