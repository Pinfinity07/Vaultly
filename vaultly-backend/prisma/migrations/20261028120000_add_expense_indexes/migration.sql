-- CreateIndex
CREATE INDEX "Expenses_userId_date_idx" ON "Expenses"("userId", "date");

-- CreateIndex
CREATE INDEX "Expenses_userId_categoryId_idx" ON "Expenses"("userId", "categoryId");

-- CreateIndex
CREATE INDEX "Expenses_groupId_idx" ON "Expenses"("groupId");
