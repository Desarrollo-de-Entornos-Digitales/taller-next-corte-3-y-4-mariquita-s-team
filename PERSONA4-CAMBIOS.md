# Persona 4 — feature/appShellSeller

> **Base requerida:** mergear primero `feature/authFoundation` (P1).  
> Recomendado mergear también `feature/marketplaceApi` (P2) para que perfil, mensajes y vendedor llamen a `lib/api` y `AppShell` exista.

## Archivos incluidos en este paquete

### Shell / navegación
- `src/components/Navbar.tsx`
- `src/components/Sidebar.tsx`
- `src/components/Footer.tsx`
- `src/components/NotificationToasts.tsx`

### Páginas vendedor / cuenta / mensajes
- `src/app/(app)/perfil/page.tsx`
- `src/app/(app)/productos/nuevo/page.tsx`
- `src/app/(app)/mis-posts/page.tsx`
- `src/app/(app)/historial-ventas/page.tsx`
- `src/app/(app)/mensajes/page.tsx`
- `src/app/(app)/notificaciones/page.tsx`

### UI auxiliar
- `src/components/ui/SelectableChip.tsx`
- `src/components/ui/RoleOptionCard.tsx`

## Qué desbloquea respecto a P1
- `onboarding/profile` ya encuentra `RoleOptionCard`.

## Qué desbloquea respecto a P2
- `AppShell` ya encuentra `Navbar` y `Sidebar` actualizados.
- Páginas de perfil, posts, ventas, mensajes y notificaciones usan `lib/api`.

## Errores esperados si falta P2
- Rutas bajo `(app)/` no tienen layout (`AppShell`) hasta mergear P2.
- Imports de `lib/api` fallan hasta mergear P2.

## URLs tras merge completo (P1 + P2 + P4)
- `/perfil`
- `/productos/nuevo`
- `/mis-posts`
- `/historial-ventas`
- `/mensajes`
- `/notificaciones`

## Subir cambios

```powershell
cd Front4/taller-next-corte-3-y-4-mariquita-s-team
git add .
git commit -m "feat: app shell, seller pages and messaging"
git push -u origin feature/appShellSeller
```
