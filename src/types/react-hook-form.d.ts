declare module 'react-hook-form' {
  import * as React from 'react';

  export type FieldValues = Record<string, any>;

  export type FieldPath<T> = keyof T & string;

  export type ControllerProps<TFieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
    name: TName;
    control?: any;
    rules?: any;
    defaultValue?: any;
    render?: (props: any) => React.ReactElement | null;
  } & React.ComponentProps<any>;

  export const Controller: React.ComponentType<any>;

  export const FormProvider: React.ComponentType<any>;

  export function useFormContext(): any;

  export type ControllerRenderProps = any;
}
