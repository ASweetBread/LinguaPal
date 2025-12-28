-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "currentLevel" TEXT DEFAULT 'A1',
    "dailyGoal" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "totalStudyMinutes" INTEGER NOT NULL DEFAULT 0,
    "vocabularyAbility" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keywords" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_records" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "phraseMeaningId" INTEGER,
    "errorType" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "originalSentence" TEXT NOT NULL,
    "correctSentence" TEXT NOT NULL,
    "severityLevel" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "error_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "words" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "phonetic" TEXT,
    "meanings" TEXT NOT NULL,
    "partOfSpeech" TEXT,
    "difficultyLevel" TEXT,
    "userId" INTEGER NOT NULL,
    "learnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phrases" (
    "id" SERIAL NOT NULL,
    "phrase" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "learnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phrases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phrase_meanings" (
    "id" SERIAL NOT NULL,
    "meaning" TEXT NOT NULL,
    "contextKeyword" TEXT NOT NULL,
    "phraseId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "firstLearnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "masteryLevel" INTEGER NOT NULL DEFAULT 0,
    "lastPracticedAt" TIMESTAMP(3),
    "totalPracticeCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "consecutiveCorrect" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentIntervalDays" INTEGER NOT NULL DEFAULT 1,
    "reviewRound" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "phrase_meanings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "word_phrase_relations" (
    "id" SERIAL NOT NULL,
    "wordId" INTEGER NOT NULL,
    "phraseId" INTEGER NOT NULL,

    CONSTRAINT "word_phrase_relations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_stats" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "statDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phrasesLearnedCount" INTEGER NOT NULL DEFAULT 0,
    "phrasesToReviewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "learning_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "today_review_details" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "phraseId" INTEGER NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "today_review_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "keywords_userId_name_key" ON "keywords"("userId", "name");

-- CreateIndex
CREATE INDEX "error_records_userId_occurredAt_idx" ON "error_records"("userId", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "words_userId_word_key" ON "words"("userId", "word");

-- CreateIndex
CREATE UNIQUE INDEX "phrases_userId_phrase_key" ON "phrases"("userId", "phrase");

-- CreateIndex
CREATE INDEX "phrase_meanings_userId_nextReviewAt_idx" ON "phrase_meanings"("userId", "nextReviewAt");

-- CreateIndex
CREATE UNIQUE INDEX "phrase_meanings_userId_phraseId_meaning_key" ON "phrase_meanings"("userId", "phraseId", "meaning");

-- CreateIndex
CREATE UNIQUE INDEX "word_phrase_relations_wordId_phraseId_key" ON "word_phrase_relations"("wordId", "phraseId");

-- CreateIndex
CREATE UNIQUE INDEX "learning_stats_userId_statDate_key" ON "learning_stats"("userId", "statDate");

-- CreateIndex
CREATE INDEX "today_review_details_userId_status_scheduledAt_idx" ON "today_review_details"("userId", "status", "scheduledAt");

-- AddForeignKey
ALTER TABLE "keywords" ADD CONSTRAINT "keywords_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "error_records" ADD CONSTRAINT "error_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "error_records" ADD CONSTRAINT "error_records_phraseMeaningId_fkey" FOREIGN KEY ("phraseMeaningId") REFERENCES "phrase_meanings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "words" ADD CONSTRAINT "words_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phrases" ADD CONSTRAINT "phrases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phrase_meanings" ADD CONSTRAINT "phrase_meanings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phrase_meanings" ADD CONSTRAINT "phrase_meanings_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "phrases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word_phrase_relations" ADD CONSTRAINT "word_phrase_relations_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "words"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "word_phrase_relations" ADD CONSTRAINT "word_phrase_relations_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "phrases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_stats" ADD CONSTRAINT "learning_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "today_review_details" ADD CONSTRAINT "today_review_details_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "today_review_details" ADD CONSTRAINT "today_review_details_phraseId_fkey" FOREIGN KEY ("phraseId") REFERENCES "phrases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
