import type { ComponentPropsWithoutRef, ComponentRef, Ref } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

type AccordionItemProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & {
  ref?: Ref<ComponentRef<typeof AccordionPrimitive.Item>>;
};

const AccordionItem = ({ className, ref, ...props }: AccordionItemProps) => (
  <AccordionPrimitive.Item ref={ref} className={cn("border-b", className)} {...props} />
);
AccordionItem.displayName = "AccordionItem";

type AccordionTriggerProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
  ref?: Ref<ComponentRef<typeof AccordionPrimitive.Trigger>>;
};

const AccordionTrigger = ({ className, children, ref, ...props }: AccordionTriggerProps) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="size-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
);
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

type AccordionContentProps = ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & {
  ref?: Ref<ComponentRef<typeof AccordionPrimitive.Content>>;
};

const AccordionContent = ({ className, children, ref, ...props }: AccordionContentProps) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
);
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
