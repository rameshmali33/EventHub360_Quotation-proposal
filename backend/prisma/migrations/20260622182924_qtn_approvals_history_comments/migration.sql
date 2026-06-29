-- CreateTable
CREATE TABLE "quote_approval_comment" (
    "comment_id" BIGSERIAL NOT NULL,
    "approval_id" BIGINT NOT NULL,
    "comment" TEXT NOT NULL,
    "created_by" BIGINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_approval_comment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "quote_approval_history" (
    "history_id" BIGSERIAL NOT NULL,
    "approval_id" BIGINT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "performed_by" VARCHAR(100) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_approval_history_pkey" PRIMARY KEY ("history_id")
);

-- AddForeignKey
ALTER TABLE "quote_approval_comment" ADD CONSTRAINT "quote_approval_comment_approval_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "quote_approval"("approval_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_approval_history" ADD CONSTRAINT "quote_approval_history_approval_id_fkey" FOREIGN KEY ("approval_id") REFERENCES "quote_approval"("approval_id") ON DELETE RESTRICT ON UPDATE CASCADE;
