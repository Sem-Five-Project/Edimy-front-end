declare module 'input-otp' {
  import * as React from 'react';

  export const OTPInput: React.ForwardRefExoticComponent<any>;

  export const OTPInputContext: {
    Provider: React.ComponentType<any>;
    Consumer: React.ComponentType<any>;
    useContext?: () => any;
    // minimal shape used in project
    slots?: Array<{ char?: React.ReactNode; hasFakeCaret?: boolean; isActive?: boolean }>;
  } & React.Context<any>;

  export default OTPInput;
}
