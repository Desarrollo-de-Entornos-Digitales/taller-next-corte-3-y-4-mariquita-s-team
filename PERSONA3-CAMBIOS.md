# Persona 3 — feature/checkoutE2E

> **Base requerida:** `dev` con P1 + P2 + P4 ya mergeadas.

## Archivos incluidos en este paquete

### Checkout y seguimiento
- `src/app/(app)/pago/simulado/SimulatedPaymentClient.tsx`
- `src/app/(app)/pago/simulado/page.tsx`
- `src/app/(app)/pedidos/[id]/seguimiento/OrderTrackingClient.tsx`
- `src/app/(app)/pedidos/[id]/seguimiento/page.tsx`

### Centro de ayuda
- `src/app/(app)/help/page.tsx`
- `src/app/(app)/help/buying/page.tsx`
- `src/app/(app)/help/selling/page.tsx`
- `src/app/(app)/help/getting-started/page.tsx`
- `src/app/(app)/help/contact/page.tsx`
- `src/components/help/HelpLayout.tsx`

### E2E
- `e2e/helpers.ts`
- `e2e/auth-flow.spec.ts`
- `e2e/auth-pages.spec.ts`
- `e2e/feed.spec.ts`
- `e2e/navigation.spec.ts`
- `e2e/seller-pages.spec.ts`
- `e2e/seller-product.spec.ts`
- `e2e/help.spec.ts`
- `playwright.config.ts`

### Config
- `package.json` — puerto dev 3003, scripts y devDependency de Playwright

## URLs nuevas
- `/pago/simulado` — checkout desde carrito
- `/pedidos/[id]/seguimiento` — tracking del pedido
- `/help` y subpáginas de ayuda

## Antes de subir (importante)

Verifica que los archivos queden en `src/...` y **no** en `src/src/...`:

```powershell
git status
```

## Subir cambios

```powershell
cd Front3/taller-next-corte-3-y-4-mariquita-s-team
npm install
git add .
git commit -m "feat: checkout flow, order tracking, help center and E2E tests"
git push -u origin feature/checkoutE2E
```

Luego abrir PR **`feature/checkoutE2E` → `dev`** y mergear (va último).
