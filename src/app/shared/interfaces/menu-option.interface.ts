export interface IMenuOption {
  title?: string;
  value?: any;
  template?: string;
  actionFn?: (data?: any) => void;
  mapping?: (value: string, map: Map<any, any>) => Map<any, any>;
  selected?: boolean;
}
