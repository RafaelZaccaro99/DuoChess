-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "displayName" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'pt-BR',
    "isMinor" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "experienceLevel" TEXT NOT NULL,
    "onlineRatingBlitz" INTEGER,
    "onlineRatingRapid" INTEGER,
    "officialRating" INTEGER,
    "officialTitle" TEXT,
    "platforms" TEXT[],
    "playsTournaments" BOOLEAN NOT NULL DEFAULT false,
    "weeklyMinutes" INTEGER NOT NULL DEFAULT 105,
    "preferredSide" TEXT,
    "showRankings" BOOLEAN NOT NULL DEFAULT true,
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "boardOrientation" TEXT NOT NULL DEFAULT 'WHITE',
    "showCoordinates" BOOLEAN NOT NULL DEFAULT true,
    "highContrast" BOOLEAN NOT NULL DEFAULT false,
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "targetValue" INTEGER,
    "targetDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "achievedAt" TIMESTAMP(3),

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'pt-BR',

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "World" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "ratingMin" INTEGER NOT NULL,
    "ratingMax" INTEGER NOT NULL,
    "focusSummary" TEXT NOT NULL,

    CONSTRAINT "World_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "worldId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "masteryTest" TEXT NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "competency" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillDependency" (
    "id" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,
    "minMastery" INTEGER NOT NULL DEFAULT 60,

    CONSTRAINT "SkillDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "conceptMd" TEXT NOT NULL,
    "demoFen" TEXT,
    "demoPgn" TEXT,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT,
    "slug" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "fen" TEXT NOT NULL,
    "pgn" TEXT,
    "sideToMove" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "ratingHint" INTEGER NOT NULL,
    "acceptedAnswers" JSONB NOT NULL,
    "predictableErrors" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "hint1" TEXT NOT NULL,
    "hint2" TEXT NOT NULL,
    "hint3" TEXT NOT NULL,
    "tags" TEXT[],
    "expectedSeconds" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "reviewState" TEXT NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseSkill" (
    "exerciseId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "ExerciseSkill_pkey" PRIMARY KEY ("exerciseId","skillId")
);

-- CreateTable
CREATE TABLE "ExerciseAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "answer" JSONB NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "elapsedMs" INTEGER NOT NULL,
    "phase" TEXT NOT NULL,
    "errorCause" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillMastery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "state" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "decayRatePerDay" DOUBLE PRECISION NOT NULL DEFAULT 0.6,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "correctStreak" INTEGER NOT NULL DEFAULT 0,
    "lastAssessedAt" TIMESTAMP(3),
    "appliedInGame" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillMastery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSchedule" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "skillId" TEXT,
    "exerciseId" TEXT,
    "stability" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "difficulty" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "reps" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "lastGrade" INTEGER,
    "usedHints" BOOLEAN NOT NULL DEFAULT false,
    "triggeredMicrolesson" BOOLEAN NOT NULL DEFAULT false,
    "lastReviewedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChessScoreSnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "total" INTEGER NOT NULL,
    "components" JSONB NOT NULL,
    "weightsUsed" JSONB NOT NULL,
    "bottleneck" TEXT,
    "strength" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChessScoreSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "estimated" JSONB NOT NULL,
    "ratingBand" TEXT NOT NULL,
    "reliable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiagnosticResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Streak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "longest" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TIMESTAMP(3),
    "freezesLeft" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "Streak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FocusState" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 100,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FocusState_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "XPEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "decayApplied" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XPEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coins" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "Quest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "season" INTEGER NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueEntry" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LeagueEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "id" TEXT NOT NULL,
    "aId" TEXT NOT NULL,
    "bId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubMember" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',

    CONSTRAINT "ClubMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "userColor" TEXT NOT NULL,
    "opponent" TEXT NOT NULL,
    "timeControl" TEXT,
    "result" TEXT,
    "finalFen" TEXT,
    "pgn" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameMove" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "ply" INTEGER NOT NULL,
    "san" TEXT NOT NULL,
    "fenAfter" TEXT NOT NULL,
    "clockMs" INTEGER,

    CONSTRAINT "GameMove_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportedPGN" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rawPgn" TEXT NOT NULL,
    "gamesFound" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportedPGN_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameAnalysis" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "humanStageCompleted" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT,
    "threeDecisions" JSONB,
    "learning" TEXT,
    "recurringError" TEXT,
    "scoreImpact" INTEGER,
    "transferredSkillIds" TEXT[],
    "engineDepth" INTEGER,
    "analyzedAt" TIMESTAMP(3),

    CONSTRAINT "GameAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CriticalMoment" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "ply" INTEGER NOT NULL,
    "fen" TEXT NOT NULL,
    "playedSan" TEXT NOT NULL,
    "bestSan" TEXT,
    "cpBefore" INTEGER,
    "cpAfter" INTEGER,
    "humanCandidates" TEXT[],
    "humanEval" TEXT,
    "humanTimeSec" INTEGER,
    "humanEmotion" TEXT,
    "skillId" TEXT,

    CONSTRAINT "CriticalMoment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ErrorClassification" (
    "id" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "ply" INTEGER NOT NULL,
    "cause" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT NOT NULL,
    "recurrence" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ErrorClassification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repertoire" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "Repertoire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpeningLine" (
    "id" TEXT NOT NULL,
    "repertoireId" TEXT NOT NULL,
    "eco" TEXT,
    "name" TEXT NOT NULL,
    "pgn" TEXT NOT NULL,
    "finalFen" TEXT NOT NULL,
    "plan" TEXT,
    "recallScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "OpeningLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tournament" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "federation" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "timeControl" TEXT,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentResult" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "points" DOUBLE PRECISION NOT NULL,
    "games" INTEGER NOT NULL,
    "performance" INTEGER,
    "ratingChange" INTEGER,
    "normAchieved" TEXT,

    CONSTRAINT "TournamentResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coach" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bio" TEXT,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachStudent" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "groupName" TEXT,

    CONSTRAINT "CoachStudent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "exerciseIds" TEXT[],
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "renewsAt" TIMESTAMP(3),

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Experiment" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "hypothesis" TEXT NOT NULL,
    "primaryMetric" TEXT NOT NULL,
    "variants" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Experiment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rollout" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentReview" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "sessionId" TEXT,
    "props" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "World_slug_key" ON "World"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_slug_key" ON "Unit"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SkillDependency_skillId_prerequisiteId_key" ON "SkillDependency"("skillId", "prerequisiteId");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_slug_key" ON "Lesson"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_slug_key" ON "Exercise"("slug");

-- CreateIndex
CREATE INDEX "Exercise_reviewState_idx" ON "Exercise"("reviewState");

-- CreateIndex
CREATE INDEX "Exercise_type_difficulty_idx" ON "Exercise"("type", "difficulty");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_userId_createdAt_idx" ON "ExerciseAttempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_userId_exerciseId_idx" ON "ExerciseAttempt"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "SkillMastery_userId_value_idx" ON "SkillMastery"("userId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "SkillMastery_userId_skillId_key" ON "SkillMastery"("userId", "skillId");

-- CreateIndex
CREATE INDEX "ReviewSchedule_userId_dueAt_idx" ON "ReviewSchedule"("userId", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewSchedule_userId_scope_skillId_exerciseId_key" ON "ReviewSchedule"("userId", "scope", "skillId", "exerciseId");

-- CreateIndex
CREATE INDEX "ChessScoreSnapshot_userId_createdAt_idx" ON "ChessScoreSnapshot"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Streak_userId_key" ON "Streak"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FocusState_userId_key" ON "FocusState"("userId");

-- CreateIndex
CREATE INDEX "XPEvent_userId_createdAt_idx" ON "XPEvent"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_userId_code_key" ON "Achievement"("userId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "League_code_key" ON "League"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueEntry_leagueId_userId_key" ON "LeagueEntry"("leagueId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_aId_bId_key" ON "Friendship"("aId", "bId");

-- CreateIndex
CREATE UNIQUE INDEX "Club_slug_key" ON "Club"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ClubMember_clubId_userId_key" ON "ClubMember"("clubId", "userId");

-- CreateIndex
CREATE INDEX "Game_userId_startedAt_idx" ON "Game"("userId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "GameMove_gameId_ply_key" ON "GameMove"("gameId", "ply");

-- CreateIndex
CREATE UNIQUE INDEX "GameAnalysis_gameId_key" ON "GameAnalysis"("gameId");

-- CreateIndex
CREATE INDEX "ErrorClassification_cause_idx" ON "ErrorClassification"("cause");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentResult_tournamentId_userId_key" ON "TournamentResult"("tournamentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Coach_userId_key" ON "Coach"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CoachStudent_coachId_studentId_key" ON "CoachStudent"("coachId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Experiment_key_key" ON "Experiment"("key");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_key" ON "FeatureFlag"("key");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_name_createdAt_idx" ON "AnalyticsEvent"("name", "createdAt");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "World" ADD CONSTRAINT "World_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "World"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillDependency" ADD CONSTRAINT "SkillDependency_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillDependency" ADD CONSTRAINT "SkillDependency_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSkill" ADD CONSTRAINT "ExerciseSkill_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSkill" ADD CONSTRAINT "ExerciseSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttempt" ADD CONSTRAINT "ExerciseAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttempt" ADD CONSTRAINT "ExerciseAttempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillMastery" ADD CONSTRAINT "SkillMastery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillMastery" ADD CONSTRAINT "SkillMastery_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChessScoreSnapshot" ADD CONSTRAINT "ChessScoreSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosticResult" ADD CONSTRAINT "DiagnosticResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Streak" ADD CONSTRAINT "Streak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusState" ADD CONSTRAINT "FocusState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XPEvent" ADD CONSTRAINT "XPEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quest" ADD CONSTRAINT "Quest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueEntry" ADD CONSTRAINT "LeagueEntry_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueEntry" ADD CONSTRAINT "LeagueEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_aId_fkey" FOREIGN KEY ("aId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_bId_fkey" FOREIGN KEY ("bId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameMove" ADD CONSTRAINT "GameMove_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImportedPGN" ADD CONSTRAINT "ImportedPGN_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameAnalysis" ADD CONSTRAINT "GameAnalysis_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriticalMoment" ADD CONSTRAINT "CriticalMoment_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "GameAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriticalMoment" ADD CONSTRAINT "CriticalMoment_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorClassification" ADD CONSTRAINT "ErrorClassification_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "GameAnalysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repertoire" ADD CONSTRAINT "Repertoire_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpeningLine" ADD CONSTRAINT "OpeningLine_repertoireId_fkey" FOREIGN KEY ("repertoireId") REFERENCES "Repertoire"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentResult" ADD CONSTRAINT "TournamentResult_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentResult" ADD CONSTRAINT "TournamentResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach" ADD CONSTRAINT "Coach_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachStudent" ADD CONSTRAINT "CoachStudent_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachStudent" ADD CONSTRAINT "CoachStudent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentReview" ADD CONSTRAINT "ContentReview_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
