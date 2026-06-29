-- CreateTable
CREATE TABLE "tenant" (
    "tenant_id" BIGSERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "subdomain" VARCHAR(80) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("tenant_id")
);

-- CreateTable
CREATE TABLE "company" (
    "company_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" BIGINT,
    "updated_by" BIGINT,

    CONSTRAINT "company_pkey" PRIMARY KEY ("company_id")
);

-- CreateTable
CREATE TABLE "branch" (
    "branch_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" BIGINT,
    "updated_by" BIGINT,

    CONSTRAINT "branch_pkey" PRIMARY KEY ("branch_id")
);

-- CreateTable
CREATE TABLE "user_account" (
    "user_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" BIGINT,
    "updated_by" BIGINT,

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "role" (
    "role_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" BIGINT,
    "updated_by" BIGINT,

    CONSTRAINT "role_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "user_role" (
    "user_id" BIGINT NOT NULL,
    "role_id" BIGINT NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "permission" (
    "permission_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("permission_id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "role_id" BIGINT NOT NULL,
    "permission_id" BIGINT NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "numbering_scheme" (
    "scheme_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "prefix" VARCHAR(10) NOT NULL,
    "current_seq" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "numbering_scheme_pkey" PRIMARY KEY ("scheme_id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "log_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" BIGINT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "tax_rule" (
    "tax_rule_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "rate_percent" DECIMAL(5,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" BIGINT,
    "updated_by" BIGINT,

    CONSTRAINT "tax_rule_pkey" PRIMARY KEY ("tax_rule_id")
);

-- CreateTable
CREATE TABLE "lead" (
    "lead_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "lead_pkey" PRIMARY KEY ("lead_id")
);

-- CreateTable
CREATE TABLE "booking" (
    "booking_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "quotation_id" BIGINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "quotation" (
    "quotation_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,
    "branch_id" BIGINT NOT NULL,
    "lead_id" BIGINT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'INR',
    "subtotal" DECIMAL(14,2) NOT NULL,
    "tax_total" DECIMAL(14,2) NOT NULL,
    "total" DECIMAL(14,2) NOT NULL,
    "cost_total" DECIMAL(14,2) NOT NULL,
    "margin" DECIMAL(14,2) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "parent_quotation_id" BIGINT,
    "expires_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" BIGINT,
    "updated_by" BIGINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "quotation_pkey" PRIMARY KEY ("quotation_id")
);

-- CreateTable
CREATE TABLE "quotation_line" (
    "line_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,
    "branch_id" BIGINT NOT NULL,
    "quotation_id" BIGINT NOT NULL,
    "item_type" VARCHAR(50) NOT NULL,
    "ref_id" BIGINT NOT NULL,
    "description" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "rate" DECIMAL(14,2) NOT NULL,
    "cost" DECIMAL(14,2) NOT NULL,
    "tax_rule_id" BIGINT,
    "amount" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" BIGINT,
    "updated_by" BIGINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "quotation_line_pkey" PRIMARY KEY ("line_id")
);

-- CreateTable
CREATE TABLE "price_book" (
    "price_book_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,
    "branch_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "valid_from" TIMESTAMPTZ,
    "valid_to" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" BIGINT,
    "updated_by" BIGINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "price_book_pkey" PRIMARY KEY ("price_book_id")
);

-- CreateTable
CREATE TABLE "rate_card" (
    "rate_card_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,
    "branch_id" BIGINT NOT NULL,
    "price_book_id" BIGINT NOT NULL,
    "item_name" TEXT NOT NULL,
    "uom" VARCHAR(50) NOT NULL,
    "rate" DECIMAL(14,2) NOT NULL,
    "cost" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" BIGINT,
    "updated_by" BIGINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "rate_card_pkey" PRIMARY KEY ("rate_card_id")
);

-- CreateTable
CREATE TABLE "package" (
    "package_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,
    "branch_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "base_price" DECIMAL(14,2) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" BIGINT,
    "updated_by" BIGINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "package_pkey" PRIMARY KEY ("package_id")
);

-- CreateTable
CREATE TABLE "quote_approval" (
    "approval_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,
    "branch_id" BIGINT NOT NULL,
    "quotation_id" BIGINT NOT NULL,
    "approver_id" BIGINT NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "decided_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_by" BIGINT,
    "updated_by" BIGINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "quote_approval_pkey" PRIMARY KEY ("approval_id")
);

-- CreateTable
CREATE TABLE "proposal" (
    "proposal_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "company_id" BIGINT NOT NULL,
    "quotation_id" BIGINT NOT NULL,
    "public_hash" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "accepted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "proposal_pkey" PRIMARY KEY ("proposal_id")
);

-- CreateTable
CREATE TABLE "proposal_view" (
    "view_id" BIGSERIAL NOT NULL,
    "proposal_id" BIGINT NOT NULL,
    "viewed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,

    CONSTRAINT "proposal_view_pkey" PRIMARY KEY ("view_id")
);

-- CreateTable
CREATE TABLE "proposal_signature" (
    "signature_id" BIGSERIAL NOT NULL,
    "proposal_id" BIGINT NOT NULL,
    "signer_name" TEXT NOT NULL,
    "signer_email" TEXT NOT NULL,
    "signature_ip" VARCHAR(45) NOT NULL,
    "signed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "signature_data" TEXT,

    CONSTRAINT "proposal_signature_pkey" PRIMARY KEY ("signature_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_subdomain_key" ON "tenant"("subdomain");

-- CreateIndex
CREATE INDEX "company_tenant_id_idx" ON "company"("tenant_id");

-- CreateIndex
CREATE INDEX "branch_tenant_id_idx" ON "branch"("tenant_id");

-- CreateIndex
CREATE INDEX "branch_company_id_idx" ON "branch"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_email_key" ON "user_account"("email");

-- CreateIndex
CREATE INDEX "user_account_tenant_id_idx" ON "user_account"("tenant_id");

-- CreateIndex
CREATE INDEX "role_tenant_id_idx" ON "role"("tenant_id");

-- CreateIndex
CREATE INDEX "permission_tenant_id_idx" ON "permission"("tenant_id");

-- CreateIndex
CREATE INDEX "numbering_scheme_tenant_id_idx" ON "numbering_scheme"("tenant_id");

-- CreateIndex
CREATE INDEX "audit_log_tenant_id_idx" ON "audit_log"("tenant_id");

-- CreateIndex
CREATE INDEX "audit_log_company_id_idx" ON "audit_log"("company_id");

-- CreateIndex
CREATE INDEX "tax_rule_tenant_id_idx" ON "tax_rule"("tenant_id");

-- CreateIndex
CREATE INDEX "lead_tenant_id_idx" ON "lead"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_quotation_id_key" ON "booking"("quotation_id");

-- CreateIndex
CREATE INDEX "booking_tenant_id_idx" ON "booking"("tenant_id");

-- CreateIndex
CREATE INDEX "quotation_tenant_id_idx" ON "quotation"("tenant_id");

-- CreateIndex
CREATE INDEX "quotation_company_id_idx" ON "quotation"("company_id");

-- CreateIndex
CREATE INDEX "quotation_lead_id_idx" ON "quotation"("lead_id");

-- CreateIndex
CREATE INDEX "quotation_status_idx" ON "quotation"("status");

-- CreateIndex
CREATE INDEX "quotation_line_tenant_id_idx" ON "quotation_line"("tenant_id");

-- CreateIndex
CREATE INDEX "quotation_line_company_id_idx" ON "quotation_line"("company_id");

-- CreateIndex
CREATE INDEX "quotation_line_quotation_id_idx" ON "quotation_line"("quotation_id");

-- CreateIndex
CREATE INDEX "price_book_tenant_id_idx" ON "price_book"("tenant_id");

-- CreateIndex
CREATE INDEX "price_book_company_id_idx" ON "price_book"("company_id");

-- CreateIndex
CREATE INDEX "rate_card_tenant_id_idx" ON "rate_card"("tenant_id");

-- CreateIndex
CREATE INDEX "rate_card_company_id_idx" ON "rate_card"("company_id");

-- CreateIndex
CREATE INDEX "rate_card_price_book_id_idx" ON "rate_card"("price_book_id");

-- CreateIndex
CREATE INDEX "package_tenant_id_idx" ON "package"("tenant_id");

-- CreateIndex
CREATE INDEX "package_company_id_idx" ON "package"("company_id");

-- CreateIndex
CREATE INDEX "quote_approval_tenant_id_idx" ON "quote_approval"("tenant_id");

-- CreateIndex
CREATE INDEX "quote_approval_company_id_idx" ON "quote_approval"("company_id");

-- CreateIndex
CREATE INDEX "quote_approval_quotation_id_idx" ON "quote_approval"("quotation_id");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_quotation_id_key" ON "proposal"("quotation_id");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_public_hash_key" ON "proposal"("public_hash");

-- CreateIndex
CREATE INDEX "proposal_tenant_id_idx" ON "proposal"("tenant_id");

-- CreateIndex
CREATE INDEX "proposal_view_proposal_id_idx" ON "proposal_view"("proposal_id");

-- CreateIndex
CREATE UNIQUE INDEX "proposal_signature_proposal_id_key" ON "proposal_signature"("proposal_id");

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch" ADD CONSTRAINT "branch_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch" ADD CONSTRAINT "branch_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permission" ADD CONSTRAINT "permission_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("permission_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "numbering_scheme" ADD CONSTRAINT "numbering_scheme_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rule" ADD CONSTRAINT "tax_rule_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead" ADD CONSTRAINT "lead_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotation"("quotation_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation" ADD CONSTRAINT "quotation_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation" ADD CONSTRAINT "quotation_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation" ADD CONSTRAINT "quotation_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation" ADD CONSTRAINT "quotation_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "lead"("lead_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_line" ADD CONSTRAINT "quotation_line_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_line" ADD CONSTRAINT "quotation_line_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_line" ADD CONSTRAINT "quotation_line_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_line" ADD CONSTRAINT "quotation_line_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotation"("quotation_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotation_line" ADD CONSTRAINT "quotation_line_tax_rule_id_fkey" FOREIGN KEY ("tax_rule_id") REFERENCES "tax_rule"("tax_rule_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_book" ADD CONSTRAINT "price_book_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_book" ADD CONSTRAINT "price_book_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_book" ADD CONSTRAINT "price_book_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_card" ADD CONSTRAINT "rate_card_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_card" ADD CONSTRAINT "rate_card_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_card" ADD CONSTRAINT "rate_card_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rate_card" ADD CONSTRAINT "rate_card_price_book_id_fkey" FOREIGN KEY ("price_book_id") REFERENCES "price_book"("price_book_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package" ADD CONSTRAINT "package_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package" ADD CONSTRAINT "package_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package" ADD CONSTRAINT "package_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_approval" ADD CONSTRAINT "quote_approval_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_approval" ADD CONSTRAINT "quote_approval_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "company"("company_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_approval" ADD CONSTRAINT "quote_approval_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("branch_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_approval" ADD CONSTRAINT "quote_approval_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotation"("quotation_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal" ADD CONSTRAINT "proposal_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotation"("quotation_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_view" ADD CONSTRAINT "proposal_view_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposal"("proposal_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_signature" ADD CONSTRAINT "proposal_signature_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposal"("proposal_id") ON DELETE RESTRICT ON UPDATE CASCADE;
