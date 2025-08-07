using Backend.Data;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- Enhanced Connection String DEBUG/Logging ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"[DEBUG] Connection string from config: '{connectionString}'");
Console.WriteLine($"[DEBUG] Connection string length: {connectionString?.Length ?? 0}");
Console.WriteLine($"[DEBUG] Is null or empty: {string.IsNullOrWhiteSpace(connectionString)}");

// Check all configuration sources
var allKeys = builder.Configuration.AsEnumerable().Where(k => k.Key.Contains("Connection"));
Console.WriteLine($"[DEBUG] All connection-related config keys:");
foreach (var kvp in allKeys)
{
    Console.WriteLine($"  {kvp.Key} = {kvp.Value}");
}

// Check environment variables directly
Console.WriteLine($"[DEBUG] Direct env var check: '{Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")}'");

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

// --- Proper Database Configuration (PostgreSQL/SQL Server dual support) ---
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (!string.IsNullOrEmpty(connectionString) &&
        (connectionString.Contains("postgresql") || connectionString.Contains("postgres")))
    {
        Console.WriteLine("[INFO] Using PostgreSQL database");
        options.UseNpgsql(connectionString);
    }
    else if (!string.IsNullOrEmpty(connectionString) && connectionString.Contains("Server="))
    {
        Console.WriteLine("[INFO] Using SQL Server database");
        options.UseSqlServer(connectionString);
    }
    else
    {
        Console.WriteLine("[ERROR] No valid database connection string found. App cannot start.");
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

// Proper Docker/cloud port binding
var port = Environment.GetEnvironmentVariable("PORT") ?? "10000";
app.Urls.Add($"http://0.0.0.0:{port}");

// Run pending migrations at startup
using (var scope = app.Services.CreateScope())
{
    try
    {
        Console.WriteLine("[INFO] Starting database migration...");
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        // Test the connection first
        Console.WriteLine("[DEBUG] Testing database connection...");
        await context.Database.CanConnectAsync();
        Console.WriteLine("[DEBUG] Database connection test successful");
        
        context.Database.Migrate();
        Console.WriteLine("[INFO] Database migration successful.");
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
        Console.WriteLine($"[ERROR] Database migration failed: {ex.Message}");
        Console.WriteLine($"[ERROR] Stack trace: {ex.StackTrace}");
        
        // Don't throw - let the app start but log the error clearly
    }
}

app.Run();
