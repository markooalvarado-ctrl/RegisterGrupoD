# node-auth-srs (Express + SQL Server)

Proyecto mínimo con:
- Registro de usuario
- Login
- Sesión (express-session)
- SQL Server (mssql)
- Vistas EJS + Bootstrap

## 1) Crear DB y tabla
Ejecuta: `sql/01_create_db_and_table.sql` en tu SQL Server.

## 2) Configurar .env
Copia `.env.example` a `.env` y ajusta credenciales.

## 3) Instalar dependencias
```bash
npm install
```

## 4) Ejecutar
```bash
npm run dev
# o
npm start
```

Abre:
- http://localhost:3000/register
- http://localhost:3000/login
