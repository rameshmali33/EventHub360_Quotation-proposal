CREATE TABLE "quotation_status_master" (
    "status_id" BIGSERIAL NOT NULL,
    "tenant_id" BIGINT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(30) NOT NULL DEFAULT 'gray',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quotation_status_master_pkey" PRIMARY KEY ("status_id")
);

CREATE UNIQUE INDEX "quotation_status_master_tenant_id_code_key"
    ON "quotation_status_master"("tenant_id", "code");
CREATE INDEX "quotation_status_master_tenant_id_is_active_idx"
    ON "quotation_status_master"("tenant_id", "is_active");

ALTER TABLE "quotation_status_master"
    ADD CONSTRAINT "quotation_status_master_tenant_id_fkey"
    FOREIGN KEY ("tenant_id") REFERENCES "tenant"("tenant_id")
    ON DELETE RESTRICT ON UPDATE CASCADE;