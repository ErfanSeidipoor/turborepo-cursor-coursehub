---
description: |
  Prescribes the standard structure, conventions, and content for documenting domain definitions within `packages/docs/domains.md`.
globs:
  - packages/docs/domains.md
alwaysApply: false
---

## Rule

The `domains.md` file must:

1. Begin with a list of all domains in the project (by name).
2. For each domain, provide:
   - **DOMAIN Name** as a heading.
   - **General Description**: A summary of the domain and its purpose in the system.
   - **Domain Main Entities**: (required) The primary entities unique to and defining this domain. These are the most important data models that encapsulate the core business logic and value of the domain.
   - **Domain General Entities**: Supporting or shared entities used within this domain, which may also be common across multiple domains. These provide additional structure or context but are less critical than the main entities.
   - **DOMAIN Rules**: List explicit business rules or constraints governing the domain.

### Format Example

```
## List of DOMAINs

- DOMAIN A
- DOMAIN B
- DOMAIN C

---

# DOMAIN A

**DOMAIN-DESCRIPTION:**
Explain the purpose and responsibilities of DOMAIN A.

**DOMAIN-MAIN-ENTITIES:**
- Entity1: Description of Entity1's role.
- Entity2: Description.

**DOMAIN-GENERAL-ENTITIES:**
- Entity1: Description of Entity1's role.
- Entity2: Description.

**DOMAIN-RULES:**
1. Rule A1.
2. Rule A2.

---

# DOMAIN B

... (Repeat per domain)
```

### Example for a DOMAIN with Rules

```
# Customer DOMAIN

**DOMAIN-DESCRIPTION:**
Handles customer records, account state, and their relationships with subscriptions and discounts.

**DOMAIN-MAIN-ENTITIES:**
- Customer: Represents an end-user or client of the company.
- Subscription: Connects a customer to an active plan.
- DiscountTier: Captures available discounts by customer type.

**DOMAIN-GENERAL_ENTITIES:**
- User: represent the user table

**DOMAIN-RULES:**
1. A customer cannot be deactivated if they have active subscriptions.
2. Email must be unique within the organization.
3. Customer type determines available discount tiers.
```
