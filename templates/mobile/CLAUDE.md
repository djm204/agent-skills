# Mobile Development Guide

Comprehensive guidelines for building mobile applications.

---

## Overview

This guide applies to:
- React Native applications
- Flutter applications
- Native iOS/Android development
- Cross-platform frameworks

### Key Principles

1. **Mobile-First UX** - Design for touch and small screens
2. **Performance** - 60fps animations, fast startup
3. **Offline-First** - Work without network
4. **Platform Conventions** - Respect platform guidelines

### Project Structure

```
src/
├── components/       # Reusable UI components
├── screens/          # Screen components
├── navigation/       # Navigation configuration
├── hooks/            # Custom hooks
├── services/         # API and native services
├── store/            # State management
├── utils/            # Utilities
└── types/            # TypeScript definitions
```

---

## Navigation

### Stack Navigation
```tsx
<Stack.Navigator>
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="Details" component={DetailsScreen} />
</Stack.Navigator>
```

### Tab Navigation
```tsx
<Tab.Navigator>
  <Tab.Screen name="Home" component={HomeStack} />
  <Tab.Screen name="Profile" component={ProfileStack} />
</Tab.Navigator>
```

### Type-Safe Navigation
```tsx
type RootStackParamList = {
  Home: undefined;
  Details: { id: string };
};

navigation.navigate('Details', { id: '123' });
```

### Deep Linking
```tsx
const linking = {
  prefixes: ['myapp://'],
  config: { screens: { Details: 'details/:id' } },
};
```

---

## Offline-First

### Local Storage
- AsyncStorage for simple key-value
- SQLite/Realm for structured data
- Cache API responses

### Sync Strategy
```ts
async function sync() {
  const pending = await db.getPendingChanges();
  for (const change of pending) {
    await api.sync(change);
    await db.markSynced(change.id);
  }
}
```

### Optimistic Updates
```tsx
const updateTask = useMutation({
  mutationFn: api.updateTask,
  onMutate: async (newTask) => {
    queryClient.setQueryData(['tasks'], (old) =>
      old.map((t) => (t.id === newTask.id ? newTask : t))
    );
  },
  onError: (err, newTask, context) => {
    queryClient.setQueryData(['tasks'], context.previousTasks);
  },
});
```

### Network Status
```tsx
const { isOnline } = useNetworkStatus();
if (!isOnline) return <OfflineBanner />;
```

---

## Performance

### List Optimization
```tsx
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={keyExtractor}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  getItemLayout={(_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Memoization
```tsx
const MemoizedItem = memo(({ item }) => <ItemView item={item} />);
const sortedData = useMemo(() => data.sort(...), [data]);
const handlePress = useCallback(() => onPress(id), [id]);
```

### Animations
```tsx
Animated.timing(value, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true,  // Key for performance
}).start();
```

### Startup
```tsx
InteractionManager.runAfterInteractions(() => {
  // Defer non-critical initialization
  initializeAnalytics();
});
```

---

## Testing

### Unit Tests
```ts
describe('formatCurrency', () => {
  it('formats correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });
});
```

### Component Tests
```tsx
it('calls onPress when pressed', () => {
  const onPress = jest.fn();
  const { getByText } = render(<Button label="Submit" onPress={onPress} />);
  fireEvent.press(getByText('Submit'));
  expect(onPress).toHaveBeenCalled();
});
```

### E2E Tests (Detox)
```ts
it('should login successfully', async () => {
  await element(by.id('email-input')).typeText('test@example.com');
  await element(by.id('password-input')).typeText('password123');
  await element(by.id('login-button')).tap();
  await expect(element(by.id('home-screen'))).toBeVisible();
});
```

---

## Native Features

### Permissions
```tsx
const status = await requestCameraPermission();
if (status !== 'granted') {
  showPermissionDeniedMessage();
  return;
}
```

### Platform-Specific Code
```tsx
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
  },
});

// Or use Platform.select
const padding = Platform.select({ ios: 44, android: 0 });
```

---

## Definition of Done

A mobile feature is complete when:

- [ ] Works on both platforms (if cross-platform)
- [ ] Handles offline gracefully
- [ ] Animations run at 60fps
- [ ] Accessible (screen readers, dynamic type)
- [ ] Tests pass on device/simulator
- [ ] No memory leaks
- [ ] Handles permissions correctly
- [ ] Code reviewed and approved
