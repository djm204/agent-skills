# Web Frontend Development Guide

Comprehensive guidelines for building modern web frontend applications.

---

## Overview

This guide applies to:
- Single-page applications (SPAs)
- Server-rendered web applications
- Static sites with dynamic components
- Progressive web applications (PWAs)

### Key Principles

1. **User Experience First** - Fast, responsive, accessible
2. **Component-Based Architecture** - Small, focused, reusable
3. **Type Safety** - TypeScript for all new code
4. **Progressive Enhancement** - Core functionality without JS

### Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # Primitive components (Button, Input, Card)
│   └── features/     # Feature-specific components
├── pages/            # Page/route components
├── hooks/            # Custom hooks
├── lib/              # Business logic, utilities
├── types/            # TypeScript type definitions
├── styles/           # Global styles, theme
└── assets/           # Static assets
```

---

## Component Patterns

### Composition Over Inheritance

```tsx
// Good: Composition
const UserCard = ({ user }: { user: User }) => (
  <Card>
    <Avatar src={user.avatar} />
    <CardContent>
      <UserName name={user.name} />
    </CardContent>
  </Card>
);

// Bad: Inheritance
class UserCard extends BaseCard { ... }
```

### Pure Components

Same props = same output. No side effects in render.

```tsx
// Good: Pure
const Greeting = ({ name }: { name: string }) => (
  <h1>Hello, {name}!</h1>
);

// Bad: Side effects
const Greeting = ({ name }) => {
  document.title = name;  // Side effect!
  return <h1>Hello, {name}!</h1>;
};
```

### Props Interface

```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const Button = ({ variant, size = 'md', ...props }: ButtonProps) => ( ... );
```

### Conditional Rendering

```tsx
// Early return for guards
const UserProfile = ({ user }: { user: User | null }) => {
  if (!user) return <NotLoggedIn />;
  return <Profile user={user} />;
};

// Ternary for simple conditions
const Status = ({ isActive }: { isActive: boolean }) => (
  <span>{isActive ? 'Active' : 'Inactive'}</span>
);

// && for optional rendering
{message && <Alert>{message}</Alert>}
```

---

## State Management

### Principles

1. **Lift State Only When Necessary** - Keep state close to where it's used
2. **Derive Don't Duplicate** - Calculate from existing state
3. **Immutable Updates** - Never mutate state directly

### Local State

```tsx
// Simple values
const [count, setCount] = useState(0);

// Complex state
const [state, dispatch] = useReducer(reducer, initialState);
```

### Shared State

```tsx
// Context for global UI/auth/theme
const ThemeContext = createContext<Theme>('light');

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### Immutable Updates

```tsx
// Good
setItems(items => [...items, newItem]);
setUser(user => ({ ...user, name: newName }));

// Bad: Mutation
items.push(newItem);
setItems(items);
```

### Anti-Patterns

- **Prop Drilling**: Use context or composition
- **Over-Centralization**: Keep local state local
- **Stale Closures**: Use refs or functional updates

---

## Styling

### Principles

- Consistency via design system
- Maintainability via component-scoped styles
- Mobile-first responsive design
- Performance-conscious CSS

### Responsive Design

```css
/* Base: Mobile */
.container { padding: 1rem; }

/* Tablet */
@media (min-width: 768px) {
  .container { padding: 2rem; }
}

/* Desktop */
@media (min-width: 1024px) {
  .container { padding: 3rem; max-width: 1200px; }
}
```

### CSS Custom Properties

```css
:root {
  --color-primary: #3b82f6;
  --color-text: #1e293b;
  --spacing-md: 1rem;
  --radius-md: 0.5rem;
}

[data-theme="dark"] {
  --color-text: #f1f5f9;
}
```

### Anti-Patterns

- Avoid `!important`
- Avoid inline styles for theming
- Avoid magic numbers

---

## Accessibility (a11y)

### Semantic HTML

```html
<!-- Good -->
<nav><ul><li><a href="/home">Home</a></li></ul></nav>
<main><article><h1>Title</h1></article></main>
<button onClick={fn}>Submit</button>

<!-- Bad -->
<div class="nav"><div onclick="...">Home</div></div>
```

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Visible focus indicators
- Skip links for main content
- Focus trapping for modals

### ARIA

Use only when native HTML is insufficient:

```tsx
<button aria-expanded={isOpen} aria-controls="menu">Menu</button>
<input aria-invalid={hasError} aria-describedby="error-msg" />
<div aria-live="polite">{statusMessage}</div>
```

### Forms

Every input needs a label:

```tsx
<label htmlFor="email">Email</label>
<input id="email" type="email" />
```

### Color and Contrast

- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Don't rely on color alone

### Testing Checklist

- [ ] Navigate with keyboard only
- [ ] Test with screen reader
- [ ] Check color contrast
- [ ] Verify focus indicators
- [ ] Test at 200% zoom

---

## Testing

### Philosophy

Test user behavior, not implementation details.

### Unit Tests (Pure Functions)

```ts
describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });
});
```

### Component Tests

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('shows error when form is invalid', async () => {
  render(<LoginForm />);
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
});
```

### Accessibility Tests

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

test('has no a11y violations', async () => {
  const { container } = render(<Button>Click</Button>);
  expect(await axe(container)).toHaveNoViolations();
});
```

### Query Priority

1. `getByRole` - Most accessible
2. `getByLabelText` - For form fields
3. `getByText` - For content
4. `getByTestId` - Last resort

### E2E Tests (Critical Paths)

```ts
test('user can complete purchase', async ({ page }) => {
  await page.goto('/products');
  await page.click('text=Add to Cart');
  await page.click('text=Checkout');
  await expect(page.locator('text=Order Confirmed')).toBeVisible();
});
```

---

## Performance

### Core Web Vitals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID/INP** (Interactivity): < 100ms / < 200ms
- **CLS** (Layout Shift): < 0.1

### Code Splitting

```tsx
const Dashboard = lazy(() => import('./pages/Dashboard'));

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### Minimize Bundle Size

```tsx
// Bad: Import entire library
import _ from 'lodash';

// Good: Import specific function
import debounce from 'lodash/debounce';
```

### Prevent Re-renders

```tsx
// Memoize expensive components
const ExpensiveList = memo(({ items }) => ...);

// Memoize calculations
const sorted = useMemo(() => items.sort(...), [items]);

// Memoize callbacks
const handleClick = useCallback(() => ..., []);
```

### Virtualize Long Lists

Use virtualization libraries for lists with 100+ items.

### Image Optimization

- Use modern formats (WebP, AVIF)
- Lazy load images
- Always specify dimensions

### Performance Budgets

- JavaScript: < 200KB gzipped
- CSS: < 50KB gzipped
- LCP: < 2.5s

---

## Definition of Done

A frontend feature is complete when:

- [ ] Component renders correctly
- [ ] Responsive across breakpoints
- [ ] Keyboard navigable
- [ ] Screen reader accessible
- [ ] Loading and error states handled
- [ ] Tests written and passing
- [ ] No TypeScript errors
- [ ] Meets performance budgets
- [ ] Code reviewed and approved
