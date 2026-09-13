IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE TABLE [AspNetRoles] (
        [Id] nvarchar(450) NOT NULL,
        [Name] nvarchar(256) NULL,
        [NormalizedName] nvarchar(256) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetRoles] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE TABLE [AspNetUsers] (
        [Id] nvarchar(450) NOT NULL,
        [FullName] nvarchar(max) NOT NULL,
        [AvatarUrl] nvarchar(max) NULL,
        [Specialization] nvarchar(max) NULL,
        [GoogleSubjectId] nvarchar(max) NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [LastLoginAt] datetime2 NULL,
        [UserName] nvarchar(256) NULL,
        [NormalizedUserName] nvarchar(256) NULL,
        [Email] nvarchar(256) NULL,
        [NormalizedEmail] nvarchar(256) NULL,
        [EmailConfirmed] bit NOT NULL,
        [PasswordHash] nvarchar(max) NULL,
        [SecurityStamp] nvarchar(max) NULL,
        [ConcurrencyStamp] nvarchar(max) NULL,
        [PhoneNumber] nvarchar(max) NULL,
        [PhoneNumberConfirmed] bit NOT NULL,
        [TwoFactorEnabled] bit NOT NULL,
        [LockoutEnd] datetimeoffset NULL,
        [LockoutEnabled] bit NOT NULL,
        [AccessFailedCount] int NOT NULL,
        CONSTRAINT [PK_AspNetUsers] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE TABLE [AspNetRoleClaims] (
        [Id] int NOT NULL IDENTITY,
        [RoleId] nvarchar(450) NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetRoleClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetRoleClaims_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE TABLE [AspNetUserClaims] (
        [Id] int NOT NULL IDENTITY,
        [UserId] nvarchar(450) NOT NULL,
        [ClaimType] nvarchar(max) NULL,
        [ClaimValue] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetUserClaims] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AspNetUserClaims_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE TABLE [AspNetUserLogins] (
        [LoginProvider] nvarchar(450) NOT NULL,
        [ProviderKey] nvarchar(450) NOT NULL,
        [ProviderDisplayName] nvarchar(max) NULL,
        [UserId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_AspNetUserLogins] PRIMARY KEY ([LoginProvider], [ProviderKey]),
        CONSTRAINT [FK_AspNetUserLogins_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE TABLE [AspNetUserRoles] (
        [UserId] nvarchar(450) NOT NULL,
        [RoleId] nvarchar(450) NOT NULL,
        CONSTRAINT [PK_AspNetUserRoles] PRIMARY KEY ([UserId], [RoleId]),
        CONSTRAINT [FK_AspNetUserRoles_AspNetRoles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [AspNetRoles] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AspNetUserRoles_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE TABLE [AspNetUserTokens] (
        [UserId] nvarchar(450) NOT NULL,
        [LoginProvider] nvarchar(450) NOT NULL,
        [Name] nvarchar(450) NOT NULL,
        [Value] nvarchar(max) NULL,
        CONSTRAINT [PK_AspNetUserTokens] PRIMARY KEY ([UserId], [LoginProvider], [Name]),
        CONSTRAINT [FK_AspNetUserTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE TABLE [Classes] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(max) NOT NULL,
        [Code] nvarchar(450) NOT NULL,
        [Description] nvarchar(max) NULL,
        [FixedLinkToken] nvarchar(max) NOT NULL,
        [IsArchived] bit NOT NULL,
        [TeacherId] nvarchar(450) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Classes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Classes_AspNetUsers_TeacherId] FOREIGN KEY ([TeacherId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE TABLE [RefreshTokens] (
        [Id] int NOT NULL IDENTITY,
        [Token] nvarchar(max) NOT NULL,
        [UserId] nvarchar(450) NOT NULL,
        [ExpiresAt] datetime2 NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [CreatedByIp] nvarchar(max) NULL,
        [RevokedAt] datetime2 NULL,
        [RevokedByIp] nvarchar(max) NULL,
        [ReplacedByToken] nvarchar(max) NULL,
        CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_RefreshTokens_AspNetUsers_UserId] FOREIGN KEY ([UserId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE TABLE [VocabularySets] (
        [Id] int NOT NULL IDENTITY,
        [Title] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NULL,
        [Level] nvarchar(max) NOT NULL,
        [IsPublic] bit NOT NULL,
        [IsArchived] bit NOT NULL,
        [TeacherId] nvarchar(450) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_VocabularySets] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_VocabularySets_AspNetUsers_TeacherId] FOREIGN KEY ([TeacherId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE TABLE [ClassMembers] (
        [Id] int NOT NULL IDENTITY,
        [ClassId] int NOT NULL,
        [StudentId] nvarchar(450) NOT NULL,
        [JoinedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_ClassMembers] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ClassMembers_AspNetUsers_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_ClassMembers_Classes_ClassId] FOREIGN KEY ([ClassId]) REFERENCES [Classes] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE TABLE [ClassLessons] (
        [Id] int NOT NULL IDENTITY,
        [ClassId] int NOT NULL,
        [VocabularySetId] int NOT NULL,
        [IsPinned] bit NOT NULL,
        [IsHidden] bit NOT NULL,
        [OrderIndex] int NOT NULL,
        [AddedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_ClassLessons] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ClassLessons_Classes_ClassId] FOREIGN KEY ([ClassId]) REFERENCES [Classes] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ClassLessons_VocabularySets_VocabularySetId] FOREIGN KEY ([VocabularySetId]) REFERENCES [VocabularySets] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE TABLE [Tests] (
        [Id] int NOT NULL IDENTITY,
        [Title] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NULL,
        [TeacherId] nvarchar(450) NOT NULL,
        [VocabularySetId] int NOT NULL,
        [ClassId] int NULL,
        [EnabledTypes] nvarchar(max) NOT NULL,
        [TotalQuestions] int NOT NULL,
        [TimeLimitMinutes] int NULL,
        [PassScore] decimal(4,1) NOT NULL,
        [IsArchived] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Tests] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Tests_AspNetUsers_TeacherId] FOREIGN KEY ([TeacherId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Tests_Classes_ClassId] FOREIGN KEY ([ClassId]) REFERENCES [Classes] ([Id]) ON DELETE SET NULL,
        CONSTRAINT [FK_Tests_VocabularySets_VocabularySetId] FOREIGN KEY ([VocabularySetId]) REFERENCES [VocabularySets] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE TABLE [VocabularyItems] (
        [Id] int NOT NULL IDENTITY,
        [VocabularySetId] int NOT NULL,
        [Word] nvarchar(max) NOT NULL,
        [Meaning] nvarchar(max) NOT NULL,
        [IPA] nvarchar(max) NULL,
        [Example] nvarchar(max) NULL,
        [OrderIndex] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_VocabularyItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_VocabularyItems_VocabularySets_VocabularySetId] FOREIGN KEY ([VocabularySetId]) REFERENCES [VocabularySets] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE TABLE [TestAttempts] (
        [Id] int NOT NULL IDENTITY,
        [TestId] int NOT NULL,
        [StudentId] nvarchar(450) NOT NULL,
        [Score] decimal(4,1) NOT NULL,
        [CorrectCount] int NOT NULL,
        [TotalQuestions] int NOT NULL,
        [DurationSeconds] int NOT NULL,
        [StartedAt] datetime2 NOT NULL,
        [SubmittedAt] datetime2 NULL,
        CONSTRAINT [PK_TestAttempts] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_TestAttempts_AspNetUsers_StudentId] FOREIGN KEY ([StudentId]) REFERENCES [AspNetUsers] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_TestAttempts_Tests_TestId] FOREIGN KEY ([TestId]) REFERENCES [Tests] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE TABLE [AttemptAnswers] (
        [Id] int NOT NULL IDENTITY,
        [TestAttemptId] int NOT NULL,
        [VocabularyItemId] int NULL,
        [QuestionType] nvarchar(max) NOT NULL,
        [QuestionPrompt] nvarchar(max) NOT NULL,
        [UserAnswer] nvarchar(max) NOT NULL,
        [CorrectAnswer] nvarchar(max) NOT NULL,
        [IsCorrect] bit NOT NULL,
        CONSTRAINT [PK_AttemptAnswers] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_AttemptAnswers_TestAttempts_TestAttemptId] FOREIGN KEY ([TestAttemptId]) REFERENCES [TestAttempts] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_AttemptAnswers_VocabularyItems_VocabularyItemId] FOREIGN KEY ([VocabularyItemId]) REFERENCES [VocabularyItems] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_AspNetRoleClaims_RoleId] ON [AspNetRoleClaims] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [RoleNameIndex] ON [AspNetRoles] ([NormalizedName]) WHERE [NormalizedName] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_AspNetUserClaims_UserId] ON [AspNetUserClaims] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_AspNetUserLogins_UserId] ON [AspNetUserLogins] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_AspNetUserRoles_RoleId] ON [AspNetUserRoles] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [EmailIndex] ON [AspNetUsers] ([NormalizedEmail]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    EXEC(N'CREATE UNIQUE INDEX [UserNameIndex] ON [AspNetUsers] ([NormalizedUserName]) WHERE [NormalizedUserName] IS NOT NULL');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_AttemptAnswers_TestAttemptId] ON [AttemptAnswers] ([TestAttemptId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_AttemptAnswers_VocabularyItemId] ON [AttemptAnswers] ([VocabularyItemId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Classes_Code] ON [Classes] ([Code]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_Classes_TeacherId] ON [Classes] ([TeacherId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_ClassLessons_ClassId] ON [ClassLessons] ([ClassId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_ClassLessons_VocabularySetId] ON [ClassLessons] ([VocabularySetId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_ClassMembers_ClassId] ON [ClassMembers] ([ClassId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_ClassMembers_StudentId] ON [ClassMembers] ([StudentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_RefreshTokens_UserId] ON [RefreshTokens] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_TestAttempts_StudentId] ON [TestAttempts] ([StudentId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_TestAttempts_TestId] ON [TestAttempts] ([TestId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_Tests_ClassId] ON [Tests] ([ClassId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_Tests_TeacherId] ON [Tests] ([TeacherId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_Tests_VocabularySetId] ON [Tests] ([VocabularySetId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_VocabularyItems_VocabularySetId] ON [VocabularyItems] ([VocabularySetId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    CREATE INDEX [IX_VocabularySets_TeacherId] ON [VocabularySets] ([TeacherId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260913035928_InitialTeacherSchema'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260913035928_InitialTeacherSchema', N'10.0.12');
END;

COMMIT;
GO

