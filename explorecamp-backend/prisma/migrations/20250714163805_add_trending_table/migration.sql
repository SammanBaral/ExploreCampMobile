-- CreateTable
CREATE TABLE "Trending" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Trending_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Trending" ADD CONSTRAINT "Trending_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
