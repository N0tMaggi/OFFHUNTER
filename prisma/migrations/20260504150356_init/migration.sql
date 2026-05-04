-- CreateTable
CREATE TABLE "GuildConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "schedule" TEXT NOT NULL DEFAULT '0 8 * * *',
    "zipCode" TEXT NOT NULL DEFAULT '60487',
    "retailers" TEXT,
    "maxPrice" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GuildConfig_guildId_key" ON "GuildConfig"("guildId");
