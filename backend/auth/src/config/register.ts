export function registerAs<T extends object>(token: string | symbol, func: () => T | Promise<T>) {
  return {
    provide: token,
    useFactory: func,
  };
}
