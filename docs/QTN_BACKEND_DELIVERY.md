# QTN Module: Backend Delivery Document

This document serves as the final delivery report for the Quotation & Proposal Management (QTN) backend module of EventHub360.

---

## 1. Module Name
**Quotation & Proposal Management (QTN) Backend Module**

---

## 2. Tech Stack
- **Framework**: NestJS (v10.x / v11.x)
- **Language**: TypeScript
- **Database Gateway**: Prisma (Prisma Client generated, DB integration pending from core team)
- **Documentation**: Swagger OpenAPIs (served locally via `@nestjs/swagger` and `DocumentBuilder`)
- **Testing**: Jest (Unit & integration test suites)

---

## 3. Controllers & Services Created

All files are implemented under `backend/src/modules/`:

### Quotation Module
- **Controller**: [quotation.controller.ts](file:///c:/Users/rames/Desktop/EventHUb%20360/backend/src/modules/quotation/quotation.controller.ts)
- **Service**: [quotation.service.ts](file:///c:/Users/rames/Desktop/EventHUb%20360/backend/src/modules/quotation/quotation.service.ts)

### Pricing Module
- **Service**: [pricing.service.ts](file:///c:/Users/rames/Desktop/EventHUb%20360/backend/src/modules/pricing/pricing.service.ts)

### Catalog Module
- **Controllers**:
  - [price-book.controller.ts](file:///c:/Users/rames/Desktop/EventHUb%20360/backend/src/modules/catalog/price-book.controller.ts)
  - [rate-card.controller.ts](file:///c:/Users/rames/Desktop/EventHUb%20360/backend/src/modules/catalog/rate-card.controller.ts)
  - [package.controller.ts](file:///c:/Users/rames/Desktop/EventHUb%20360/backend/src/modules/catalog/package.controller.ts)
- **Services**:
  - [price-book.service.ts](file:///c:/Users/rames/Desktop/EventHUb%20360/backend/src/modules/catalog/price-book.service.ts)
  - [rate-card.service.ts](file:///c:/Users/rames/Desktop/EventHUb%20360/backend/src/modules/catalog/rate-card.service.ts)
  - [package.service.ts](file:///c:/Users/rames/Desktop/EventHUb%20360/backend/src/modules/catalog/package.service.ts)

### Approval Module
- **Controller**: [quote-approval.controller.ts](file:///c:/Users/rames/Desktop/EventHUb%20360/backend/src/modules/approval/quote-approval.controller.ts)
- **Service**: [quote-approval.service.ts](file:///c:/Users/rames/Desktop/EventHUb%20360/backend/src/modules/approval/quote-approval.service.ts)

### Proposal Module
- **Controller**: [proposal.controller.ts](file:///c:/Users/rames/Desktop/EventHUb%20360/backend/src/modules/proposal/proposal.controller.ts)
- **Service**: [proposal.service.ts](file:///c:/Users/rames/Desktop/EventHUb%20360/backend/src/modules/proposal/proposal.service.ts)

### Dashboard Module
- **Controller**: [qtn-dashboard.controller.ts](file:///c:/Users/rames/Desktop/EventHUb%20360/backend/src/modules/dashboard/qtn-dashboard.controller.ts)
- **Service**: [qtn-dashboard.service.ts](file:///c:/Users/rames/Desktop/EventHUb%20360/backend/src/modules/dashboard/qtn-dashboard.service.ts)

---

## 4. DTOs Created

The DTO classes are fully annotated with both `class-validator` rules and `@ApiProperty` Swagger documentation decorators:

### Quotation DTOs (`src/modules/quotation/dto/`)
- `CreateQuotationDto`
- `UpdateQuotationDto`
- `CreateQuotationLineDto`
- `UpdateQuotationLineDto`
- `QuotationListQueryDto`

### Catalog DTOs (`src/modules/catalog/dto/`)
- `CreatePriceBookDto`
- `UpdatePriceBookDto`
- `CreateRateCardDto`
- `UpdateRateCardDto`
- `CreatePackageDto`
- `UpdatePackageDto`
- `CatalogListQueryDto`

### Approval DTOs (`src/modules/approval/dto/`)
- `RequestApprovalDto`
- `ApprovalActionDto`
- `ApprovalCommentDto`

### Proposal DTOs (`src/modules/proposal/dto/`)
- `CreateProposalDto`
- `SendProposalDto`
- `ProposalSignatureDto`
- `ProposalActionDto`

---

## 5. APIs Implemented

The backend registers 40+ endpoints grouped by module controller routing:

### Quotation Module Routing (`/api/v1/quotations`)
- `POST /` - Create a quotation draft.
- `GET /` - List all quotations with filters.
- `GET /:id` - Get details of a specific quotation.
- `PATCH /:id` - Update quotation status/validity.
- `DELETE /:id` - Soft delete a quotation.
- `POST /:id/lines` - Add line item.
- `PATCH /:id/lines/:lineId` - Update line item quantities/rates/costs/taxes.
- `DELETE /:id/lines/:lineId` - Soft delete a line item.
- `POST /:id/calculate` - Run calculation and update totals.

### Catalog Module Routing (`/api/v1`)
- `/price-books` (`GET`, `POST`, `GET :id`, `PATCH :id`, `DELETE :id`) - Price Books CRUD.
- `/price-books/:priceBookId/rate-cards` (`GET`, `POST`) - List and append rate cards under price book.
- `/rate-cards/:id` (`GET`, `PATCH`, `DELETE`) - Rate Card CRUD.
- `/packages` (`GET`, `POST`, `GET :id`, `PATCH :id`, `DELETE :id`) - Packages CRUD.

### Approval Module Routing (`/api/v1/quote-approvals`)
- `POST /request` - Request approval (locks quotation).
- `POST /:id/action` - Approve/Reject/Request changes on a pending approval.
- `POST /:id/comments` - Append comments on an active review thread.
- `GET /:id/history` - Retrieve log history of actions.

### Proposal Module Routing (`/api/v1/proposals`)
- `POST /` - Generate a proposal for approved quotations.
- `GET /:id` - Fetch proposal internal details.
- `POST /:id/send` - Mark proposal status as SENT.
- `GET /portal/:publicHash` - Client portal proposal details.
- `POST /portal/:publicHash/view` - Client portal viewing notification.
- `POST /portal/:publicHash/sign` - Signature verification.
- `POST /portal/:publicHash/accept` - Acceptance transition.
- `POST /portal/:publicHash/reject` - Rejection log.

### Dashboard Module Routing (`/api/v1/qtn/dashboard`)
- `/stats` (`GET`) - Revenue totals and margin averages.
- `/monthly-quotations` (`GET`) - Historical charts grouping.
- `/status-summary` (`GET`) - Status percentages.
- `/conversion-funnel` (`GET`) - Deal funnel stats.
- `/pending-approvals` (`GET`) - Active list.
- `/recent-quotations` (`GET`) - Last 10 quotes.
- `/top-sales-executives` (`GET`) - Executive rankings.

---

## 6. Pricing Formulas

The mathematical calculations of the pricing service (`PricingService`) are structured as:

1. **Line-item Base Amount**:
   $$\text{Base Amount} = \text{Quantity} \times \text{Unit Rate}$$
2. **Line-item Net Amount** (deducting discounts):
   $$\text{Net Amount} = \text{Base Amount} \times \left(1 - \frac{\text{DiscountPercent}}{100}\right)$$
3. **Line-item Tax Amount**:
   $$\text{Tax Amount} = \text{Net Amount} \times \frac{\text{TaxPercent}}{100}$$
4. **Line-item Total Amount**:
   $$\text{Total Amount} = \text{Net Amount} + \text{TaxAmount}$$
5. **Line-item Total Cost**:
   $$\text{Line Cost} = \text{Quantity} \times \text{Unit Cost}$$
6. **Subtotal**:
   $$\text{Subtotal} = \sum \text{Net Amount}$$
7. **Total Tax**:
   $$\text{Total Tax} = \sum \text{Tax Amount}$$
8. **Total Cost**:
   $$\text{Total Cost} = \sum \text{Line Cost}$$
9. **Grand Total**:
   $$\text{Grand Total} = \text{Subtotal} - \text{GlobalDiscount} + \text{Total Tax} + \text{ServiceCharge}$$
10. **Margin & Margin Percent**:
    $$\text{Margin} = \text{Subtotal} - \text{Total Cost}$$
    $$\text{Margin Percent} = \begin{cases} \left(\frac{\text{Margin}}{\text{Subtotal}}\right) \times 100 & \text{if Subtotal} > 0 \\ 0 & \text{if Subtotal} = 0 \end{cases}$$

---

## 7. Business Rules & Tiers

### State Locking
Modifications of quotation details, line items, and pricing are strictly blocked when a quotation status is `PENDING_APPROVAL`, `APPROVED`, or `SENT`.

### Approval Tiers
Approvals are dynamically triaged to specific review roles based on discount and margin percentages:
- **Auto-Approved**: Applied when $\text{Discount} \le 5\%$ AND $\text{Margin} \ge 20\%$.
- **Sales Manager**: Required if $\text{Discount is } 6\% - 15\%$ OR $\text{Margin is } 10\% - 19\%$.
- **Company Owner**: Required if $\text{Discount} > 15\%$ OR $\text{Margin} < 10\%$.

### Proposal Acceptance Flow
1. Quotation must be `APPROVED` to draft a proposal.
2. Proposal must be transitioned to `SENT` before client access.
3. Client viewing the portal transitions status to `VIEWED`.
4. Client signing generates signature records and changes status to signed.
5. Client acceptance transitions status to `ACCEPTED` and synchronizes the parent quotation's status to `ACCEPTED`. Rejection marks both to `REJECTED`.
6. Once final state (`ACCEPTED` or `REJECTED`) is reached, all public portal routes block further changes (`sign`, `accept`, `reject` are read-only).

---

## 8. Verification & Test Status

- **Pricing Engine tests**: Verified. Jest specs pass successfully:
  ```bash
  npx jest src/modules/pricing/pricing.service.spec.ts
  ```
  *Result: 6 tests passed (normal calculations, line discounts, global discounts, zero subtotal, negative margins).*
- **Backend build**: Verified. NestJS CLI compiles successfully with zero warnings or type errors:
  ```bash
  npm run build
  ```
  *Result: Successful compilation.*

---

## 9. Swagger UI

All REST API DTO properties and routes are fully documented and served at the Swagger bootstrap route:

- **Swagger Local URL**: [http://localhost:3000/api](http://localhost:3000/api)
- **Title**: `EventHub360 QTN API`
- **Description**: `Quotation & Proposal Management backend APIs`
- **Version**: `1.0`

---

## 10. Current Limitations & Boundaries

- **Database integration pending**: Prisma models and relational mappings exist in `prisma/schema.prisma`. Active services run on in-memory lists/stubs while core database connection parameters are finalized by the head team.
- **RBAC full enforcement pending**: Role-based access control annotations and middleware guards are stubbed, awaiting integration of the global security module.
- **Frontend integration not in scope**: React-based frontend pages/configurations remain untouched and pristine.
