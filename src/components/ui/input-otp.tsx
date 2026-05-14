import { use, type ComponentPropsWithoutRef, type ComponentRef, type Ref } from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";

import { cn } from "@/lib/utils";

type InputOTPProps = ComponentPropsWithoutRef<typeof OTPInput> & {
  ref?: Ref<ComponentRef<typeof OTPInput>>;
};

const InputOTP = ({ className, containerClassName, ref, ...props }: InputOTPProps) => (
  <OTPInput
    ref={ref}
    containerClassName={cn("flex items-center gap-2 has-[:disabled]:opacity-50", containerClassName)}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
);
InputOTP.displayName = "InputOTP";

type InputOTPGroupProps = ComponentPropsWithoutRef<"div"> & { ref?: Ref<HTMLDivElement> };

const InputOTPGroup = ({ className, ref, ...props }: InputOTPGroupProps) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
);
InputOTPGroup.displayName = "InputOTPGroup";

type InputOTPSlotProps = ComponentPropsWithoutRef<"div"> & {
  index: number;
  ref?: Ref<HTMLDivElement>;
};

const InputOTPSlot = ({ index, className, ref, ...props }: InputOTPSlotProps) => {
  const inputOTPContext = use(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md",
        isActive && "z-10 ring-2 ring-ring ring-offset-background",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink h-4 w-px bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
};
InputOTPSlot.displayName = "InputOTPSlot";

type InputOTPSeparatorProps = ComponentPropsWithoutRef<"div"> & { ref?: Ref<HTMLDivElement> };

const InputOTPSeparator = ({ ref, ...props }: InputOTPSeparatorProps) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
);
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
