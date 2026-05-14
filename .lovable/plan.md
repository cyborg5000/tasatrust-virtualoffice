## Goal

Resolve every warning in the latest scan, including the shadcn UI library files we previously left untouched.

## Scope

### 1. Shadcn UI components — drop React 19 deprecated APIs

For each file below, remove `React.forwardRef(...)` wrappers and accept `ref` as a regular prop. Keep `displayName` assignments. Replace `React.useContext(X)` with `use(X)` where flagged.

- `src/components/ui/alert.tsx` — also fix `heading-has-content`: `AlertTitle` renders an empty `<h5>` when no children; ensure children are always required (tighten typing) — typical usage already passes children, just need to not allow rendering an empty heading. Add a runtime guard: render nothing if no children.
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/accordion.tsx`
- `src/components/ui/context-menu.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/drawer.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/form.tsx` (also `useContext` → `use` for `FormFieldContext` and `FormItemContext`)
- `src/components/ui/hover-card.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/input-otp.tsx` (also `useContext(OTPInputContext)` → `use(OTPInputContext)`)
- `src/components/ui/slider.tsx`
- `src/components/ui/switch.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/textarea.tsx`

### 2. Tailwind `size-N` shorthand

Collapse matching `w-N h-N` pairs flagged by the scanner in:

- `accordion.tsx` (1), `dialog.tsx` (1), `dropdown-menu.tsx` (4), `context-menu.tsx` (5), `slider.tsx` (1)

### 3. Edge functions — performance

- `supabase/functions/stripe-webhook/index.ts:96` — hoist `new Intl.NumberFormat(...)` at line 96 to module scope (cache by currency, same pattern as the other formatter already cached). Convert the `await` inside the `for…of` at line 652 to `Promise.all(items.map(...))` only if the iterations are independent; otherwise add a comment justifying the sequential ordering and keep as-is.
- `supabase/functions/reconcile-checkout-session/index.ts:32` — collapse `.map().filter()` into a single `reduce`/`for…of`. Line 427 sequential `await`: parallelize with `Promise.all` only if independent; otherwise leave with explanatory comment.

### 4. CartModal sequential awaits

- `src/components/services/CartModal.tsx:58` — review the `for…of await` loop. If items are independent, switch to `Promise.all(items.map(...))`. If ordering or fail-fast semantics matter, keep sequential and add a brief comment noting why.

## Technical notes

- React 19 `forwardRef` removal pattern:
  ```tsx
  // Before
  const X = React.forwardRef<ElRef, Props>(({ className, ...props }, ref) => (
    <Primitive ref={ref} className={cn(..., className)} {...props} />
  ));
  X.displayName = "X";

  // After
  const X = ({ className, ref, ...props }: Props & { ref?: React.Ref<ElRef> }) => (
    <Primitive ref={ref} className={cn(..., className)} {...props} />
  );
  X.displayName = "X";
  ```
  Use `React.ComponentRef<typeof Primitive>` (replacement for deprecated `ElementRef`) for the ref element type, and keep `React.ComponentPropsWithoutRef<typeof Primitive>` for props.

- For `alert.tsx` `heading-has-content`: change `AlertTitle` so it returns `null` when `children` is empty/undefined — this satisfies the rule without changing valid usage.

- For `form.tsx`, `import { use } from "react"` and replace both `React.useContext(...)` calls.

## Out of scope

- No behavior changes — purely refactors. No visual changes expected.
- Not refactoring sequential `await` loops where ordering or rollback semantics are intentional; those will be annotated instead.

## Verification

- TypeScript build must stay green (the harness runs it automatically).
- Manually re-check `/member/services` (cart modal), pricing dialogs, and any admin form/dialog to confirm no runtime regressions.
