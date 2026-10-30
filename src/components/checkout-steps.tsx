const STEPS = ["Cart", "Shipping", "Payment", "Done"] as const;

export function CheckoutSteps({ current }: { current: (typeof STEPS)[number] }) {
  const active = STEPS.indexOf(current);
  return (
    <ol className="flex items-center gap-2 text-sm" aria-label="Checkout progress" data-testid="checkout-steps">
      {STEPS.map((step, i) => (
        <li key={step} className="flex items-center gap-2">
          <span
            aria-current={i === active ? "step" : undefined}
            className={`rounded-full px-3 py-1 ${
              i === active
                ? "bg-brand-600 text-white"
                : i < active
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-700/30 dark:text-brand-100"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
            }`}
          >
            {step}
          </span>
          {i < STEPS.length - 1 && <span className="text-zinc-300">→</span>}
        </li>
      ))}
    </ol>
  );
}
