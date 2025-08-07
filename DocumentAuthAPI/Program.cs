using Backend.Data;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
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
        .Replace("\r", "")           // Carriage return
        .Replace("\n", "")           // Line feed
        .Replace("\t", "")           // Tab
        .Replace("\0", "")           // Null character
        .Replace("\u00A0", " ")      // Non-breaking space
        .Replace("\u200B", "")       // Zero-width space
        .Replace("\u200C", "")       // Zero-width non-joiner
        .Replace("\u200D", "")       // Zero-width joiner
        .Replace("\uFEFF", "")       // Byte Order Mark (BOM)
        .Replace("\u2028", "")       // Line separator
        .Replace("\u2029", "");      // Paragraph separator
    
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
    // Log all environment variables that contain "Connection" or "Database"
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
        try
        {
            options.UseNpgsql(connectionString);
            Console.WriteLine("[DEBUG] PostgreSQL options configured successfully");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] Failed to configure PostgreSQL options: {ex.Message}");
            throw;
        }
    }
    else if (!string.IsNullOrEmpty(connectionString) && connectionString.Contains("Server="))
    {
        Console.WriteLine("[INFO] Using SQL Server database");
        options.UseSqlServer(connectionString);
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

// CORS Policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
    options.AddPolicy("ProductionCors", policy =>
    {
        policy.WithOrigins(
            "http://localhost:3000",
            "http://localhost:5173",
            "https://your-frontend-app.vercel.app"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

var app = builder.Build();

// Choose CORS based on environment
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors("AllowAll");
}
else
{
    app.UseCors("ProductionCors");
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

// Enhanced database migration with detailed error logging
using (var scope = app.Services.CreateScope())
{
    try
    {
        Console.WriteLine("[INFO] Starting database connection test and migration...");
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        // Test the connection first with detailed logging
        Console.WriteLine("[DEBUG] Testing database connection...");
        Console.WriteLine($"[DEBUG] Using connection string length: {connectionString?.Length ?? 0}");
        
        var canConnect = await context.Database.CanConnectAsync();
        Console.WriteLine($"[DEBUG] Database connection test result: {canConnect}");
        
        if (canConnect)
        {
            Console.WriteLine("[DEBUG] Connection successful, applying migrations...");
            context.Database.Migrate();
            Console.WriteLine("[INFO] ✅ Database migration completed successfully!");
        }
        else
        {
            Console.WriteLine("[ERROR] ❌ Cannot connect to database - connection test failed");
        }
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Database connection or migration failed");
        Console.WriteLine($"[ERROR] ❌ Database error: {ex.Message}");
        Console.WriteLine($"[ERROR] Exception type: {ex.GetType().Name}");
        Console.WriteLine($"[ERROR] Stack trace: {ex.StackTrace}");
        
        // Log inner exception if present
        if (ex.InnerException != null)
        {
            Console.WriteLine($"[ERROR] Inner exception: {ex.InnerException.Message}");
        }
        
        // Don't throw - let the app start but log the error clearly
    }
}

Console.WriteLine("[INFO] 🚀 Starting DocumentAuthAPI server...");
app.Run();
