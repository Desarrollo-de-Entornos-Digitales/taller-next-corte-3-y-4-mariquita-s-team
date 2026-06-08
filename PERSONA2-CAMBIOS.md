# Persona 2 — feature/marketplaceApi

> **Base requerida:** mergear primero `feature/authFoundation` (P1).

## Archivos incluidos en este paquete

### API y utilidades
- `src/lib/api.ts`
- `src/lib/shipping-stages.ts`

### Store
- `src/stores/useCartStore.ts`

### Layout app + páginas comprador
- `src/app/(app)/layout.tsx`
- `src/app/(app)/page.tsx` *(feed / home)*
- `src/app/(app)/productos/[id]/page.tsx`
- `src/app/(app)/carrito/page.tsx`
- `src/app/(app)/favoritos/page.tsx`

### Shell y UI catálogo
- `src/components/AppShell.tsx`
- `src/components/ui/ProductCard.tsx`
- `src/components/ui/PanelCard.tsx`

## Archivo legacy eliminado
- `src/app/page.tsx` *(home movida a `(app)/page.tsx`)*

## Errores esperados hasta merge de P4
- `AppShell` importa `Navbar` y `Sidebar` con la API nueva (Persona 4).
- El `Footer` del repo base es la versión antigua; P4 lo actualiza.

## Qué desbloquea respecto a P1
- `useNotificationsStore` ya encuentra `lib/api`.
- `onboarding/profile` ya encuentra `updateUser` en `lib/api` (sigue faltando `RoleOptionCard` de P4).

## URLs tras este cambio
- `/` — feed de productos
- `/productos/[id]` — detalle
- `/carrito` — carrito
- `/favoritos` — favoritos

## Subir cambios

```powershell
cd Front2/taller-next-corte-3-y-4-mariquita-s-team
git add .
git commit -m "feat: marketplace API, catalog pages and cart"
git push -u origin feature/marketplaceApi
```
