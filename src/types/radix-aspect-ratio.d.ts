declare module '@radix-ui/react-aspect-ratio' {
  import * as React from 'react';

  export const Root: React.ComponentType<React.HTMLAttributes<HTMLElement> & { ratio?: number }>;
  export type AspectRatioProps = React.ComponentProps<typeof Root>;
  export default { Root } as unknown;
}
