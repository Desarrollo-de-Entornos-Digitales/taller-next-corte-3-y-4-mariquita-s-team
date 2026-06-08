# Persona 1 — feat/auth-foundation

## Archivos incluidos en este paquete

### Lib / hooks / stores
- `src/lib/auth.ts`
- `src/lib/types.ts`
- `src/lib/categories.ts`
- `src/hooks/useAuthSession.ts`
- `src/stores/useNotificationStore.ts`
- `src/stores/useNotificationsStore.ts`
- `src/stores/useSearchStore.ts`

### Layout y providers
- `src/app/layout.tsx`
- `src/components/providers/AppProviders.tsx`
- `src/components/NotificationToasts.tsx` *(dependencia mínima de AppProviders)*

### Rutas de auth (grupo `(auth)`)
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/registro/page.tsx`
- `src/app/(auth)/forgot-password/page.tsx`
- `src/app/(auth)/onboarding/profile/page.tsx`

### UI base
- `src/components/ui/AuthCard.tsx`
- `src/components/ui/TextField.tsx`
- `src/components/ui/PasswordField.tsx`
- `src/components/ui/AlertBanner.tsx`
- `src/components/ui/Button.tsx`

### Dependencia añadida
- `package.json` → `zustand`

## Rutas legacy eliminadas
- `src/app/login/page.tsx`
- `src/app/registro/page.tsx`
- `src/app/forgot-password/page.tsx`
- `src/app/onboarding/profile/page.tsx`

## Errores esperados hasta merge de otras personas
- `onboarding/profile` importa `lib/api` y `RoleOptionCard` (Persona 2 / UI vendedor).
- `useNotificationsStore` importa `lib/api` (Persona 2).

## URLs de auth tras este cambio
- `/login`
- `/registro`
- `/forgot-password`
- `/onboarding/profile`
