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
    WHERE [MigrationId] = N'20260314160129_InitialCreate'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] int NOT NULL IDENTITY,
        [Username] nvarchar(255) NOT NULL,
        [Email] nvarchar(max) NOT NULL,
        [PhoneNumber] nvarchar(max) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [WebpageUniqueId] uniqueidentifier NOT NULL,
        [CreatedDate] datetime2 NOT NULL,
        [UpdatedDate] datetime2 NOT NULL,
        [LastLoginDate] datetime2 NULL,
        [Address] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314160129_InitialCreate'
)
BEGIN
    CREATE TABLE [Webpages] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [HeaderInfo] nvarchar(max) NOT NULL,
        [MenuInfo] nvarchar(max) NOT NULL,
        [HomeSection] nvarchar(max) NOT NULL,
        [AboutUsSection] nvarchar(max) NOT NULL,
        [ServicesProductsSection] nvarchar(max) NOT NULL,
        [TeamsSection] nvarchar(max) NOT NULL,
        [ContactUsSection] nvarchar(max) NOT NULL,
        [FooterInfo] nvarchar(max) NOT NULL,
        [AdditionalSections] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_Webpages] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Webpages_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314160129_InitialCreate'
)
BEGIN
    CREATE TABLE [Products] (
        [Id] int NOT NULL IDENTITY,
        [ProductId] nvarchar(max) NOT NULL,
        [WebpageId] int NOT NULL,
        [ProductName] nvarchar(max) NOT NULL,
        [ProductCategory] nvarchar(max) NOT NULL,
        [Price] decimal(18,2) NOT NULL,
        [AvailableQuantity] int NOT NULL,
        [SoldQuantity] int NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [Rating] decimal(3,2) NOT NULL,
        [OtherSpec] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_Products] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Products_Webpages_WebpageId] FOREIGN KEY ([WebpageId]) REFERENCES [Webpages] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314160129_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Products_WebpageId] ON [Products] ([WebpageId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314160129_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Webpages_UserId] ON [Webpages] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260314160129_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260314160129_InitialCreate', N'10.0.5');
END;

COMMIT;
GO

