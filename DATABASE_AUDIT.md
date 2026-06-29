# QTN Backend Database Persistence Audit Report

This report audits every method across the 7 QTN backend services to identify current database vs mock usage.

---

## Service Methods Audit

### 1. Quotation Service (`quotation.service.ts`)
*   `create()`: **Mixed** (Uses Prisma in DB mode, but has a complete in-memory fallback block).
*   `findAll()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback block).
*   `findOne()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback block).
*   `update()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback block).
*   `remove()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback block).
*   `addLine()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback block).
*   `updateLine()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback block).
*   `removeLine()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback block).
*   `calculate()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback block).

### 2. Price Book Service (`price-book.service.ts`)
*   `create()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `findAll()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `findOne()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `update()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `remove()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).

### 3. Rate Card Service (`rate-card.service.ts`)
*   `create()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `findAllByPriceBook()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `findOne()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `update()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `remove()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).

### 4. Package Service (`package.service.ts`)
*   `create()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `findAll()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `findOne()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `update()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `remove()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).

### 5. Quote Approval Service (`quote-approval.service.ts`)
*   `findAll()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `findOne()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `requestApproval()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `approve()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `reject()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `requestChanges()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `addComment()`: **Mock Based** (Uses the in-memory array `this.comments` exclusively).
*   `getHistory()`: **Mock Based** (Uses the in-memory array `this.history` exclusively).

### 6. Proposal Service (`proposal.service.ts`)
*   `create()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `findOneByQuotationId()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `send()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `findByHash()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `recordView()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `sign()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `accept()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).
*   `reject()`: **Mixed** (Uses Prisma in DB mode, in-memory fallback).

### 7. QTN Dashboard Service (`qtn-dashboard.service.ts`)
*   `getStats()`: **Mixed** (Serves dynamic values if quotations are in database, otherwise falls back to static hardcoded metrics).
*   `getMonthlyQuotations()`: **Mixed** (Serves dynamic values if quotations are in database, otherwise falls back to static hardcoded metrics).
*   `getStatusSummary()`: **Mixed** (Serves dynamic values if quotations are in database, otherwise falls back to static hardcoded metrics).
*   `getConversionFunnel()`: **Mixed** (Serves dynamic values if quotations are in database, otherwise falls back to static hardcoded metrics).
*   `getPendingApprovals()`: **Mixed** (Serves dynamic values if approvals exist, otherwise falls back to static hardcoded approvals).
*   `getRecentQuotations()`: **Mixed** (Serves dynamic values if quotations are in database, otherwise falls back to static hardcoded metrics).
*   `getTopSalesExecutives()`: **Mixed** (Serves dynamic values if quotations are in database, otherwise falls back to static hardcoded leaderboards).

---

## Identified Mock Elements

1.  **In-Memory Arrays**:
    *   `priceBooks` & `idCounter` in `PriceBookService`
    *   `rateCards` & `idCounter` in `RateCardService`
    *   `packages` & `idCounter` in `PackageService`
    *   `quotations`, `quotationLines`, `idCounter`, `lineIdCounter` in `QuotationService`
    *   `approvals`, `comments`, `history`, `approvalIdCounter`, `commentIdCounter`, `historyIdCounter` in `QuoteApprovalService`
    *   `proposals`, `views`, `signatures`, `idCounter` in `ProposalService`
2.  **Hardcoded Records**: Seed lists in constructors of `PriceBookService` and `RateCardService`.
3.  **Fallback Mock Responses**: Complete fallback structures in `QtnDashboardService` when database is empty.
4.  **No Schema Validation**: Missing checking constraints for relation properties (`lead_id`, `tax_rule_id`, `package_id`, `price_book_id`, `quotation_id`, `approval_id`) against active physical tables.
