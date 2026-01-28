# QA Engineering Development Guide

Principal-level guidelines for building world-class quality assurance programs that enable rapid, confident software delivery.

---

## Overview

This guide applies to:

- Test strategy and planning
- Test case design and execution
- Test automation architecture
- Quality metrics and reporting
- Release quality gates
- QA process governance
- Cross-functional quality collaboration

### Key Principles

1. **Quality is Everyone's Responsibility** - QA enables quality; the whole team owns it
2. **Shift Left** - Find defects early when they're cheapest to fix
3. **Risk-Based Testing** - Focus effort where failures cost the most
4. **Automation as Accelerator** - Automate the repeatable; humans do the creative
5. **Continuous Improvement** - Measure, learn, adapt

### Testing Pyramid

```text
         ┌─────────────┐
         │     E2E     │  ~10% - Critical user journeys
         │   (Manual   │  Slow, expensive, high confidence
         │  + Automated)│
         ├─────────────┤
         │             │
         │ Integration │  ~30% - Component interactions
         │             │  Medium speed, good confidence
         ├─────────────┤
         │             │
         │    Unit     │  ~60% - Individual functions
         │             │  Fast, cheap, immediate feedback
         └─────────────┘
```

### Technology Stack

| Layer | Tools |
|-------|-------|
| Unit Testing | Jest, Vitest, pytest, JUnit, Go test |
| Integration Testing | Supertest, pytest, TestContainers |
| E2E Testing | Playwright, Cypress, Selenium |
| API Testing | Postman, REST Assured, k6 |
| Performance Testing | k6, Gatling, JMeter, Locust |
| Security Testing | OWASP ZAP, Burp Suite, Snyk |
| Visual Testing | Percy, Chromatic, Applitools |
| Test Management | TestRail, Zephyr, qTest |

---

## Test Strategy

### Strategy Document Template

```markdown
# Test Strategy: [Project/Product Name]

## Scope

### In Scope
- [Feature/Component 1]
- [Feature/Component 2]

### Out of Scope
- [Explicitly excluded items]

## Risk Assessment

| Risk Area | Impact | Likelihood | Priority | Testing Focus |
|-----------|--------|------------|----------|---------------|
| Payment processing | Critical | Medium | P0 | Extensive |
| User authentication | Critical | Low | P1 | Comprehensive |
| Reporting | Medium | Medium | P2 | Standard |
| Admin settings | Low | Low | P3 | Basic |

## Test Levels

| Level | Coverage | Automation | Responsibility |
|-------|----------|------------|----------------|
| Unit | 80%+ | 100% | Developers |
| Integration | Core flows | 90%+ | Dev + QA |
| E2E | Critical paths | 70%+ | QA |
| Exploratory | Risk areas | 0% | QA |

## Environment Strategy

| Environment | Purpose | Data | Refresh |
|-------------|---------|------|---------|
| Local | Development | Mocked | On demand |
| Dev | Integration | Synthetic | Daily |
| Staging | Pre-prod validation | Sanitized prod | Weekly |
| Production | Smoke tests only | Live | N/A |

## Entry/Exit Criteria

### Entry Criteria (Ready for QA)
- [ ] Code complete and merged
- [ ] Unit tests passing (80%+ coverage)
- [ ] Code review approved
- [ ] Deployment to test environment successful
- [ ] Test data available

### Exit Criteria (Ready for Release)
- [ ] All P0/P1 test cases passed
- [ ] No open P0/P1 defects
- [ ] Regression suite passing
- [ ] Performance benchmarks met
- [ ] Security scan clean
- [ ] Stakeholder sign-off

## Defect Management

| Severity | Definition | Response Time | Resolution |
|----------|------------|---------------|------------|
| P0 | System down, data loss | Immediate | Same day |
| P1 | Major feature broken | < 4 hours | 24-48 hours |
| P2 | Feature impaired | < 24 hours | Current sprint |
| P3 | Minor issue | < 48 hours | Next sprint |
| P4 | Cosmetic | Best effort | Backlog |

## Reporting

| Report | Audience | Frequency |
|--------|----------|-----------|
| Test Execution | Team | Daily |
| Quality Dashboard | Leadership | Weekly |
| Release Readiness | Stakeholders | Per release |
| Defect Trends | Team | Sprint retrospective |
```

---

## Test Design

### Test Case Structure

```markdown
## Test Case: [TC-XXX]

**Title**: [Clear, concise description]

**Priority**: P0 | P1 | P2 | P3

**Type**: Functional | Regression | Smoke | Integration | E2E

**Preconditions**:
- [Required state before test]
- [Required data setup]

**Test Steps**:
| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | [Action] | [Expected outcome] |
| 2 | [Action] | [Expected outcome] |
| 3 | [Action] | [Expected outcome] |

**Postconditions**:
- [State after test]
- [Cleanup required]

**Test Data**:
| Variable | Value |
|----------|-------|
| [Input 1] | [Value] |
| [Input 2] | [Value] |

**Traceability**: [Requirement ID / User Story]
```

### Equivalence Partitioning

Divide inputs into groups that should behave the same:

```text
Input: Age (valid range 18-120)

Partitions:
├── Invalid: < 0     (negative)
├── Invalid: 0-17    (underage)
├── Valid: 18-120    (acceptable)
└── Invalid: > 120   (unrealistic)

Test Cases:
- Age = -1   → Error: Invalid age
- Age = 15   → Error: Must be 18+
- Age = 25   → Success
- Age = 150  → Error: Invalid age
```

### Boundary Value Analysis

Test at the edges of valid ranges:

```text
Input: Quantity (valid range 1-100)

Boundaries:
├── 0   → Invalid (just below minimum)
├── 1   → Valid (minimum)
├── 2   → Valid (just above minimum)
├── 99  → Valid (just below maximum)
├── 100 → Valid (maximum)
└── 101 → Invalid (just above maximum)
```

### State Transition Testing

```text
Order State Machine:

[Created] ──submit──> [Pending] ──approve──> [Approved] ──ship──> [Shipped]
    │                     │                       │
    │                     │──reject──> [Rejected] │
    │                     │                       │
    └──cancel──> [Cancelled] <──cancel────────────┘

Test Cases:
1. Created → Pending (valid)
2. Pending → Approved (valid)
3. Pending → Rejected (valid)
4. Created → Approved (invalid - must go through Pending)
5. Shipped → Cancelled (invalid - too late to cancel)
```

### Decision Table Testing

```text
Shipping Cost Rules:

| Condition            | Rule 1 | Rule 2 | Rule 3 | Rule 4 |
|----------------------|--------|--------|--------|--------|
| Order > $50          | Y      | Y      | N      | N      |
| Prime Member         | Y      | N      | Y      | N      |
| Shipping Cost        | Free   | Free   | $5     | $10    |

Test Cases:
1. Order $60, Prime → Free shipping
2. Order $60, Not Prime → Free shipping
3. Order $40, Prime → $5 shipping
4. Order $40, Not Prime → $10 shipping
```

---

## Test Automation

### Automation Strategy

```text
Automate:
├── Regression tests (high frequency, stable)
├── Smoke tests (critical path validation)
├── Data-driven tests (many inputs, same flow)
├── API tests (fast, reliable)
└── Performance baselines (measurable thresholds)

Keep Manual:
├── Exploratory testing (creative, adaptive)
├── Usability testing (human judgment)
├── Edge cases (rare, complex scenarios)
├── New features (still changing)
└── Visual/UX validation (subjective)
```

### Test Automation Pyramid

```javascript
// Unit Test Example (Base - Most Tests)
describe('calculateDiscount', () => {
  it('applies 10% discount for orders over $100', () => {
    expect(calculateDiscount(150)).toBe(15);
  });

  it('returns 0 for orders under $100', () => {
    expect(calculateDiscount(50)).toBe(0);
  });

  it('handles edge case at exactly $100', () => {
    expect(calculateDiscount(100)).toBe(10);
  });
});
```

```javascript
// Integration Test Example (Middle Layer)
describe('Order API', () => {
  it('creates order and applies discount', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({ items: [{ id: 1, quantity: 2, price: 75 }] })
      .expect(201);

    expect(response.body.subtotal).toBe(150);
    expect(response.body.discount).toBe(15);
    expect(response.body.total).toBe(135);
  });
});
```

```javascript
// E2E Test Example (Top - Fewest Tests)
test('user completes checkout flow', async ({ page }) => {
  await page.goto('/products');
  await page.click('[data-testid="product-1"]');
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="checkout"]');
  
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="card-number"]', '4111111111111111');
  await page.click('[data-testid="place-order"]');
  
  await expect(page.locator('[data-testid="confirmation"]')).toBeVisible();
});
```

### Page Object Pattern

```javascript
// pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="email"]');
    this.passwordInput = page.locator('[data-testid="password"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage() {
    return this.errorMessage.textContent();
  }
}

// tests/login.spec.js
test('shows error for invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('invalid@example.com', 'wrongpassword');
  
  const error = await loginPage.getErrorMessage();
  expect(error).toContain('Invalid credentials');
});
```

### Test Data Management

```javascript
// fixtures/users.js
export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'AdminPass123!',
    role: 'admin'
  },
  standard: {
    email: 'user@test.com',
    password: 'UserPass123!',
    role: 'user'
  },
  premium: {
    email: 'premium@test.com',
    password: 'PremiumPass123!',
    role: 'premium'
  }
};

// Factory pattern for dynamic data
export const createTestUser = (overrides = {}) => ({
  email: `test-${Date.now()}@example.com`,
  password: 'TestPass123!',
  firstName: 'Test',
  lastName: 'User',
  ...overrides
});
```

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Quality Metrics

### Key QA Metrics

| Metric | Formula | Target | Purpose |
|--------|---------|--------|---------|
| Defect Density | Defects / KLOC | < 1.0 | Code quality indicator |
| Defect Escape Rate | Prod Defects / Total Defects | < 5% | Testing effectiveness |
| Test Coverage | Lines Covered / Total Lines | > 80% | Code coverage |
| Test Pass Rate | Passed / Total Executed | > 95% | Test health |
| MTTR | Time to fix defects | < 24h for P1 | Response efficiency |
| Automation Rate | Automated / Total Tests | > 70% | Automation maturity |

### Defect Metrics

```markdown
## Defect Analysis Dashboard

### Defect Density Trend
| Sprint | New Code (KLOC) | Defects Found | Density |
|--------|-----------------|---------------|---------|
| S1     | 5.2             | 3             | 0.58    |
| S2     | 4.8             | 2             | 0.42    |
| S3     | 6.1             | 5             | 0.82    |

### Defect Distribution
| Severity | Open | In Progress | Resolved | Total |
|----------|------|-------------|----------|-------|
| P0       | 0    | 0           | 2        | 2     |
| P1       | 1    | 2           | 8        | 11    |
| P2       | 5    | 3           | 25       | 33    |
| P3       | 12   | 1           | 45       | 58    |

### Root Cause Analysis
| Category        | Count | Percentage |
|-----------------|-------|------------|
| Requirements    | 15    | 25%        |
| Design          | 12    | 20%        |
| Coding          | 24    | 40%        |
| Environment     | 9     | 15%        |
```

### Defect Removal Efficiency (DRE)

```text
DRE = (Defects found before release) / (Total defects found) × 100

Example:
- Found in development: 80
- Found in QA: 40
- Found in production: 5
- Total: 125

DRE = (80 + 40) / 125 × 100 = 96%

Target: > 95%
```

### Test Execution Metrics

```markdown
## Test Execution Report

### Summary
| Metric | Value |
|--------|-------|
| Total Test Cases | 450 |
| Executed | 442 |
| Passed | 425 |
| Failed | 12 |
| Blocked | 5 |
| Pass Rate | 96.2% |

### By Test Type
| Type | Total | Passed | Failed | Pass Rate |
|------|-------|--------|--------|-----------|
| Smoke | 25 | 25 | 0 | 100% |
| Regression | 300 | 290 | 10 | 96.7% |
| New Features | 125 | 110 | 15 | 88% |

### Automation Coverage
| Area | Manual | Automated | Auto Rate |
|------|--------|-----------|-----------|
| API | 20 | 180 | 90% |
| UI | 100 | 100 | 50% |
| Integration | 30 | 20 | 40% |
```

---

## Quality Gates

### Release Readiness Criteria

```markdown
## Release Quality Gate: [Version]

### Mandatory (Must Pass)
- [ ] All P0 test cases passed
- [ ] No open P0 defects
- [ ] No open P1 defects (or approved exceptions)
- [ ] Regression suite > 95% pass rate
- [ ] Security scan: 0 critical, 0 high
- [ ] Performance: Response time < 500ms (p95)
- [ ] Code coverage > 80%

### Conditional (Approve Exceptions)
- [ ] P2 defects: < 5 open (currently: X)
- [ ] Known issues documented
- [ ] Rollback plan tested

### Sign-off
| Role | Name | Date | Approved |
|------|------|------|----------|
| QA Lead | | | ☐ |
| Dev Lead | | | ☐ |
| Product | | | ☐ |
```

### CI Quality Gates

```yaml
# Example: SonarQube Quality Gate
sonar.qualitygate.conditions:
  - metric: new_coverage
    op: LT
    error: 80
  - metric: new_duplicated_lines_density
    op: GT
    error: 3
  - metric: new_bugs
    op: GT
    error: 0
  - metric: new_vulnerabilities
    op: GT
    error: 0
  - metric: new_code_smells
    op: GT
    error: 10
```

### Performance Thresholds

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Response Time (p50) | > 200ms | > 500ms | Investigate |
| Response Time (p95) | > 500ms | > 1000ms | Block release |
| Error Rate | > 0.1% | > 1% | Block release |
| CPU Usage | > 70% | > 90% | Scale/optimize |
| Memory Usage | > 80% | > 95% | Investigate leaks |

---

## Exploratory Testing

### Session-Based Testing

```markdown
## Exploratory Test Session

**Charter**: Explore [feature] with focus on [risk area]

**Time Box**: 60 minutes

**Tester**: [Name]

**Environment**: [Staging/Dev/etc.]

### Session Notes

**Setup** (5 min):
- [Configuration details]

**Exploration** (45 min):
| Time | Action | Observation | Bug? |
|------|--------|-------------|------|
| 0:05 | [Action] | [What happened] | No |
| 0:12 | [Action] | [Unexpected behavior] | Yes - logged |
| ... | ... | ... | ... |

**Debrief** (10 min):
- Bugs found: [Count]
- Areas needing more testing: [List]
- Questions raised: [List]

### Metrics
- Session duration: 60 min
- Test design time: 10 min
- Test execution time: 45 min
- Bug investigation time: 5 min
- Bugs found: 3
```

### Exploratory Testing Heuristics

| Heuristic | Description | Examples |
|-----------|-------------|----------|
| CRUD | Create, Read, Update, Delete | Can I create? Edit? Delete? View? |
| Boundaries | Test at limits | Max length, empty, negative |
| Goldilocks | Too big, too small, just right | Various valid inputs |
| Interruptions | Cancel mid-operation | Close browser, lose connection |
| Time | Date-related edge cases | Leap year, timezone, DST |
| Stress | Push to limits | Many users, large files |

---

## Definition of Done

### Test Case Done

- [ ] Clear title and description
- [ ] Preconditions documented
- [ ] Steps are reproducible
- [ ] Expected results are verifiable
- [ ] Traceability to requirement
- [ ] Peer reviewed

### Test Automation Done

- [ ] Test passes consistently (no flakiness)
- [ ] Page objects used appropriately
- [ ] Test data externalized
- [ ] Proper assertions and error messages
- [ ] Runs in CI pipeline
- [ ] Documentation updated

### Release Testing Done

- [ ] Test plan executed
- [ ] Defects logged and triaged
- [ ] Regression suite passed
- [ ] Exploratory testing completed
- [ ] Quality gate criteria met
- [ ] Sign-off obtained

---

## Common Pitfalls

### 1. Testing Everything Equally

❌ **Wrong**: Same test depth for all features

✅ **Right**: Risk-based testing - more effort on high-risk areas (payments, auth, data integrity)

### 2. Automating Everything

❌ **Wrong**: 100% automation target for all tests

✅ **Right**: Automate stable, repetitive tests; keep humans on exploratory and edge cases

### 3. Flaky Tests

❌ **Wrong**: Ignoring intermittent failures

✅ **Right**: Fix or quarantine immediately; flaky tests erode confidence

### 4. Testing in Isolation

❌ **Wrong**: QA only tests after development "throws over the wall"

✅ **Right**: QA involved from requirements through deployment

### 5. Measuring Activity, Not Quality

❌ **Wrong**: "We executed 10,000 tests!"

✅ **Right**: "Defect escape rate dropped from 8% to 3%"

### 6. Neglecting Test Maintenance

❌ **Wrong**: Writing tests and forgetting them

✅ **Right**: Regular test suite reviews, removing obsolete tests, updating for product changes

---

## Resources

- [Google Testing Blog](https://testing.googleblog.com/)
- [Ministry of Testing](https://www.ministryoftesting.com/)
- [Test Automation University](https://testautomationu.applitools.com/)
- [Agile Testing by Lisa Crispin & Janet Gregory](https://agiletester.ca/)
- [The Art of Software Testing by Glenford Myers](https://www.wiley.com/en-us/The+Art+of+Software+Testing)
- [ISTQB Syllabus](https://www.istqb.org/)
