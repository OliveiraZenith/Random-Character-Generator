-- CreateTable
CREATE TABLE "annotation_tags" (
    "annotation_id" INTEGER NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "annotation_tags_pkey" PRIMARY KEY ("annotation_id","tag_id")
);

-- CreateIndex
CREATE INDEX "idx_annotation_tag_tag" ON "annotation_tags"("tag_id");

-- CreateIndex
CREATE INDEX "idx_annotation_tag_annotation" ON "annotation_tags"("annotation_id");

-- AddForeignKey
ALTER TABLE "annotation_tags" ADD CONSTRAINT "annotation_tags_annotation_id_fkey" FOREIGN KEY ("annotation_id") REFERENCES "anotacoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annotation_tags" ADD CONSTRAINT "annotation_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
