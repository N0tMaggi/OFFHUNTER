-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GuildConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "schedule" TEXT NOT NULL DEFAULT '0 8 * * *',
    "zipCode" TEXT NOT NULL DEFAULT '60487',
    "retailers" TEXT,
    "maxPrice" REAL,
    "showDealLink" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_GuildConfig" ("channelId", "createdAt", "guildId", "id", "keywords", "maxPrice", "retailers", "schedule", "updatedAt", "zipCode") SELECT "channelId", "createdAt", "guildId", "id", "keywords", "maxPrice", "retailers", "schedule", "updatedAt", "zipCode" FROM "GuildConfig";
DROP TABLE "GuildConfig";
ALTER TABLE "new_GuildConfig" RENAME TO "GuildConfig";
CREATE UNIQUE INDEX "GuildConfig_guildId_key" ON "GuildConfig"("guildId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
