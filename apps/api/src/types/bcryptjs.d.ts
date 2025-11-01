declare module 'bcryptjs' {
  export function compareSync(data: string | Buffer, encrypted: string): boolean;
  export function hashSync(data: string | Buffer, salt?: string | number): string;
}
