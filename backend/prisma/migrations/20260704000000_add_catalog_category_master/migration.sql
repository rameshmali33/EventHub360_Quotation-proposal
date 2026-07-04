CREATE TABLE "catalog_category_master" (
    "category_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalog_category_master_pkey" PRIMARY KEY ("category_id")
);

CREATE UNIQUE INDEX "catalog_category_master_tenant_id_code_key"
    ON "catalog_category_master"("tenant_id", "code");
CREATE INDEX "catalog_category_master_tenant_id_is_active_idx"
    ON "catalog_category_master"("tenant_id", "is_active");

ALTER TABLE "catalog_category_master"
    ADD CONSTRAINT "catalog_category_master_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id")
    ON DELETE RESTRICT ON UPDATE CASCADE;