/*
  Script SQL Server (AuthDB + tabla Users)
  Ejecuta esto en tu instancia SQL Server / Azure SQL.
  Nota: En Azure SQL NO podés hacer CREATE DATABASE desde la misma conexión si no tenés permisos.
*/

-- (Opcional) Crear base de datos local
IF DB_ID('AuthDB') IS NULL
BEGIN
  CREATE DATABASE AuthDB;
END
GO

USE AuthDB;
GO

IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(120) NOT NULL,
    email NVARCHAR(200) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_Users_created_at DEFAULT SYSUTCDATETIME()
  );
END
GO
