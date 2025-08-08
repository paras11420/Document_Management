using Backend.Data;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Collections;

var builder = WebApplication.CreateBuilder(args);

// --- Advanced Connection String DEBUG with Character Analysis ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

Console.WriteLine($"[DEBUG] Raw connection string: '{connectionString}'");
Console.WriteLine($"[DEBUG] Length: {connectionString?.Length ?? 0}");
Console.WriteLine($"[DEBUG] Is null or empty: {string.IsNullOrWhiteSpace(connectionString)}");

// Analyze the first 15 characters for invisible characters
if (!string.IsNullOrEmpty(connectionString))
{
    Console.WriteLine("[DEBUG] Character analysis (first 15 chars):");
    for (int i = 0; i < Math.Min(15, connectionString.Length); i++)
    {
        char c = connectionString[i];
        int ascii = (int)c;
        Console.WriteLine($"[DEBUG] Index {i}: '{c}' (ASCII: {ascii})");
    }
    
    // Aggressively clean the connection string of ALL invisible characters
    var originalLength = connectionString.Length;
    connectionString = connectionString.Trim()
        .Replace("\r", "")
        .Replace("\n", "")
        .Replace("\t", "")
        .Replace("\0", "")
        .Replace("\u00A0", " ")
        .Replace("\u200B", "")
        .Replace("\u200C", "")
        .Replace("\u200D", "")
        .Replace("\uFEFF", "")
        .Replace("\u2028", "")
        .Replace("\u2029", "");
    
    Console.WriteLine($"[DEBUG] Original length: {originalLength}, Cleaned length: {connectionString.Length}");
    Console.WriteLine($"[DEBUG] Characters removed: {originalLength - connectionString.Length}");
}

Console.WriteLine($"[DEBUG] Cleaned connection string: '{connectionString}'");

// Check all configuration sources
var allKeys = builder.Configuration.AsEnumerable().Where(k => k.Key.Contains("Connection"));
Console.WriteLine($"[DEBUG] All connection-related config keys:");
foreach (var kvp in allKeys)
{
    Console.WriteLine($"  {kvp.Key} = {kvp.Value}");
}

// Check environment variables directly
var envVar = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
Console.WriteLine($"[DEBUG] Direct env var: '{envVar}'");
Console.WriteLine($"[DEBUG] Direct env var length: {envVar?.Length ?? 0}");

if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.WriteLine("[ERROR] Connection string is NULL or EMPTY. Verify your ConnectionStrings__DefaultConnection environment variable in Render!");
    Console.WriteLine("[DEBUG] Environment variables containing 'Connection' or 'Database':");
    foreach (DictionaryEntry env in Environment.GetEnvironmentVariables())
    {
        var key = env.Key?.ToString() ?? "";
        if (key.Contains("Connection", StringComparison.OrdinalIgnoreCase) || 
            key.Contains("Database", StringComparison.OrdinalIgnoreCase))
        {
            Console.WriteLine($"  {key} = {env.Value}");
        }
    }
}

// --- Database Configuration with Enhanced Error Handling ---
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (!string.IsNullOrEmpty(connectionString) &&
        (connectionString.Contains("postgresql") || connectionString.Contains("postgres")))
    {
        Console.WriteLine("[INFO] Using PostgreSQL database");
        options.UseNpgsql(connectionString, npgsqlOptions =>
        {
            npgsqlOptions.CommandTimeout(30);
            npgsqlOptions.EnableRetryOnFailure(
                maxRetryCount: 3,
                maxRetryDelay: TimeSpan.FromSeconds(10),
                errorCodesToAdd: null);
        })
        // Suppress pending model changes warning so startup won't fail
        .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
    }
    else if (!string.IsNullOrEmpty(connectionString) && connectionString.Contains("Server="))
    {
        Console.WriteLine("[INFO] Using SQL Server database");
        options.UseSqlServer(connectionString)
               .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
    }
    else
    {
        Console.WriteLine("[ERROR] No valid database connection string found. App cannot start.");
        Console.WriteLine($"[ERROR] Connection string value: '{connectionString}'");
        throw new Exception("No valid database connection string found. App cannot start.");
    }
});

// Register custom services
builder.Services.AddScoped<IDocumentService, DocumentService>();

// Add Controllers and Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Authentication Configuration
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JWT:Issuer"],
            ValidAudience = builder.Configuration["JWT:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"] ?? "default-secret-key"))
        };
    });

// CORS Policy - Updated to allow your frontend origins
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "https://document-management-system-two.vercel.app/"  // Replace with your actual Vercel URL when deployed
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

var app = builder.Build();

// Use CORS middleware before authentication
app.UseCors("AllowFrontend");

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts();
}

// Auth middleware
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Health endpoint
app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName
}));

// API info endpoint
app.MapGet("/", () => Results.Ok(new
{
    api = "DocumentAuthAPI",
    version = "1.0",
    status = "running",
    endpoints = new[]
    {
        "/health - Health check",
        "/swagger - API documentation",
        "/api/auth/login - User login",
        "/api/auth/register - User registration",
        "/api/documents - Document management"
    }
}));

// Proper Docker/cloud port binding
var port = Environment.GetEnvironmentVariable("PORT") ?? "10000";
app.Urls.Add($"http://0.0.0.0:{port}");

// Run pending migrations at startup without failing on pending model changes
using (var scope = app.Services.CreateScope())
{
    try
    {
        Console.WriteLine("[INFO] Starting database migration...");
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
        Console.WriteLine("[INFO] ✅ Database migration completed (warnings suppressed).");
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
        Console.WriteLine($"[ERROR] Database migration failed: {ex.Message}");
        // App will continue to start despite pending model changes
    }
}

Console.WriteLine("[INFO] 🚀 Starting DocumentAuthAPI server...");
app.Run();
