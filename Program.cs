using BackendScout.Data;
using BackendScout.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using QuestPDF.Infrastructure;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.Extensions.FileProviders;

QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// =======================
// JWT Key (config o fallback)
// =======================
var jwtKey = builder.Configuration["Jwt:Key"] ?? "clave-secreta-super-segura-scout";

// =======================
// Detección de entorno/proveedor DB
// =======================
bool isRailway =
    !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("RAILWAY_ENVIRONMENT")) ||
    !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("RAILWAY_PROJECT_ID"));

bool usePostgres = isRailway || Environment.GetEnvironmentVariable("USE_POSTGRES") == "1";

// =======================
// CORS dinámico
// =======================
string frontendOrigin =
    Environment.GetEnvironmentVariable("FRONTEND_ORIGIN")?.TrimEnd('/') ??
    "http://localhost:5173";

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(frontendOrigin)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// =======================
// Servicios base
// =======================
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddControllersWithViews();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "BackendScout",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Ingrese su token JWT en este formato: Bearer {token}"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// =======================
// Servicios personalizados
// =======================
builder.Services.AddScoped<GrupoScoutService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<UnidadService>();
builder.Services.AddScoped<FichaMedicaService>();
builder.Services.AddScoped<ObjetivoService>();
builder.Services.AddScoped<CargaObjetivosService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<PdfObjetivosService>();
builder.Services.AddScoped<PdfService>();
builder.Services.AddScoped<MensajeService>();
builder.Services.AddScoped<EspecialidadService>();
builder.Services.AddTransient<EspecialidadImporter>();
builder.Services.AddScoped<EventoService>();
builder.Services.AddScoped<DocumentoEventoService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<PasswordResetService>();
builder.Services.AddScoped<RegistroGestionService>();
builder.Services.AddScoped<GestionService>();
builder.Services.AddScoped<MensajeGrupoService>();
builder.Services.AddHostedService<MensajeLimpiezaService>();
builder.Services.AddScoped<DistritoUsuarioService>();
builder.Services.AddScoped<DistritoResumenService>();
builder.Services.AddScoped<NacionalService>();

// =======================
// Base de datos: SQLite local / PostgreSQL en Railway
// =======================
if (usePostgres)
{
    string host = Environment.GetEnvironmentVariable("POSTGRES_HOST") ?? "localhost";
    string db   = Environment.GetEnvironmentVariable("POSTGRES_DB") ?? "scoutdb";
    string user = Environment.GetEnvironmentVariable("POSTGRES_USER") ?? "scoutuser";
    string pass = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD") ?? "scoutpass";
    string portDb = Environment.GetEnvironmentVariable("POSTGRES_PORT") ?? "5432";

    var pgConn = $"Host={host};Port={portDb};Database={db};Username={user};Password={pass};Pooling=true;";

    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(pgConn));
}
else
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
}

// =======================
// Autenticación JWT
// =======================
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            RoleClaimType = ClaimTypes.Role
        };
    });

// =======================
// Host/puerto
// =======================
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://*:{port}");

var app = builder.Build();

// =======================
// Seed inicial
// =======================
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    SeedData.Inicializar(context);
}

// =======================
// Swagger
// =======================
app.UseSwagger();
app.UseSwaggerUI();

// =======================
// Archivos estáticos
// =======================
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "ArchivosMensajes")),
    RequestPath = "/archivos"
});

// =======================
// CORS
// =======================
app.UseCors("AllowReactApp");

// =======================
// Seguridad
// =======================
app.UseAuthentication();
app.UseAuthorization();

// =======================
// Controladores
// =======================
app.MapControllers();

// =======================
// Migraciones automáticas opcionales
// =======================
if (Environment.GetEnvironmentVariable("APPLY_MIGRATIONS") == "1")
{
    using var scopeMigrate = app.Services.CreateScope();
    var dbCtx = scopeMigrate.ServiceProvider.GetRequiredService<AppDbContext>();
    dbCtx.Database.Migrate();
}

app.Run();
