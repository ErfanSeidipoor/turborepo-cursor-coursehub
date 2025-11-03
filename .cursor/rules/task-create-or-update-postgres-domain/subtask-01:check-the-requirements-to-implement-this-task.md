1. **SUBTASK-1: Check the requirements to implement this task**

Before proceeding with any implementation, you must verify that the domain is correctly defined and documented. Follow these steps to ensure all prerequisites are satisfied:

- **Step 1: Obtain the Domain Name**
  - The target domain name must be clearly provided as input to this task.

- **Step 2: Verify Domain Existence**
  - Open the file located at `packages/docs/domains.md`.
  - Search for a top-level domain entry matching the provided domain name.
  - If the domain does **not** exist in this file, **stop** and request the user to define or document the domain before proceeding.

- **Step 3: Validate Required Domain Information**
  - Under the section or entry for the specified domain, confirm the presence of the following documented fields:
    - `DOMAIN-DESCRIPTION`:(required) A summary or definition of the domain’s purpose.
    - `DOMAIN-MAIN-ENTITIES`:(required) The primary entities unique to and defining this domain. These are the most important data models that encapsulate the core business logic and value of the domain.
    - `DOMAIN-GENERAL-ENTITIES`: Supporting or shared entities used within this domain, which may also be common across multiple domains. These provide additional structure or context but are less critical than the main entities.
    - `DOMAIN-RULES`:(required) A list of business rules, invariants, or constraints governing the domain behavior.

  - Each of these sections must be present and have sufficient details to guide the subsequent implementation.
  - If any of the required information is missing or inadequately documented, stop and prompt the user to complete the missing parts in `@domains.md`.

**Do not proceed with the task unless all checks above are satisfied and the domain is fully and clearly specified in the documentation.**
