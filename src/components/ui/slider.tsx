import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

import { cn } from '@/lib/utils';

type SliderProps = React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  trackClassName?: string;
  rangeClassName?: string;
  thumbClassName?: string;
};

const Slider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, SliderProps>(
  ({ className, trackClassName, rangeClassName, thumbClassName, ...props }, ref) => (
    <SliderPrimitive.Root ref={ref} className={cn('relative flex w-full touch-none select-none items-center', className)} {...props}>
      <SliderPrimitive.Track className={cn('relative h-2 w-full grow overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700', trackClassName)}>
        <SliderPrimitive.Range className={cn('absolute h-full bg-blue-600 dark:bg-blue-500', rangeClassName)} />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className={cn('block h-5 w-5 rounded-full border-2 border-blue-600 dark:border-blue-500 bg-white dark:bg-slate-900 ring-offset-background shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', thumbClassName)} />
    </SliderPrimitive.Root>
  )
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
