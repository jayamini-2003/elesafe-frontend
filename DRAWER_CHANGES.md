# Drawer Navigation — What Changed

## New files added

| File | Purpose |
|---|---|
| `context/DrawerContext.tsx` | React context that shares `openDrawer()` / `closeDrawer()` across any screen |
| `components/DrawerNavigator.tsx` | Animated slide-from-left drawer wrapper (pure RN Animated API, no extra lib) |
| `components/DrawerContent.tsx` | Sidebar UI: brand header, profile card, nav items, logout |
| `components/AppHeader.tsx` | Shared top bar with hamburger icon, title, optional right icon + badge |
| `app/(drawer)/_layout.tsx` | Expo Router group layout — wraps screens in DrawerNavigator |
| `app/(drawer)/home.tsx` | Home screen (moved from tabs) |
| `app/(drawer)/map.tsx` | Map screen (moved from tabs) |
| `app/(drawer)/report.tsx` | Report screen (moved from tabs) |
| `app/(drawer)/history.tsx` | History screen (moved from tabs) |
| `app/(drawer)/safety.tsx` | Safety screen (moved from tabs) |

## Files updated

| File | Change |
|---|---|
| `app/_layout.tsx` | Added `GestureHandlerRootView` + `SafeAreaProvider` wrappers |
| `app/index.tsx` | Redirect changed from `/(tabs)/home` → `/(drawer)/home` |
| `app/(auth)/login.tsx` | Post-login redirect → `/(drawer)/home` |
| `app/(auth)/register.tsx` | Post-register redirect → `/(drawer)/home` |
| `package.json` | Added `@react-navigation/drawer ^7.1.0` |

## Install command

```bash
npx expo install @react-navigation/drawer
```

## How the drawer opens

Every screen renders `<AppHeader />` or `<AppHeaderLogo />` at the top.
Those components call `useDrawer().openDrawer()` when the hamburger is tapped.
`DrawerLayout` registers the actual `open()`/`close()` Animated functions into
`DrawerContext` so there is no prop-drilling.
